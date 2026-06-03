import { Link } from "react-router-dom";
import ArrowLeft from "lucide-react/icons/arrow-left";
import Unlock from "lucide-react/icons/unlock";
import HelpCircle from "lucide-react/icons/help-circle";

export default function UnlockPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fadein relative z-10 font-sans text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link
            to="/"
            id="back-to-dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer decoration-none border-0 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Unlock PDF Information
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 p-6 md:p-8 space-y-8">
          <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 leading-tight">
                  Decrypt & Unlock Secured PDFs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Learn how to safely remove standard ISO 32000 PDF native passwords locally.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Quality Upgrade Banner */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100">
              <span className="text-base">🛡️</span> Privacy-First & Industry Compliant
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              PdfMinty has upgraded to true <strong>ISO 32000 Standard Native Protection</strong>. Rather than wrapping files in insecure custom proprietary containers, we write native PDF password keys directly. This guarantees absolute safety: your files open cleanly on any device natively (Adobe Acrobat, Preview, Chrome, Edge) without requiring any third-party app or website.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-450 font-medium leading-relaxed border-t border-slate-200/50 dark:border-slate-800/60 pt-3">
              🔓 <strong>Offline Decryption Note</strong>: Standard industry protection is designed to be decrypted natively by your operating system or web browser. To maintain 100% privacy and integrity, standard native password decryption is done natively in your local PDF reader rather than through custom Web worker scripts.
            </p>
          </div>

          {/* Instruction Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              How to Permanently Remove a PDF Passphrase (10 Seconds)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Chrome/Edge */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <span className="text-xs font-extrabold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">
                  Web Browsers
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Chrome, Edge, or Firefox
                </h4>
                <ol className="text-[11px] text-slate-550 dark:text-slate-400 space-y-2 list-decimal pl-4 font-medium leading-relaxed">
                  <li>Open the secured PDF directly inside your web browser.</li>
                  <li>Type your lock passphrase when prompted to view contents.</li>
                  <li>Open the Print dialog (press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Ctrl+P</kbd> or <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Cmd+P</kbd>).</li>
                  <li>For Destination, change option to <strong>Save as PDF</strong>.</li>
                  <li>Press <strong>Save</strong>. The output copy is unlocked permanently.</li>
                </ol>
              </div>

              {/* Option 2: macOS Preview */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <span className="text-xs font-extrabold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md">
                  macOS System
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Apple Preview Engine
                </h4>
                <ol className="text-[11px] text-slate-550 dark:text-slate-400 space-y-2 list-decimal pl-4 font-medium leading-relaxed">
                  <li>Double-click to open your secured PDF inside Preview.</li>
                  <li>Enter the document password to decrypt visually.</li>
                  <li>Click on standard <strong>File</strong> from top menu, then choose <strong>Export...</strong></li>
                  <li>Make sure the <strong>Encrypt</strong> checkbox is unchecked.</li>
                  <li>Click <strong>Save</strong> to export a clean, unprotected document.</li>
                </ol>
              </div>

              {/* Option 3: Acrobat */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <span className="text-xs font-extrabold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-md">
                  Pro Editors
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Acrobat Pro & PDF Editors
                </h4>
                <ol className="text-[11px] text-slate-550 dark:text-slate-400 space-y-2 list-decimal pl-4 font-medium leading-relaxed">
                  <li>Open the document in your professional PDF Editor.</li>
                  <li>Provide your security credentials to unlock file changes.</li>
                  <li>Navigate to <strong>File &gt; Properties &gt; Security</strong>.</li>
                  <li>Locate <strong>Security Method</strong> and select <strong>No Security</strong>.</li>
                  <li>Save the changes. The password requirement is stripped.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
