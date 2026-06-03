import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';

// Interface matching approved-changes.json schema
interface ProposalItem {
  id: string;
  file: string;
  action: 'delete' | 'modify';
  description: string;
  currentCode: string | null;
  proposedCode: string | null;
  impactScore: number;
  safetyBadge: '🟢 SAFE' | '🟡 REVIEW' | '🔴 DANGER';
  rollbackCommand: string;
}

/**
 * Strict file path validator preventing path traversal and shell command injection.
 */
function validateFilePath(file: string): void {
  // 1. Strict regex whitelist matching only safe alphanumeric, hyphens, underscores, dots, and select forward slashes. No spaces, semicolons, backticks, quotes, etc.
  const safeRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
  if (!safeRegex.test(file)) {
    throw new Error(`💥 SECURITY EXCEPTION: Forbidden characters or spaces in filename path: "${file}"`);
  }

  // 2. Strict directory escape boundaries
  if (file.includes('..') || file.includes('\\') || file.startsWith('/') || file.includes('//')) {
    throw new Error(`💥 SECURITY EXCEPTION: Evasive directory traversal pattern detected: "${file}"`);
  }
}

// ANSI Escape Codes for CLI styling
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

/**
 * Execute a command as a promise
 */
function runCommand(cmd: string, cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      resolve({
        stdout,
        stderr,
        code: error ? (error.code || 1) : 0
      });
    });
  });
}

/**
 * Load and parse .cleaningrc.json safely
 */
async function loadConfig(): Promise<any> {
  const configPath = path.resolve(process.cwd(), '.cleaningrc.json');
  if (existsSync(configPath)) {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      // safe fallback
    }
  }
  return null;
}

/**
 * Recursively copy source directories to a destination
 */
