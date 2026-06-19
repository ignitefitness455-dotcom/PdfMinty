import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument as PDFDocumentEncrypt } from "@cantoo/pdf-lib";

export default function ProtectPage() {
  const [password, setPassword] = useState("");

  const handleProtect = async (files: File[]): Promise<Blob> => {
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocumentEncrypt.load(bytes);
    pdf.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: "highResolution", modifying: false, copying: false, annotating: false },
    });
    const protectedBytes = await pdf.save();
    return new Blob([protectedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="protect-password-input" className="mb-1 block text-sm font-medium">Password (min 4 characters)</label>
      <input
        id="protect-password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={4}
        className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );

  return (
    <>
      <SEO title="Protect PDF" description="Password protect your PDF" />
      <ToolWorkspace
        title="Protect PDF"
        description="Add password protection to your PDF."
        onProcess={handleProtect}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="protected.pdf"
      />
    </>
  );
}
