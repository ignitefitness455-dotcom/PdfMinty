import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument as PDFDocumentEncrypt } from "@cantoo/pdf-lib";

export default function UnlockPage() {
  const [password, setPassword] = useState("");

  const handleUnlock = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    try {
      const pdf = password
        ? await PDFDocumentEncrypt.load(bytes, { password })
        : await PDFDocumentEncrypt.load(bytes);
      const unlocked = await pdf.save();
      return new Blob([unlocked as any], { type: "application/pdf" });
    } catch (err: any) {
      if (err.message?.includes("password") || err.message?.includes("Password") || err.message?.includes("decrypt")) {
        throw new Error("Incorrect password. Please try again.");
      }
      throw err;
    }
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="unlock-password-input" className="mb-1 block text-sm font-medium">Password (if required)</label>
      <input
        id="unlock-password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Leave empty for non-password-protected PDFs"
        className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );

  return (
    <>
      <SEO title="Unlock PDF" description="Remove password protection from PDF" />
      <ToolWorkspace
        title="Unlock PDF"
        description="Remove password protection from your PDF."
        onProcess={handleUnlock}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="unlocked.pdf"
      />
    </>
  );
}
