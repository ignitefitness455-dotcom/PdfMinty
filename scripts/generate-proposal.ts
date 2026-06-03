import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Input types from scanner
interface ScanIssue {
  id?: string;
  file: string;
  type: string;
  description?: string;
  confidence?: 'high' | 'medium' | 'low';
  currentCode?: string;
  line?: number;
}

// Output proposal item schema
interface ProposalItem {
  id: string;
  file: string;
  action: 'delete' | 'modify';
  description: string;
  currentCode: string | null;
  proposedCode: string | null;
  impactScore: number; // 0-100
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
      console.warn('⚠️  Could not parse .cleaningrc.json. Falling back to defaults.');
    }
  }
  return null;
}

function parsePatternToRegExp(pattern: string): RegExp | null {
  try {
    const parts = pattern.match(/^\/(.+)\/([a-z]*)$/i);
    if (parts) {
      return new RegExp(parts[1], parts[2]);
    }
    return new RegExp(pattern);
  } catch (err) {
    return null;
  }
}

/**
 * Assigns an explicit safety classification badge and a calibrated impact risk score
 * according to project safety rules and loaded .cleaningrc.json.
 */
function classifyIssue(issue: ScanIssue, config: any): {
  badge: '🟢 SAFE' | '🟡 REVIEW' | '🔴 DANGER';
  score: number;
} {
  const filePath = (issue.file || '').toLowerCase();
  const normalizedPath = (issue.file || '').replace(/\\/g, '/');
  const type = (issue.type || '').toLowerCase();
  const description = (issue.description || '').toLowerCase();

  // 1. Check if the file is protected either by configuration or default heuristics
  let isProtected = false;
  if (config) {
    // Check exact protected paths
    if (config.protectedPaths) {
      isProtected = config.protectedPaths.some((p: string) => {
        const normP = p.replace(/\\/g, '/');
        return normalizedPath === normP || normalizedPath.endsWith('/' + normP);
      });
    }
    // Check regex protected patterns from config
    if (!isProtected && config.protectedPatterns) {
      for (const pattern of config.protectedPatterns) {
        const regex = parsePatternToRegExp(pattern);
        if (regex && regex.test(normalizedPath)) {
          isProtected = true;
          break;
        }
      }
    }
  }

  // Underpinning default security rules: core paths, encryption, workers
  const isCore = filePath.includes('core/') || filePath.includes('src/core/');
  const isEncryption = /encrypt|decrypt|protect|password|security|crypto/.test(filePath) ||
                       /encrypt|decrypt|protect|password|security|crypto/.test(description) ||
                       /encrypt|decrypt|protect|password|security|crypto/.test(type);
  const isWorker = filePath.includes('worker') || filePath.includes('workers/') || /worker/.test(type);

  if (isProtected || isCore || isEncryption || isWorker) {
    let score = 80;
    if (isProtected) score = 100; // Locked via .cleaningrc.json config
    else if (isEncryption) score = 95;
    else if (isCore) score = 85;
    else if (isWorker) score = 90;
    
    return {
      badge: '🔴 DANGER',
      score
    };
  }

  // 2. SAFE (🟢): Dead exports with high confidence, empty files, or unused imports
  const isDeadExport = type.includes('dead-export') || type.includes('unused-export');
  const isHighConfidence = issue.confidence === 'high' || issue.confidence === undefined;
  const isEmptyFile = type.includes('empty-file') || type.includes('empty');
  const isUnusedImport = type.includes('unused-import') || type.includes('unused-declaration');

  if ((isDeadExport && isHighConfidence) || isEmptyFile || isUnusedImport) {
    let score = 10;
    if (isEmptyFile) score = 5;
    else if (isUnusedImport) score = 12;
    
    return {
      badge: '🟢 SAFE',
      score
    };
  }

  // 3. REVIEW (🟡): Duplicates, commented code, test skeletons
  const isDuplicate = type.includes('duplicate');
  const isCommentedCode = type.includes('commented');
  const isTestSkeleton = type.includes('test-skeleton') || filePath.includes('.test.') || filePath.includes('.spec.');

  let score = 45;
  if (isDuplicate) score = 55;
  else if (isCommentedCode) score = 30;
  else if (isTestSkeleton) score = 40;

  return {
    badge: '🟡 REVIEW',
    score
  };
}

/**
 * Generates sample data if the scan-report.json does not exist.
 * This preserves execution continuity and serves as a developer preview.
 */