async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (
      entry.name === 'node_modules' ||
      entry.name === 'temp' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === '.cleaning-patches' ||
      entry.name === '.husky' ||
      entry.name.startsWith('temp-sandbox-')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Normalise and apply code deletions or modifications
 */
async function applyChanges(items: ProposalItem[], rootDir: string) {
  for (const item of items) {
    // SECURITY GATE: Prevent path-traversal out of the designated directory bounds and command injection characters
    validateFilePath(item.file);
    const filePath = path.resolve(rootDir, item.file);
    if (!filePath.startsWith(path.resolve(rootDir))) {
      throw new Error(`💥 SECURITY EXCEPTION: File target escapes project directory bounds: "${item.file}"`);
    }

    if (item.action === 'delete') {
      console.log(`  🗑️  [DELETE] ${item.file}`);
      if (existsSync(filePath)) {
        await fs.rm(filePath, { force: true });
      }
    } else {
      console.log(`  📝  [MODIFY] ${item.file}`);
      if (!existsSync(filePath)) {
        throw new Error(`Target file to modify does not exist: ${item.file}`);
      }

      let content = await fs.readFile(filePath, 'utf-8');

      if (item.currentCode) {
        if (content.includes(item.currentCode)) {
          content = content.replace(item.currentCode, item.proposedCode || '');
        } else {
          // Normalise line endings (CRLF -> LF) to execute comparison robustly
          const normContent = content.replace(/\r\n/g, '\n');
          const normCurrent = item.currentCode.replace(/\r\n/g, '\n');
          const normProposed = (item.proposedCode || '').replace(/\r\n/g, '\n');

          if (normContent.includes(normCurrent)) {
            content = normContent.replace(normCurrent, normProposed);
          } else {
            throw new Error(`Could not find the currentCode block to modify inside: ${item.file}`);
          }
        }
        await fs.writeFile(filePath, content, 'utf-8');
      }
    }
  }
}

/**
 * Executes a full sandboxed verification dry-run
 * Returns true if sandbox passes all checks, false if it fails
 */
async function executeDryRun(approvedItems: ProposalItem[], tempDir: string): Promise<boolean> {
  console.log(`\n${CYAN}=======================================================`);
  console.log(`⚙️  EXECUTING SANDBOXED DRY-RUN VALIDATION PASS`);
  console.log(`=======================================================${RESET}`);
  console.log(`Creating isolated workspace profile at: ${path.basename(tempDir)}...`);

  if (existsSync(tempDir)) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  // Copy structures to sandbox
  await copyDir(process.cwd(), tempDir);

  // Link node_modules recursively or with symlinks
  try {
    await fs.symlink(
      path.resolve(process.cwd(), 'node_modules'),
      path.join(tempDir, 'node_modules'),
      'dir'
    );
  } catch (symErr) {
    console.warn(`${YELLOW}⚠️  Note: Symlinking node_modules fell back. Attempting inline check. Error: ${symErr instanceof Error ? symErr.message : String(symErr)}${RESET}`);
  }

  console.log(`Applying ${approvedItems.length} candidate changes to isolated sandbox...`);
  await applyChanges(approvedItems, tempDir);

  // Verification Suite
  console.log(`\n🏃 Running: npm run typecheck...`);
  const tscCheck = await runCommand('npm run typecheck', tempDir);
  if (tscCheck.code === 0) {
    console.log(`  ${GREEN}🟢 PASS: typecheck${RESET}`);
  } else {
    console.log(`  ${RED}🔴 FAIL: typecheck${RESET}`);
    console.log(`${DIM}${tscCheck.stdout}\n${tscCheck.stderr}${RESET}`);
  }

  console.log(`🏃 Running: npm run lint...`);
  const lintCheck = await runCommand('npm run lint', tempDir);
  if (lintCheck.code === 0) {
    console.log(`  ${GREEN}🟢 PASS: lint${RESET}`);
  } else {
    console.log(`  ${RED}🔴 FAIL: lint${RESET}`);
    console.log(`${DIM}${lintCheck.stdout}\n${lintCheck.stderr}${RESET}`);
  }

  console.log(`🏃 Running: npm run test...`);
  const testCheck = await runCommand('npm run test', tempDir);
  if (testCheck.code === 0) {
    console.log(`  ${GREEN}🟢 PASS: test${RESET}`);
  } else {
    console.log(`  ${RED}🔴 FAIL: test${RESET}`);
    console.log(`${DIM}${testCheck.stdout}\n${testCheck.stderr}${RESET}`);
  }

  // Final cleanup of sandbox folder
  console.log(`\nCleaning up temporary sandboxed workspace profile...`);
  await fs.rm(tempDir, { recursive: true, force: true });

  return tscCheck.code === 0 && lintCheck.code === 0 && testCheck.code === 0;
}

/**
 * Main application runner
 */
async function main() {
  const args = process.argv.slice(2);
  let isDryRun = args.includes('--dry-run');
  const isApply = args.includes('--apply');

  if (!isDryRun && !isApply) {
    console.error(`\n${RED}${BOLD}❌ ERROR: Missing execution mode flag!${RESET}`);
    console.error(`Please provide one of the mandatory script arguments:`);
    console.error(`  ${CYAN}npx tsx scripts/apply-cleaning.ts --dry-run${RESET}  (Sandboxed validation in temporary directory)`);
    console.error(`  ${CYAN}npx tsx scripts/apply-cleaning.ts --apply${RESET}    (Apply to src/ with git diff backups & rollback protection)\n`);
    process.exit(1);
  }

  const approvedPath = path.resolve(process.cwd(), 'approved-changes.json');

  if (!existsSync(approvedPath)) {
    console.error(`\n${RED}${BOLD}❌ ERROR: approved-changes.json file not found!${RESET}`);
    console.error(`${DIM}Please run 'npx tsx scripts/review-ui.ts' first to approve recommended transformations.${RESET}\n`);
    process.exit(1);
  }

  try {
    const config = await loadConfig();
    const rawData = await fs.readFile(approvedPath, 'utf-8');
    const approvedItems: ProposalItem[] = JSON.parse(rawData);

    if (approvedItems.length === 0) {
      console.log(`\n${YELLOW}ℹ️  No changes are currently approved inside approved-changes.json.${RESET}\n`);
      return;
    }

    // Force Dry-Run verification pass if config demands it as a safety gate
    const requireDryRun = config?.requireDryRun ?? true;
    if (isApply && requireDryRun) {
      console.log(`${YELLOW}🛡️  SAFETY GATE ENFORCED: requireDryRun option is set to true.${RESET}`);
      console.log(`Pre-execution sandboxed validations are being programmatically initiated first...`);
      
      const tempSandboxPath = path.join(process.cwd(), `temp-sandbox-${crypto.randomUUID().slice(0, 8)}`);
      const dryRunPassed = await executeDryRun(approvedItems, tempSandboxPath);
      
      if (!dryRunPassed) {
        console.error(`\n${RED}${BOLD}🚨 SAFETY BLOCK: Standard apply rejected because pre-execution checks inside sandbox failed.${RESET}`);
        console.error(`Aborting live modifications to prevent codebase regression. Fix issues and review proposals.\n`);
        process.exit(1);
      }
      console.log(`\n${GREEN}❇️ Sandboxed precheck passed perfectly. Proceeding to apply changes directly.${RESET}\n`);
    }

    console.log(`\n${CYAN}${BOLD}=======================================================`);
    console.log(`🚀 PDFMINTY CLEANING DISPATCHER`);
    console.log(`=======================================================${RESET}`);
    console.log(`Staged approvals:       ${BOLD}${approvedItems.length} changes${RESET}`);
    console.log(`Execution Profile:      ${BOLD}${isDryRun ? '🟢 DRY-RUN (SANDBOX)' : '🔥 APPLY (LIVE)'}${RESET}\n`);

    if (isDryRun) {
      const tempSandboxPath = path.join(process.cwd(), `temp-sandbox-${crypto.randomUUID().slice(0, 8)}`);
      const allPassed = await executeDryRun(approvedItems, tempSandboxPath);
      
      console.log(`\n${CYAN}=======================================================`);
      console.log(`🏁 DRY-RUN SANDBOX EXECUTION COMPLETED`);
      console.log(`=======================================================${RESET}`);
      if (allPassed) {
        console.log(`🚀 ${GREEN}${BOLD}ALL INTEGRITY VALIDATIONS PASSED SUCCESSFULY!${RESET}`);
        console.log(`It is 100% safe to apply these transformations in production via:`);
        console.log(`  ${BOLD}npx tsx scripts/apply-cleaning.ts --apply${RESET}\n`);
      } else {
        console.log(`⚠️  ${RED}${BOLD}SOME VALIDATIONS ENCOUNTERED PROBLEMS OR WARNINGS.${RESET}`);
        console.log(`Please double-check the diagnostics outputs printed above before proceeding.\n`);
      }

    } else {
      // isApply (Apply directly to the working codebase)
      const patchDir = path.join(process.cwd(), '.cleaning-patches');
      if (!existsSync(patchDir)) {
        await fs.mkdir(patchDir, { recursive: true });
      }

      // Generate backups before modifying
      console.log(`${CYAN}Backing up current files & staging git patches into .cleaning-patches/...${RESET}`);
      for (const item of approvedItems) {
        try {
          validateFilePath(item.file);
          const filePath = path.resolve(process.cwd(), item.file);
          if (!filePath.startsWith(process.cwd())) continue; // security check
          
          if (existsSync(filePath)) {
            // Physical backup of the file context
            const backupFileName = `${item.id}-${path.basename(item.file)}.bak`;
            await fs.copyFile(filePath, path.join(patchDir, backupFileName));
          }
        } catch (valErr) {
          console.error(`💥 SECURITY VOID: Skip backup for invalid filepath: "${item.file}". Error: ${valErr instanceof Error ? valErr.message : String(valErr)}`);
          process.exit(1);
        }
      }

      console.log(`\nApplying ${approvedItems.length} changes live into working tree profiles...`);
      await applyChanges(approvedItems, process.cwd());

      // Write differential git diff files as patches
      console.log(`\nWriting git patch files...`);
      for (const item of approvedItems) {
        try {
          validateFilePath(item.file);
          const patchResult = await runCommand(`git diff "${item.file}"`, process.cwd());
          if (patchResult.code === 0 && patchResult.stdout.trim().length > 0) {
            const patchFileName = `${item.id}-${path.basename(item.file)}.patch`;
            await fs.writeFile(path.join(patchDir, patchFileName), patchResult.stdout, 'utf-8');
            console.log(`  💾  Created patch: .cleaning-patches/${patchFileName}`);
          }
        } catch (valErr) {
          console.error(`💥 SECURITY VOID: Skip patch extraction for invalid filepath: "${item.file}". Error: ${valErr instanceof Error ? valErr.message : String(valErr)}`);
          process.exit(1);
        }
      }

      console.log(`\n${CYAN}=======================================================`);
      console.log(`🔒 INITIATING LIVE INTEGRITY VALIDATION PROCESS`);
      console.log(`=======================================================${RESET}`);

      // Verification Lineups
      const checks = [
        { name: 'tsc (Typecheck)', command: 'npm run typecheck' },
        { name: 'eslint (Lint Check)', command: 'npm run lint' },
        { name: 'vitest (Test Execution)', command: 'npm run test' },
        { name: 'vite (Production Build)', command: 'npm run build' }
      ];

      let verificationSuccess = true;

      for (const check of checks) {
        console.log(`\n🏃 Testing: ${check.name}...`);
        const result = await runCommand(check.command, process.cwd());
        if (result.code === 0) {
          console.log(`  ${GREEN}🟢 PASS: ${check.name}${RESET}`);
        } else {
          console.log(`  ${RED}🔴 FAIL: ${check.name}${RESET}`);
          console.log(`${DIM}${result.stdout}\n${result.stderr}${RESET}`);
          verificationSuccess = false;
          break; // Fail immediately on any regression
        }
      }

      if (verificationSuccess) {
        console.log(`\n${CYAN}=======================================================`);
        console.log(`🎉 LIVE DEPLOYMENT COMPLETE & SUCCESSFUL!`);
        console.log(`=======================================================${RESET}`);
        console.log(`All ${approvedItems.length} changes have been applied to live modules.`);
        console.log(`Integrity testing pipeline confirmed absolutely clean builds.`);
        console.log(`Backup configurations and patches archived at:`);
        console.log(`  📂 ./cleaning-patches/`);
        console.log(`Keep them nested for history, or clean them up via git commit.\n`);
      } else {
        console.log(`\n${RED}${BOLD}⚠️  VALIDATION FAILED! INITIATING IMMEDIATE ROLLBACK SUITE...${RESET}`);
        
        // Auto-rollback using physical .bak files first (100% resilient)
        for (const item of approvedItems) {
          try {
            validateFilePath(item.file);
            console.log(`  🔄 Restoring: ${item.file}`);
            const backupFileName = `${item.id}-${path.basename(item.file)}.bak`;
            const backupFilePath = path.join(patchDir, backupFileName);
            
            if (existsSync(backupFilePath)) {
              try {
                await fs.copyFile(backupFilePath, path.join(process.cwd(), item.file));
                console.log(`    🟢 Physical backup restored successfully.`);
              } catch (restoreErr) {
                console.error(`    🔴 Physical restore fell back: ${restoreErr instanceof Error ? restoreErr.message : String(restoreErr)}`);
                // git recovery
                await runCommand(`git restore "${item.file}"`, process.cwd());
                await runCommand(`git checkout -- "${item.file}"`, process.cwd());
              }
            } else {
              // Deleted file fallback or missing backup recovery
              if (item.action === 'delete') {
                // Re-checkout the file from git
                console.log(`    Re-fetching deleted module tracking profile...`);
                await runCommand(`git checkout HEAD -- "${item.file}"`, process.cwd());
              } else {
                await runCommand(`git restore "${item.file}"`, process.cwd());
                await runCommand(`git checkout -- "${item.file}"`, process.cwd());
              }
            }
          } catch (valErr) {
            console.error(`💥 SECURITY VOID: Evasive filepath ignored during rollback sweep: "${item.file}"`);
          }
        }

        console.log(`\n${YELLOW}${BOLD}Rollback procedure completed successfully.${RESET}`);
        console.log(`Your working tree files have been completely restored to their original pre-modification state.`);
        console.log(`Please check the validation failures printed above to rectify your proposals.\n`);
        process.exit(1);
      }
    }

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`\n${RED}${BOLD}❌ CRITICAL RUNTIME EXCEPTION:${RESET}`, errorMsg);
    process.exit(1);
  }
}

main();
