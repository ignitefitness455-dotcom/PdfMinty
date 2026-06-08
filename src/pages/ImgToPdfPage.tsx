import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { triggerDownload } from "../core/utils";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Trash2 from "lucide-react/icons/trash-2";
import ArrowUp from "lucide-react/icons/arrow-up";
import ArrowDown from "lucide-react/icons/arrow-down";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { UPLOAD_LIMITS } from "../config/constants";

// Helper to convert WebP to standard PNG using HTML5 Canvas on the browser main-thread
function convertWebPToPng(file: File): Promise<{ bytes: Uint8Array; type: string; name: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D context from canvas for WebP conversion"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas conversion to blob failed"));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            const newName = file.name.replace(/\.webp$/i, ".png");
            resolve({
              bytes: new Uint8Array(reader.result),
              type: "image/png",
              name: newName,
            });
          } else {
            reject(new Error("FileReader failed to read WebP blob as ArrayBuffer"));
          }
        };
        reader.onerror = () => reject(reader.error || new Error("FileReader error reading WebP blob"));
        reader.readAsArrayBuffer(blob);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load WebP image for conversion"));
    };
    img.src = url;
  });
}

export default function ImgToPdfPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);
  const [pageSize, setPageSize] = useState<'fit' | 'A4' | 'Letter'>("fit");

  useEffect(() => {
    setImageUrls((prevUrls) => {
      const newUrls: Record<string, string> = { ...prevUrls };
      let changed = false;
      const activeKeys = new Set<string>();

      selectedFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          activeKeys.add(key);
          if (!newUrls[key]) {
            newUrls[key] = URL.createObjectURL(file);
            changed = true;
          }
        }
      });

      Object.keys(newUrls).forEach((key) => {
        if (!activeKeys.has(key)) {
          URL.revokeObjectURL(newUrls[key]);
          delete newUrls[key];
          changed = true;
        }
      });

      return changed ? newUrls : prevUrls;
    });
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
      if (completedResult) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult, imageUrls]);

  const handleFilesSelected = (files: File[]) => {
    const images = files.filter(f => f.type.startsWith("image/"));
    if (images.length !== files.length) {
      showToast("Only standard image formats (JPG/PNG/WebP) are supported here.", "error");
    }

    const filtered = images.filter(file => {
      if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
        showToast(`File '${file.name}' exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB limit and was skipped.`, "error");
        return false;
      }
      return true;
    });

    if (filtered.length > 0) {
      setSelectedFiles(prev => [...prev, ...filtered]);
      showToast(`Added ${filtered.length} image(s).`, "success");
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setSelectedFiles(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const moveDown = (idx: number) => {
    setSelectedFiles(prev => {
      if (idx === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setProcessingProgress(null);
    setCompletedResult(null);
  };

  const executeImgToPdf = async () => {
    if (selectedFiles.length === 0) {
      showToast("Please upload images first.", "error");
      return;
    }

    setLoading(true);
    setProcessingProgress(15);
    try {
      const { createDedicatedWorker } = await import("../core/WorkerManager");
      const worker = createDedicatedWorker("img-to-pdf");

      const imageFilesData: {
        bytes: Uint8Array;
        type: string;
        name: string;
      }[] = [];

      let progress = 15;
      for (let i = 0; i < selectedFiles.length; i++) {
        const imgFile = selectedFiles[i];
        let assetData: { bytes: Uint8Array; type: string; name: string };

        if (imgFile.type === "image/webp" || imgFile.name.toLowerCase().endsWith(".webp")) {
          assetData = await convertWebPToPng(imgFile);
        } else {
          const arrayBuffer = await imgFile.arrayBuffer();
          assetData = {
            bytes: new Uint8Array(arrayBuffer),
            type: imgFile.type,
            name: imgFile.name,
          };
        }

        imageFilesData.push(assetData);
        progress = Math.min(60, progress + 10);
        setProcessingProgress(progress);
      }

      setProcessingProgress(60);

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, "image_compilation.pdf", setCompletedResult);
          showToast("Images successfully converted to PDF!", "success");
        } else {
          showToast(`Conversion failed: ${error}`, "error");
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("ImgToPdf Worker Error:", err);
        showToast("Worker error occurred during image compilation.", "error");
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      const transferList = imageFilesData.map((item) => item.bytes.buffer);
      worker.postMessage(
        {
          type: "img-to-pdf",
          imageFilesData,
          pageSize,
        },
        transferList,
      );
      setProcessingProgress(80);
    } catch (err: any) {
      showToast(`Conversion failed: ${err.message}`, "error");
      setLoading(false);
      setProcessingProgress(null);
    }
  };

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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Image to PDF Companion
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Form Side */}
          <div className="lg:col-span-12 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h1 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  Compile Photos & Images into PDF
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-455 mt-1 font-medium">
                  Convert a list of JPG, PNG, or WebP photos sequentially into clean PDF output pages locally.
                </p>
              </div>

              {!completedResult && selectedFiles.length === 0 && (
                <FileUploader
                  placeholder="Drop images (JPG, PNG, WebP) here or click to choose"
                  multiple={true}
                  accept="image/jpeg, image/png, image/webp"
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {selectedFiles.length > 0 && !completedResult && (
                <div className="space-y-4">
                  {/* Page Size & Layout Selection */}
                  <div className="space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Target Page Dimensions layout
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/60 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-850">
                      {[
                        { id: "fit", label: "Fit to Image" },
                        { id: "A4", label: "A4 Standard" },
                        { id: "Letter", label: "US Letter" },
                      ].map((sizeItem) => (
                        <button
                          key={sizeItem.id}
                          type="button"
                          onClick={() => setPageSize(sizeItem.id as any)}
                          className={`py-2 text-[10px] sm:text-xs font-black rounded-lg transition-all border-0 cursor-pointer ${
                            pageSize === sizeItem.id
                              ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          {sizeItem.label}
                        </button>
                      ))}
                    </div>
                    {pageSize !== "fit" ? (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        💡 Images will be scaled proportionally to fit the {pageSize === "A4" ? "A4 (595 × 842 pt)" : "Letter (612 × 792 pt)"} layout with comfortable print margins.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        💡 Every PDF page's physical size matches the source image resolution exactly (no cropping / borders).
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Queue Images ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/40 transition-colors border-0"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-805 bg-slate-50/50 dark:bg-slate-950/40 p-2 space-y-1.5">
                    {selectedFiles.map((file, idx) => {
                      const key = `${file.name}-${file.size}-${file.lastModified}`;
                      const url = imageUrls[key] || "";
                      return (
                        <div
                          key={idx}
                          className="p-3 flex items-center justify-between text-xs text-slate-750 dark:text-slate-300 font-medium bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl"
                        >
                          <div className="flex items-center gap-3 truncate min-w-0 pr-4">
                            {url ? (
                              <img
                                src={url}
                                alt="preview thumbnail"
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200/50 dark:border-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
                            )}
                            <div className="flex flex-col truncate">
                              <span className="truncate text-slate-800 dark:text-slate-200 font-bold">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveUp(idx)}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 bg-transparent"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => moveDown(idx)}
                              disabled={idx === selectedFiles.length - 1}
                              className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 bg-transparent"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded border border-rose-100 dark:border-rose-900/30 shrink-0 bg-transparent"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-2 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 leading-relaxed">
                    ⚠️ <strong>Supported formats:</strong> PNG, JPEG/JPG, WebP. High-resolution images are embedded in full quality natively.
                  </p>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-705 dark:text-slate-200">
                      Encoding images to PDF pages...
                    </p>
                    {processingProgress !== null && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        Progress: {processingProgress}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Result Screen */}
              {completedResult && (
                <div className="py-8 text-center space-y-5 animate-fadein">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-50">
                      PDF Compilation Complete!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-sm mx-auto select-all">
                      {completedResult.filename}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
                    >
                      Convert More Images
                    </button>
                    <a
                      href={completedResult.url}
                      download={completedResult.filename}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer decoration-none scale-102 hover:scale-105 active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Download Compiled PDF
                    </a>
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executeImgToPdf}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span>Generate PDF Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