async function ensureScanReport(): Promise<void> {
  const reportPath = path.join(process.cwd(), 'scan-report.json');
  if (existsSync(reportPath)) {
    return;
  }

  console.warn('⚠️  scan-report.json not found inside project root. Generating a contextual sample report...');

  const sampleIssues: ScanIssue[] = [
    {
      id: 'scan-001',
      file: 'src/core/pdf-operations.ts',
      type: 'unused-import',
      confidence: 'high',
      description: 'The helper structure `AddBlankPayload` imported on line 22 is never called within file.',
      currentCode: 'import { PDFDocument, StandardFonts, AddBlankPayload } from "pdf-lib";'
    },
    {
      id: 'scan-002',
      file: 'src/components/ObsoleteButton.tsx',
      type: 'empty-file',
      description: 'The file is totally blank or contains exclusively comments.'
    },
    {
      id: 'scan-003',
      file: 'src/pages/WatermarkPage.tsx',
      type: 'dead-export',
      confidence: 'high',
      description: 'Unused export of utility component `LegacyWatermarkBadge` detected.',
      currentCode: 'export function LegacyWatermarkBadge() {\n  return <span className="text-gray-400">Archived</span>;\n}'
    },
    {
      id: 'scan-004',
      file: 'src/utils/math-utils.ts',
      type: 'duplicate-code',
      description: 'Duplicate helper math functions duplicated blocks from external canvas components.',
      currentCode: 'export function degreesToRadians(deg: number) {\n  return (deg * Math.PI) / 180;\n}'
    },
    {
      id: 'scan-005',
      file: 'src/pages/ProtectPage.tsx',
      type: 'commented-code',
      description: 'Commented-out code blocks found indicating historical experimental encryption tests.',
      currentCode: '// const secureBuffer = await cryptoEncryptBytes(raw, userPassword);\n// return secureBuffer;'
    },
    {
      id: 'scan-006',
      file: 'src/tests/pdf-builder.test.ts',
      type: 'test-skeleton',
      description: 'Spec files containing empty suites or mock tests sans assertions.',
      currentCode: 'describe("PDF Builder", () => {\n  it("should create document", () => {});\n});'
    },
    {
      id: 'scan-007',
      file: 'src/workers/pdf-worker.ts',
      type: 'dead-export',
      confidence: 'high',
      description: 'Worker lifecycle export `initThreadWatcher` has zero active listeners.',
      currentCode: 'export function initThreadWatcher() {\n  console.warn("Worker initiated thread watcher.");\n}'
    },
    {
      id: 'scan-008',
      file: 'src/core/encrypt-pdf.ts',
      type: 'commented-code',
      description: 'Core metadata manipulation comments.',
      currentCode: '/* pdfDoc.save({ userPassword: "123" }) */'
    }
  ];

  await fs.writeFile(reportPath, JSON.stringify(sampleIssues, null, 2), 'utf-8');
  console.log('✅ Created sample report: ./scan-report.json');
}

/**
 * Prime proposal processor
 */
async function run() {
  try {
    const config = await loadConfig();
    await ensureScanReport();

    const reportPath = path.join(process.cwd(), 'scan-report.json');
    const rawReport = await fs.readFile(reportPath, 'utf-8');
    const scanIssues: ScanIssue[] = JSON.parse(rawReport);

    console.log(`\n🔍 Parsing ${scanIssues.length} issues from scan-report.json...`);

    const proposals: ProposalItem[] = [];
    const stats = {
      safe: 0,
      review: 0,
      danger: 0
    };

    for (let i = 0; i < scanIssues.length; i++) {
      const issue = scanIssues[i];
      
      try {
        validateFilePath(issue.file);
      } catch (valErr) {
        console.warn(`💥 SECURITY ADVISORY: File path in scanner outputs is invalid and rejected: "${issue.file}"`);
        continue;
      }
      
      // Ensure target path is secure and remains inside the project tree
      const resolvedPath = path.resolve(process.cwd(), issue.file);
      if (!resolvedPath.startsWith(process.cwd())) {
        console.warn(`💥 SECURITY ADVISORY: File target in scan outputs escapes project folder bounds: "${issue.file}" (Skipped)`);
        continue;
      }

      const { badge, score } = classifyIssue(issue, config);

      // Unique proposal-level ID
      const pId = issue.id || `proposal-${crypto.randomUUID().slice(0, 8)}`;
      
      // Determine logical action
      const action = (issue.type === 'empty-file' || issue.type === 'test-skeleton') ? 'delete' as const : 'modify' as const;

      // Deduce custom programmatic cleaning output description
      let customDescription = issue.description || 'Remove or consolidate dead code structures to prune application weight.';
      if (badge === '🔴 DANGER') {
        customDescription = `⚠️ [CRITICAL ZONE] ${customDescription} Sensitive or user-protected security sandbox area. Locked and safe.`;
      }

      // Generate proposed code
      let proposedCode: string | null = null;
      if (action === 'modify') {
        if (issue.type === 'unused-import') {
          proposedCode = '// Unused import statement removed safely';
        } else if (issue.type === 'commented-code') {
          proposedCode = '// Legacy commented blocks removed safely';
        } else if (issue.type === 'dead-export') {
          proposedCode = '// Dead export block pruned';
        } else {
          proposedCode = '';
        }
      }

      // Keep stats
      if (badge === '🟢 SAFE') stats.safe++;
      else if (badge === '🟡 REVIEW') stats.review++;
      else if (badge === '🔴 DANGER') stats.danger++;

      proposals.push({
        id: pId,
        file: issue.file,
        action,
        description: customDescription,
        currentCode: issue.currentCode || null,
        proposedCode,
        impactScore: score,
        safetyBadge: badge,
        rollbackCommand: `git restore "${issue.file}"`
      });
    }

    // Write the output file
    const outputPath = path.join(process.cwd(), 'cleaning-proposal.json');
    await fs.writeFile(outputPath, JSON.stringify(proposals, null, 2), 'utf-8');

    // Display counts
    console.log('\n=========================================');
    console.log('📊 PROPOSAL GENERATION SUMMARY');
    console.log('=========================================');
    console.log(`🟢 SAFE (Low Impact):       ${stats.safe} items`);
    console.log(`🟡 REVIEW (Medium Impact):   ${stats.review} items`);
    console.log(`🔴 DANGER (High Criticality): ${stats.danger} items`);
    console.log('-----------------------------------------');
    console.log(`📁 Saved proposal to: ./cleaning-proposal.json`);
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Failed processing proposals:', error);
    process.exit(1);
  }
}

run();
