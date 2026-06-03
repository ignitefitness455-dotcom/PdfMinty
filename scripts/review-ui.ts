import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import readline from 'readline';

// Interfaces matching generate-proposal.ts schema
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
  const safeRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
  if (!safeRegex.test(file)) {
    throw new Error(`💥 SECURITY EXCEPTION: Forbidden characters or spaces in filename path: "${file}"`);
  }
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
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';

/**
 * Computes exact line numbers within the source file for the provided code snippet
 */
async function findLineNumbers(filePath: string, currentCode: string | null): Promise<string> {
  if (!currentCode) return 'N/A';
  try {
    validateFilePath(filePath);
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!existsSync(fullPath)) return 'N/A';
    
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    
    // Attempt exact match
    let index = fileContent.indexOf(currentCode);
    if (index === -1) {
      // Normalize line endings and retry matching
      const normContent = fileContent.replace(/\r\n/g, '\n');
      const normCode = currentCode.replace(/\r\n/g, '\n');
      index = normContent.indexOf(normCode);
      if (index === -1) return 'N/A';
      
      const linesBefore = normContent.slice(0, index).split('\n').length;
      const codeLines = normCode.split('\n').length;
      return codeLines > 1 ? `L${linesBefore}-L${linesBefore + codeLines - 1}` : `L${linesBefore}`;
    }
    
    const linesBefore = fileContent.slice(0, index).split('\n').length;
    const codeLines = currentCode.split('\n').length;
    return codeLines > 1 ? `L${linesBefore}-L${linesBefore + codeLines - 1}` : `L${linesBefore}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Helper to display wrapped visual blocks
 */
function printBlock(title: string, content: string[], color: string = CYAN) {
  const lineChar = '─';
  const headerLength = Math.max(10, 74 - title.length - 6);
  console.log(`\n${color}┌─── ${BOLD}${title}${RESET}${color} ${lineChar.repeat(headerLength)}${RESET}`);
  for (const line of content) {
    console.log(`${color}│${RESET} ${line}`);
  }
  console.log(`${color}└${lineChar.repeat(74)}${RESET}`);
}

/**
 * Ask clean interactive questions using standard promises
 */
function askQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * Main review execution engine
 */
async function main() {
  const proposalPath = path.join(process.cwd(), 'cleaning-proposal.json');
  const outputPath = path.join(process.cwd(), 'approved-changes.json');

  if (!existsSync(proposalPath)) {
    console.error(`\n${RED}${BOLD}❌ ERROR: cleaning-proposal.json not found!${RESET}`);
    console.error(`${DIM}Please run 'npx tsx scripts/generate-proposal.ts' first to analyze and generate recommendations.${RESET}\n`);
    process.exit(1);
  }

  try {
    const rawData = await fs.readFile(proposalPath, 'utf-8');
    const proposals: ProposalItem[] = JSON.parse(rawData);

    // Secure input integrity
    for (const p of proposals) {
      validateFilePath(p.file);
    }

    console.log(`\n${CYAN}${BOLD}=======================================================`);
    console.log(`🛠️  PDFMINTY DEEP CLEANING & SANITATION SUITE`);
    console.log(`=======================================================${RESET}`);

    // Categorize items
    const safeItems = proposals.filter((p) => (p.safetyBadge || '').includes('SAFE'));
    const dangerItems = proposals.filter((p) => (p.safetyBadge || '').includes('DANGER'));
    const reviewItems = proposals.filter((p) => (p.safetyBadge || '').includes('REVIEW'));

    // Print summaries
    console.log(`\n📦 Loaded ${proposals.length} total recommendations from proposal metadata:`);
    console.log(`  ${GREEN}🟢 SAFE:   ${safeItems.length} items (Will be auto-approved)${RESET}`);
    console.log(`  ${YELLOW}🟡 REVIEW: ${reviewItems.length} items (Requires developer validation)${RESET}`);
    console.log(`  ${RED}🔴 DANGER: ${dangerItems.length} items (Will be auto-skipped for safety)${RESET}\n`);

    // Auto-approve SAFE items
    const approvedChanges: ProposalItem[] = [...safeItems];
    if (safeItems.length > 0) {
      printBlock(
        'AUTO-APPROVED ACTIONS (🟢 SAFE)',
        [
          `Automatically staged and approved ${safeItems.length} low-risk operations.`,
          `These consist of dead imports, empty modules, or high-confidence trivial prunings.`,
          `${DIM}Files impacted:${RESET}`,
          ...safeItems.map((item) => `  - ${GREEN}${item.file}${RESET} (${item.description})`)
        ],
        GREEN
      );
    }

    // Warn about DANGER items
    if (dangerItems.length > 0) {
      printBlock(
        'SAFETY WARNING: EXCLUDED ACTIONS (🔴 DANGER)',
        [
          `Auto-skipped ${dangerItems.length} high-criticality items located in core files, encryption routine modules or worker lines.`,
          `These elements remain untouched to preserve application robustness and prevent structural regressions.`,
          `${DIM}Sectors protected:${RESET}`,
          ...dangerItems.map((item) => `  - ${RED}${item.file}${RESET} (${item.description})`)
        ],
        RED
      );
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Run interactive session for REVIEW items
    if (reviewItems.length > 0) {
      console.log(`${BOLD}${YELLOW}👉 Entering Interactive Review for ${reviewItems.length} suspicious blocks...${RESET}`);
      
      let i = 0;
      while (i < reviewItems.length) {
        const item = reviewItems[i];
        const lineRange = await findLineNumbers(item.file, item.currentCode);
        
        const reviewTitle = `REVIEW BLOCK #${i + 1} of ${reviewItems.length}`;
        const contentLines = [
          `${BOLD}File:${RESET}        ${CYAN}${item.file}${RESET} (${YELLOW}${lineRange}${RESET})`,
          `${BOLD}Safety Badge:${RESET} ${YELLOW}${item.safetyBadge}${RESET} (Impact Risk: ${BOLD}${item.impactScore}/100${RESET})`,
          `${BOLD}Description:${RESET}  ${item.description}`,
          '',
          `${BOLD}Code Snippet:${RESET}`,
          ...(item.currentCode
            ? item.currentCode.split('\n').map((line) => `  ${DIM}${line}${RESET}`)
            : [`  ${DIM}(Target file marked for full deletion)${RESET}`])
        ];

        printBlock(reviewTitle, contentLines, YELLOW);

        const promptText = `\n${BOLD}Action ? [Y]es approve / [N]o keep / [S]kip / [V]iew full / [Q]uit & save: ${RESET}`;
        const rawChoice = await askQuestion(rl, promptText);
        const choice = rawChoice.trim().toUpperCase();

        if (choice === 'Y' || choice === 'YES') {
          console.log(`\n${GREEN}✔ Approved change for ${item.file}${RESET}`);
          approvedChanges.push(item);
          i++;
        } else if (choice === 'N' || choice === 'NO' || choice === 'S' || choice === 'SKIP') {
          console.log(`\n${YELLOW}➖ Excluded change for ${item.file}${RESET}`);
          // Move to next without adding to authorized changes
          i++;
        } else if (choice === 'V' || choice === 'VIEW') {
          // View detailed expansion of proposed code modifications and rollback mechanisms
          const detailTitle = `DETAILED COMPARISON FOR ${item.file}`;
          const detailLines = [
            `Action Type: ${BOLD}${item.action.toUpperCase()}${RESET}`,
            `Rollback Command: \`${CYAN}${item.rollbackCommand}${RESET}\``,
            '',
            `${BOLD}Proposed Code Result:${RESET}`,
            item.proposedCode === null
              ? `  ${RED}[DELETED COMPLETELY]${RESET}`
              : item.proposedCode === ''
              ? `  ${GREEN}[PRUNED TO EMPTY]${RESET}`
              : item.proposedCode.split('\n').map((l) => `  ${GREEN}${l}${RESET}`).join('\n')
          ];
          printBlock(detailTitle, detailLines, CYAN);
          // Loop doesn't increment 'i' so the user is prompted again for the same index
        } else if (choice === 'Q' || choice === 'QUIT') {
          console.log(`\n${MAGENTA}🚪 Quitting interactive session...${RESET}`);
          break;
        } else {
          console.log(`\n${RED}⚠ Invalid option format: "${rawChoice}". Please enter Y, N, S, V, or Q.${RESET}`);
          // Loop repeats same block
        }
      }
    } else {
      console.log(`\n${GREEN}✨ No pending items require manual review!${RESET}\n`);
    }

    rl.close();

    // Persist final aggregated selections to disk
    await fs.writeFile(outputPath, JSON.stringify(approvedChanges, null, 2), 'utf-8');

    console.log(`\n${GREEN}${BOLD}=======================================================`);
    console.log(`🎉 SAVED ${approvedChanges.length} APPROVED DECISIONS`);
    console.log(`=======================================================`);
    console.log(`📝 Output saved successfully to: ./approved-changes.json`);
    console.log(`Ready for clean implementation phase.${RESET}\n`);

  } catch (err) {
    console.error(`${RED}❌ Execution error during review pass:${RESET}`, err);
    process.exit(1);
  }
}

main();
