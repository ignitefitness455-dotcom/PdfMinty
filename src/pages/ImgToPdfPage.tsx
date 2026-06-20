import React, { useState } from 'react';
import { ArrowLeft, Image, Download, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { imagesToPdf } from '../utils/pdfProcessor';
import { ROUTES } from '../config/routes';
import { SEO } from '../components/SEO';

export const ImgToPdfPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setImages((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please add at least 1 image file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pdfBytes = await imagesToPdf(images);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfminty_images_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Image logic error:', err);
      setError(err?.message || 'Failed to convert selected images to PDF. Ensure standard PNG/JPG formats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="img_to_pdf_container">
      <SEO 
        title="Image to PDF — Convert PNG/JPG to PDF Offline" 
        description="Convert bulk PNG and JPG photo records into elegant, printable PDFs offline. Rapid, confidential, and completely free within your browser."
      />

      <Link to={ROUTES.HOME} className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Convert Image to PDF</h1>
        <p className="text-slate-500 text-sm">Convert individual screenshots or sequential camera captures into an unified PDF file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Image className="w-5 h-5 text-fuchsia-600" />
            <FileUploader 
              onFilesSelected={handleFilesSelected} 
              multiple 
              accept="image/png, image/jpeg, image/jpg"
              title="Select images to convert"
              subtitle="Drag PNG, JPG or JPEG files here or browse"
            />
          </div>

          {images.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="images_deck_list">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrange Photo Deck ({images.length} added)</span>
                <button onClick={() => setImages([])} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Clear Deck</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                {images.map((file, idx) => {
                  const tempUrl = URL.createObjectURL(file);
                  return (
                    <div key={`${file.name}_${idx}`} className="relative group bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-2 flex flex-col justify-between">
                      <div className="aspect-square relative w-full rounded-lg overflow-hidden bg-slate-200">
                        <img 
                          src={tempUrl} 
                          alt={file.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          onClick={() => handleRemove(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 hover:scale-110 active:scale-95 text-white rounded-lg shadow-sm transition-transform"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-1 mt-2">
                        <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Configurations column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Layout Guidelines</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Uploaded files are mapped one-to-one to individual PDF pages. Standard widths match original photo bounds for premium preservation.
            </p>
            <div className="p-3 bg-fuchsia-50 rounded-xl border border-fuchsia-100 text-[11px] text-fuchsia-800 font-medium leading-normal">
              Conversion logic preserves details locally within browser memory. Safe and fully sandbox insulated.
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={images.length === 0 || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-fuchsia-600/10 ${
                images.length > 0 && !loading
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Compiling pages...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
