import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';

// ANSI Escape Codes for CLI styling
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';

interface ScanReportItem {
  id?: string;
  file: string;
  type: string;
  confidence?: string;
  description?: string;
  currentCode?: string;
}

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
 * Executes a terminal command as a promise
 */
function runCommand(cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({
        stdout,
        stderr,
        code: error ? (error.code || 1) : 0
      });
    });
  });
}

/**
 * Simple custom assertion reporter
 */
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ${GREEN}✔ PASS:${RESET} ${message}`);
  } else {
    console.error(`  ${RED}✘ FAIL:${RESET} ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function main() {
  console.log(`\n${CYAN}${BOLD}=======================================================`);
  console.log(`🧪 PDFMINTY CLEANING SYSTEM TEST HARNESS`);
  console.log(`=======================================================${RESET}\n`);

  const tempTestDir = path.join(process.cwd(), 'sandboxed-test-project');
  const tempSrcDir = path.join(tempTestDir, 'src');
  const tempCoreDir = path.join(tempSrcDir, 'core');
  
  // Backup real report if exists
  const realReportPath = path.join(process.cwd(), 'scan-report.json');
  const realProposalPath = path.join(process.cwd(), 'cleaning-proposal.json');
  let realReportBackup: string | null = null;
  let realProposalBackup: string | null = null;

  try {
    if (existsSync(realReportPath)) {
      realReportBackup = await fs.readFile(realReportPath, 'utf-8');
    }
    if (existsSync(realProposalPath)) {
      realProposalBackup = await fs.readFile(realProposalPath, 'utf-8');
    }

    // 1. Create a temporary test project structure
    console.log(`🔹 Creating temporary test project directory structure...`);
    await fs.mkdir(tempCoreDir, { recursive: true });

    // 2. Create sample files with known issues under test structure
    console.log(`🔹 Writing test sample files containing known anomalies...`);

    // dead-function.ts (has an exported but unused function)
    const deadFuncContent = `export function aliveAction() {\n  return "active";\n}\nexport function deadAction() {\n  return "unused-and-dead";\n}\naliveAction();\n`;
    await fs.writeFile(path.join(tempSrcDir, 'dead-function.ts'), deadFuncContent, 'utf-8');

    // empty-file.ts (0 bytes completely)
    await fs.writeFile(path.join(tempSrcDir, 'empty-file.ts'), '', 'utf-8');

    // duplicate-util.ts (duplicates helper function)
    const dupUtilContent = `export function degreesToRadians(deg: number) {\n  return (deg * Math.PI) / 180;\n}\n`;
    await fs.writeFile(path.join(tempSrcDir, 'duplicate-util.ts'), dupUtilContent, 'utf-8');

    // unused-import.ts (imports used component incorrectly or has extra bindings)
    const unusedImportContent = `import { useState, useEffect } from 'react';\nexport function Component() {\n  const [val] = useState('');\n  return null;\n}\n`;
    await fs.writeFile(path.join(tempSrcDir, 'unused-import.ts'), unusedImportContent, 'utf-8');

    // danger-core.ts (lives inside protected Core/ sector to trigger high impact flags)
    const dangerCoreContent = `export function coreEncrypAndProtect() {\n  return "sensitive-crypto-payload";\n}\n`;
    await fs.writeFile(path.join(tempCoreDir, 'danger-core.ts'), dangerCoreContent, 'utf-8');

    // 3. Runs deep-scan.ts targeting this sandboxed-test-project
    console.log(`\n🏃 Running deep-scan.ts on temporary sandbox...`);
    const scanCmd = `npx tsx scripts/deep-scan.ts "sandboxed-test-project/src"`;
    const scanResult = await runCommand(scanCmd);

    assert(scanResult.code === 0, `deep-scan.ts executed successfully (Exit Code: ${scanResult.code})`);

    // 4. Verifies scan-report.json contains expected issues
    assert(existsSync(realReportPath), 'scan-report.json was generated successfully');
    
    const scanReportContent = await fs.readFile(realReportPath, 'utf-8');
    const scanIssues: ScanReportItem[] = JSON.parse(scanReportContent);

    console.log(`\n📋 Verifying scanned issues against expectation payloads...`);
    assert(scanIssues.length >= 4, `Found at least 4 potential issues (Scanned count: ${scanIssues.length})`);

    const hasEmptyFile = scanIssues.some(issue => issue.type === 'empty-file' && issue.file.includes('empty-file.ts'));
    assert(hasEmptyFile, "Successfully detected 'empty-file' in empty-file.ts");

    const hasUnusedImport = scanIssues.some(issue => issue.type === 'unused-import' && issue.file.includes('unused-import.ts'));
    assert(hasUnusedImport, "Successfully detected 'unused-import' in unused-import.ts");

    const hasDeadExport = scanIssues.some(issue => issue.type === 'dead-export' && issue.file.includes('dead-function.ts'));
    assert(hasDeadExport, "Successfully detected 'dead-export' in dead-function.ts");

    const hasDuplicate = scanIssues.some(issue => issue.type === 'duplicate-code' && issue.file.includes('duplicate-util.ts'));
    assert(hasDuplicate, "Successfully detected 'duplicate-code' in duplicate-util.ts");

    // 5. Run generate-proposal.ts to inspect taxonomy assignment
    console.log(`\n🏃 Running generate-proposal.ts on scan findings...`);
    const proposalCmd = `npx tsx scripts/generate-proposal.ts`;
    const proposalResult = await runCommand(proposalCmd);

    assert(proposalResult.code === 0, `generate-proposal.ts executed successfully (Exit Code: ${proposalResult.code})`);
    assert(existsSync(realProposalPath), 'cleaning-proposal.json was generated successfully');

    const proposalContent = await fs.readFile(realProposalPath, 'utf-8');
    const proposalItems: ProposalItem[] = JSON.parse(proposalContent);

    // 6. Verifies categorization (SAFE/REVIEW/DANGER) is dynamically in alignment
    console.log(`\n📋 Verifying safety badge categorization rules...`);

    const emptyFileProposal = proposalItems.find(item => item.file.includes('empty-file.ts'));
    assert(!!emptyFileProposal && emptyFileProposal.safetyBadge === '🟢 SAFE', "empty-file.ts mapped to '🟢 SAFE'");

    const unusedImportProposal = proposalItems.find(item => item.file.includes('unused-import.ts'));
    assert(!!unusedImportProposal && unusedImportProposal.safetyBadge === '🟢 SAFE', "unused-import.ts mapped to '🟢 SAFE'");

    const deadExportProposal = proposalItems.find(item => item.file.includes('dead-function.ts'));
    assert(!!deadExportProposal && deadExportProposal.safetyBadge === '🟢 SAFE', "dead-function.ts mapped to '🟢 SAFE'");

    const duplicateProposal = proposalItems.find(item => item.file.includes('duplicate-util.ts') && item.safetyBadge === '🟡 REVIEW');
    assert(!!duplicateProposal && duplicateProposal.safetyBadge === '🟡 REVIEW', "duplicate-util.ts duplicate-code match mapped to '🟡 REVIEW'");

    const dangerCoreProposal = proposalItems.find(item => item.file.includes('core/'));
    assert(!!dangerCoreProposal && dangerCoreProposal.safetyBadge === '🔴 DANGER', "core/ folder items successfully mapped to '🔴 DANGER'");

    console.log(`\n${GREEN}${BOLD}🎉 ALL SANITATION SYSTEM TESTS COMPLETED SUCCESSFULY!${RESET}\n`);

  } catch (error) {
    console.error(`\n${RED}${BOLD}🚨 TEST FAILURE ENCOUNTERED:${RESET}`);
    console.error(error);
    process.exit(1);
  } finally {
    // 7. Cleanup temp files after test execution is complete
    console.log(`🧹 Restoring clean working directory tree state...`);
    if (existsSync(tempTestDir)) {
      await fs.rm(tempTestDir, { recursive: true, force: true });
    }

    // Restore original reports to preserve developer context
    if (realReportBackup !== null) {
      await fs.writeFile(realReportPath, realReportBackup, 'utf-8');
    } else {
      if (existsSync(realReportPath)) {
        await fs.rm(realReportPath, { force: true });
      }
    }

    if (realProposalBackup !== null) {
      await fs.writeFile(realProposalPath, realProposalBackup, 'utf-8');
    } else {
      if (existsSync(realProposalPath)) {
        await fs.rm(realProposalPath, { force: true });
      }
    }
    console.log(`✨ Cleanup complete! Temporary sandboxes removed.\n`);
  }
}

main();
