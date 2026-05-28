import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Merge, Scissors, RotateCw, Lock, Unlock, 
  Hash, Image, Layers, Trash2, Plus, Stamp, Download, 
  ArrowLeft, FileUp, Sparkles, Check, AlertCircle, 
  RefreshCw, Info, HelpCircle, MessageSquare, Mail,
  ChevronDown, ChevronUp, ArrowUp, Shield, Brain, Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';

let cachedPdfJs: any = null;
const getPdfJs = async () => {
  if (cachedPdfJs) return cachedPdfJs;
  const pdfjs = await import('pdfjs-dist');
  const workerObj = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerObj.default;
  cachedPdfJs = pdfjs;
  return pdfjs;
};

// Custom Toast notification simple state
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ToolType = 
  | 'merge' 
  | 'split' 
  | 'rotate' 
  | 'protect' 
  | 'unlock' 
  | 'page-numbers' 
  | 'watermark' 
  | 'add-blank' 
  | 'delete-pages' 
  | 'img-to-pdf' 
  | 'pdf-to-img'
  | 'compress'
  | 'ai-analyze';

interface PDFPageInfo {
  index: number;
  rotation: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface LazyPDFPageProps {
  pdfDoc: any;
  pageIndex: number;
  rotation: number;
}

const LazyPDFPage: React.FC<LazyPDFPageProps> = ({ pdfDoc, pageIndex, rotation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [rendering, setRendering] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !imgUrl && !rendering && pdfDoc) {
        setRendering(true);
        pdfDoc.getPage(pageIndex + 1).then(async (page: any) => {
          if (!active) return;
          const viewport = page.getViewport({ scale: 0.4 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            try {
              await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas
              }).promise;

              if (!active) return;
              const localUrl = canvas.toDataURL('image/jpeg', 0.85);
              setImgUrl(localUrl);
            } catch (err) {
              console.error('Lazy render page failed:', err);
            } finally {
              if (active) setRendering(false);
            }
          }
        });
      }
    }, {
      rootMargin: '120px'
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [pdfDoc, pageIndex, imgUrl, rendering]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-slate-50 overflow-hidden rounded">
      {imgUrl ? (
        <img
          src={imgUrl}
          className={`max-h-full max-w-full object-contain shadow-sm rounded transition-all duration-300 ${rotation === 90 ? 'rotate-90' : rotation === 180 ? 'rotate-180' : rotation === 270 ? '-rotate-90' : ''}`}
          alt={`page ${pageIndex}`}
          referrerPolicy="no-referrer"
          loading={pageIndex < 2 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={pageIndex === 0 ? "high" : "auto"}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500/80" />
          <span className="text-xs font-bold text-slate-500">Loading page...</span>
        </div>
      )}
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div role="alert" className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-lg font-black text-slate-900 mt-4 mb-2">Something went wrong.</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Something went wrong. Please reload the page.
            </p>
            <button
              id="reload-page-btn"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // Navigation & Tool State
    const [activeTool, setActiveTool] = useState<ToolType | null>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Validate hash is a tool
      const validTools = ['merge', 'split', 'rotate', 'organize', 'watermark', 'page-numbers', 'blank-pages', 'encrypt', 'decrypt', 'img-to-pdf', 'pdf-to-img', 'compress', 'intelligence'];
      if (validTools.includes(hash)) return hash as ToolType;
    }
    return null;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // File variables
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pdfPages, setPdfPages] = useState<PDFPageInfo[]>([]);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);

  // Tool Specific configurations
  const [splitRange, setSplitRange] = useState('1-3');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [password, setPassword] = useState('');
  const [pageNumberFormat, setPageNumberFormat] = useState('page-of'); // 'simple' | 'page-of'
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center'); // 'bottom-center' | 'top-center' | 'bottom-right'
  const [blankPageSize, setBlankPageSize] = useState<'A4' | 'Letter'>('A4');
  const [blankPagePos, setBlankPagePos] = useState<'start' | 'end' | 'custom'>('end');
  const [blankPageAt, setBlankPageAt] = useState('1');
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]); // page indices of the active PDF to delete
  const [compressQuality, setCompressQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // SEO Meta Tag & Canonical URL Updater
  useEffect(() => {
    let title = 'PDFMinty - Free Secure Client-Side PDF Tools';
    let description = 'Process, merge, split, rotate, watermark, encrypt, compress, and edit PDF files securely in your browser. 100% free and private offline PDF toolkit.';
    let canonical = 'https://pdfminty.com/';

    if (activeTool) {
      const currentToolObj = toolsList.find(t => t.id === activeTool);
      if (currentToolObj) {
        title = `${currentToolObj.name} - Free Secure PDF Tool | PDFMinty`;
        if (title.length > 60) title = title.substring(0, 60);

        description = `Use PDFMinty's ${currentToolObj.name} tool to securely process your PDF documents in your browser. ${currentToolObj.description}`;
        if (description.length > 160) description = description.substring(0, 157) + '...';
        
        canonical = `https://pdfminty.com/#${activeTool}`;
      }
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonical);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
    
    // Update hash so Google bot can see different URLs (using history to not scroll)
    if (activeTool) {
      window.history.replaceState(null, '', `#${activeTool}`);
    } else {
      window.history.replaceState(null, '', `/`);
    }

  }, [activeTool]);


  // Completed result state
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTool]);

  useEffect(() => {
    return () => {
      if (completedResult) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult]);

  // Safe first-party client assets mapping hook to prevent browser memory leaks
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    setImageUrls((prevUrls) => {
      const newUrls: Record<string, string> = { ...prevUrls };
      let changed = false;
      const activeKeys = new Set<string>();

      selectedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          activeKeys.add(key);
          if (!newUrls[key]) {
            newUrls[key] = URL.createObjectURL(file);
            changed = true;
          }
        }
      });

      // Revoke removed image URLs
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
      setImageUrls((prevUrls) => {
        Object.values(prevUrls).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, []);

  // File drag & hover feedback
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Landing Page Interactive States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Feedback Modal interactive values
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Contact Us Modal interactive values
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Notification Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Submit Feedback to Cloudflare Pages API
  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRating) {
      showToast('Please pick a rating to submit your feedback.', 'error');
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_CLOUDFLARE_API_URL || '';
      const response = await fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
          email: feedbackEmail,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        showToast('Feedback submitted successfully to Cloudflare!', 'success');
        // Cool confetti feedback reward
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        setFeedbackRating(null);
        setFeedbackComment('');
        setFeedbackEmail('');
        setShowFeedbackModal(false);
      } else {
        try {
          const errText = await response.text();
          console.error(`Cloudflare API feedback submission error (${response.status}):`, errText);
        } catch (_) {}
        showToast('Submission failed. Please check your connection and try again.', 'error');
      }
    } catch (err: any) {
      console.error('Cloudflare API feedback connection error:', err);
      showToast('Submission failed. Please check your connection and try again.', 'error');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Submit Contact Us message to Cloudflare Pages API
  const submitContactUs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setContactSubmitting(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_CLOUDFLARE_API_URL || '';
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        showToast('Your message has been sent successfully to Cloudflare!', 'success');
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
        setShowContactModal(false);
      } else {
        try {
          const errText = await response.text();
          console.error(`Cloudflare API contact submission error (${response.status}):`, errText);
        } catch (_) {}
        showToast('Submission failed. Please check your connection and try again.', 'error');
      }
    } catch (err: any) {
      console.error('Cloudflare API contact connection error:', err);
      showToast('Submission failed. Please check your connection and try again.', 'error');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Safe file loader and rendering logic
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processUploadedFiles(files);
    }
  };

  const processUploadedFiles = async (files: File[]) => {
    const typeCompliant = files.filter(file => {
      if (activeTool === 'img-to-pdf') {
        return file.type.startsWith('image/');
      }
      return file.type === 'application/pdf' || file.name.endsWith('.pdf');
    });

    if (typeCompliant.length !== files.length) {
      showToast('Some files were ignored due to incorrect file type.', 'error');
    }

    if (typeCompliant.length === 0) return;

    const filtered: File[] = [];
    for (const file of typeCompliant) {
      if (file.size > 50 * 1024 * 1024) {
        showToast(`File '${file.name}' exceeds the 50MB limit and was skipped.`, 'error');
      } else {
        filtered.push(file);
      }
    }

    if (filtered.length === 0) return;

    if (activeTool === 'merge' || activeTool === 'img-to-pdf') {
      setSelectedFiles(prev => [...prev, ...filtered]);
      showToast(`Loaded ${filtered.length} format-compliant file(s).`, 'success');
    } else {
      setSelectedFiles(filtered.slice(0, 1));
      showToast(`Loaded document: ${filtered[0].name}`, 'success');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      await processUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setPdfPages([]);
    setPdfDocument(null);
    setPagesToDelete([]);
    setPassword('');
    setProcessingProgress(null);
    setCompletedResult(null);
    setAiAnalysisResult(null);
    setAiError(null);
    setAiAnalyzing(false);
  };

  // Yield to main thread for TBT improvement
  const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

  // Convert File object to Uint8Array
  const fileToBytes = async (file: File): Promise<Uint8Array> => {
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  };

  // Trigger download helper
  const triggerDownload = (bytes: Uint8Array, filename: string) => {
    // Cast bytes to standard BlobPart to fix TS Uint8Array typing compatibility issues
    const mimeType = filename.endsWith('.zip') ? 'application/zip' : 'application/pdf';
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    
    // Clean up old completedResult URL if any
    setCompletedResult(prev => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });

    const url = URL.createObjectURL(blob);
    setCompletedResult({ url, filename, type: mimeType });

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Play celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  // Render PDF page previews using modern built-in pdfjs-dist entirely offline
  useEffect(() => {
    let active = true;
    let loadingTask: any = null;

    const renderPDFThumbnails = async () => {
      if (selectedFiles.length === 0 || activeTool === 'img-to-pdf') {
        setPdfPages([]);
        setPdfDocument(null);
        return;
      }

      setLoading(true);
      try {
        const primaryFile = selectedFiles[0];
        const arrayBuffer = await primaryFile.arrayBuffer();
        
        if (!active) return;

        const pdfjs = await getPdfJs();
        loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        if (!active) return;

        const pageCount = pdf.numPages;
        const previews: PDFPageInfo[] = [];

        for (let i = 1; i <= Math.min(pageCount, 150); i++) {
          if (!active) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });
          
          previews.push({
            index: i - 1, // 0-indexed representation
            rotation: 0,
            thumbnailUrl: '', // Will render dynamically/lazily inside LazyPDFPage component
            width: viewport.width,
            height: viewport.height
          });
          if (i % 5 === 0) await yieldToMain();
        }
        if (active) {
          setPdfDocument(pdf);
          setPdfPages(previews);
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          showToast('Info: Unable to render preview thumbnails for this document lock/format.', 'info');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    renderPDFThumbnails();

    return () => {
      active = false;
      if (loadingTask && typeof loadingTask.destroy === 'function') {
        loadingTask.destroy();
      }
    };
  }, [selectedFiles, activeTool]);

  // Action: Compress PDF Programmatically
  const executeCompress = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(45);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('compress');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, `compressed_${primaryFile.name}`);
          showToast('Document compressed successfully off the main thread!', 'success');
        } else {
          showToast(`Compression failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Compress Worker Error:', err);
        showToast('Worker connection error occurred during compression.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({ type: 'compress', fileBytes, quality: compressQuality }, [fileBytes.buffer]);
      setProcessingProgress(75);
    } catch (err: any) {
      showToast(`Compression failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Summarize and Analyze PDF Content Client-Side + Server-Side Gemini API Proxy
  const executeAIAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    const primaryFile = selectedFiles[0];
    setAiAnalyzing(true);
    setAiError(null);
    setAiAnalysisResult(null);
    setLoading(true);
    setProcessingProgress(10);

    try {
      showToast('Extracting document textual contents locally inside your browser...', 'info');
      
      const arrayBuffer = await primaryFile.arrayBuffer();
      setProcessingProgress(20);
      
      const pdfjs = await getPdfJs();
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true
      }).promise;
      
      setProcessingProgress(40);
      
      const pageCount = pdf.numPages;
      const scanLimit = Math.min(pageCount, 12);
      let extractedText = "";

      for (let i = 1; i <= scanLimit; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        extractedText += strings.join(" ") + "\n";
        
        const prg = Math.min(40 + Math.round((i / scanLimit) * 35), 75);
        setProcessingProgress(prg);
      }

      if (!extractedText.trim()) {
        throw new Error('PDF document text content appears completely empty. Is this a scanned-image only PDF?');
      }

      setProcessingProgress(80);
      showToast('Extract completed. Dispatching to secure Gemini proxy analytics...', 'info');

      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_CLOUDFLARE_API_URL || '';
      const response = await fetch(`${apiBase}/api/gemini-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, name: primaryFile.name }),
      });

      if (!response.ok) {
        const errJson: any = await response.json().catch(() => ({}));
        throw new Error((errJson && errJson.error) || `Proxy returned server code ${response.status}`);
      }

      const resJson: any = await response.json();
      setProcessingProgress(100);
      setAiAnalysisResult(resJson && resJson.analysis);
      showToast('Secure Gemini AI document intelligence completed successfully!', 'success');
    } catch (err: any) {
      console.error('AI Intelligence Error:', err);
      setAiError(err.message || 'An unexpected failure occurred while analyzing your file.');
      showToast(err.message || 'AI analysis step failed. See report diagnostics.', 'error');
    } finally {
      setLoading(false);
      setAiAnalyzing(false);
      setProcessingProgress(null);
    }
  };

  // Action: Merge PDFs
  const executeMerge = async () => {
    if (selectedFiles.length < 2) {
      showToast('Please select at least 2 PDF files to merge.', 'error');
      return;
    }

    setLoading(true);
    setProcessingProgress(15);
    try {
      const filesBytes: Uint8Array[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileBytes = await fileToBytes(file);
        filesBytes.push(fileBytes);
        if (i % 2 === 0) await yieldToMain();
      }

      setProcessingProgress(45);

      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('merge');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'merged_document.pdf');
          showToast('PDFs permanently merged completely offline via Secure Web Workers!', 'success');
        } else {
          showToast(`Merge failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Merge Worker Error:', err);
        showToast('Worker connection error occurred during merge.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      const buffers = filesBytes.map(fb => fb.buffer);
      worker.postMessage({ type: 'merge', files: filesBytes }, buffers);
      setProcessingProgress(75);
    } catch (err: any) {
      showToast(`Merge failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Helper parser for custom split/extraction ranges (e.g. "1-3, 5")
  const parsePageRanges = (rangeStr: string, totalPages: number): number[] => {
    const indices: number[] = [];
    const segments = rangeStr.replace(/\s+/g, '').split(',');

    for (const segment of segments) {
      if (segment.includes('-')) {
        const [startStr, endStr] = segment.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const lower = Math.max(1, Math.min(start, totalPages));
          const upper = Math.max(1, Math.min(end, totalPages));
          for (let i = Math.min(lower, upper); i <= Math.max(lower, upper); i++) {
            indices.push(i - 1);
          }
        }
      } else {
        const page = parseInt(segment, 10);
        if (!isNaN(page)) {
          const idx = page - 1;
          if (idx >= 0 && idx < totalPages) {
            indices.push(idx);
          }
        }
      }
    }
    return Array.from(new Set(indices)).sort((a, b) => a - b);
  };

  // Action: Split / Extract Range
  const executeSplit = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(15);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);
      const { PDFDocument } = await import('pdf-lib');
      const srcDoc = await PDFDocument.load(fileBytes);
      const totalPages = srcDoc.getPageCount();

      const targetPageIndices = parsePageRanges(splitRange, totalPages);
      
      if (targetPageIndices.length === 0) {
        showToast('Invalid page range format or out of bounds.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        return;
      }

      setProcessingProgress(45);

      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('split');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, `extracted_pages_${splitRange.replace(/[,*]/g, '_')}.pdf`);
          showToast('Requested pages extracted and compiled offline via Secure Web Workers!', 'success');
        } else {
          showToast(`Split operation failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Split Worker Error:', err);
        showToast('Worker connection error occurred during split.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({ type: 'split', fileBytes, targetPageIndices }, [fileBytes.buffer]);
      setProcessingProgress(75);
    } catch (err: any) {
      showToast(`Split operation failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Rotation Apply
  const executeRotate = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('rotate');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'rotated_document.pdf');
          showToast('Document rotations applied successfully off the main thread!', 'success');
        } else {
          showToast(`Rotation application failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Rotate Worker Error:', err);
        showToast('Worker connection error occurred during rotate.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      const pageRotations = pdfPages.map(p => ({ index: p.index, rotation: p.rotation }));
      worker.postMessage({ type: 'rotate', fileBytes, pageRotations }, [fileBytes.buffer]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Rotation application failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Protect PDF with client-side AES-GCM + PBKDF2 vault encryption
  const executeProtect = async () => {
    if (selectedFiles.length === 0) return;
    if (!password) {
      showToast('Please enter an encryption password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);
      
      const enc = new TextEncoder();
      const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
      const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
      
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBytes as any,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: ivBytes as any
        },
        key,
        fileBytes as any
      );
      
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const outputBytes = new Uint8Array(saltBytes.length + ivBytes.length + encryptedBytes.length);
      outputBytes.set(saltBytes, 0);
      outputBytes.set(ivBytes, saltBytes.length);
      outputBytes.set(encryptedBytes, saltBytes.length + ivBytes.length);

      triggerDownload(outputBytes, 'secured_document.pdf');
      showToast('Offline sandbox encryption lock applied successfully!', 'success');
    } catch (err: any) {
      showToast(`Security protection failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Remove protection from password encrypted active document
  const executeUnlock = async () => {
    if (selectedFiles.length === 0) return;
    if (!password) {
      showToast('Decryption passphrase required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);
      
      if (fileBytes.length < 28) {
        showToast("Incorrect password.", "error");
        setLoading(false);
        return;
      }

      const saltBytes = fileBytes.slice(0, 16);
      const ivBytes = fileBytes.slice(16, 28);
      const encryptedBytes = fileBytes.slice(28);

      const enc = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );

      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBytes as any,
          iterations: 100000,
          hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: ivBytes as any
          },
          key,
          encryptedBytes as any
        );

        const decryptedBytes = new Uint8Array(decryptedBuffer);

        // Validate decrypted result byte-integrity
        try {
          const { PDFDocument } = await import('pdf-lib');
          await PDFDocument.load(decryptedBytes);
          triggerDownload(decryptedBytes, 'unlocked_document.pdf');
          showToast('Password matches. Document decrypted and saved!', 'success');
        } catch {
          showToast('Incorrect password.', 'error');
        }
      } catch (cryptoErr) {
        console.error('Decryption failed:', cryptoErr);
        showToast('Incorrect password.', 'error');
      }
    } catch (err: any) {
      showToast(`Failed to unlock PDF. Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action: Write Page Numbers onto PDF
  const executeAddPageNumbers = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('page-numbers');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'numbered_document.pdf');
          showToast('Page numbers stamped successfully off the main thread.', 'success');
        } else {
          showToast(`Stamping failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Page Numbers Worker Error:', err);
        showToast('Worker connection error occurred during page numbering.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({
        type: 'page-numbers',
        fileBytes,
        pageNumberFormat,
        pageNumberPosition
      }, [fileBytes.buffer]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Stamping failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Embed Opacity Watermark Layer
  const executeWatermark = async () => {
    if (selectedFiles.length === 0) return;
    if (!watermarkText.trim()) {
      showToast('Enter valid watermark message.', 'error');
      return;
    }

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('watermark');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'watermarked_document.pdf');
          showToast('High contrast vector watermarks applied successfully off the main thread!', 'success');
        } else {
          showToast(`Watermark application failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Watermark Worker Error:', err);
        showToast('Worker connection error occurred during watermarking.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({
        type: 'watermark',
        fileBytes,
        watermarkText,
        watermarkOpacity,
        watermarkSize,
        watermarkRotation
      }, [fileBytes.buffer]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Watermark application failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Add blank page
  const executeAddBlankPage = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('add-blank');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'expanded_document.pdf');
          showToast(`Blank ${blankPageSize} page added successfully off the main thread.`, 'success');
        } else {
          showToast(`Insertion failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Blank Page Worker Error:', err);
        showToast('Worker connection error occurred during blank page insertion.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({
        type: 'add-blank',
        fileBytes,
        blankPageSize,
        blankPagePos,
        blankPageAt
      }, [fileBytes.buffer]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Insertion failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Multi-select selective page deletion
  const executeDeletePages = async () => {
    if (selectedFiles.length === 0) return;
    if (pagesToDelete.length === 0) {
      showToast('Select at least one page thumbnail from the preview below to delete.', 'info');
      return;
    }

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const fileBytes = await fileToBytes(primaryFile);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('delete-pages');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'sliced_document.pdf');
          showToast(`Deleted ${pagesToDelete.length} page(s) successfully off the main thread!`, 'success');
          setPagesToDelete([]);
        } else {
          showToast(`Deletion operation failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('Delete Pages Worker Error:', err);
        showToast('Worker connection error occurred during page deletion.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({
        type: 'delete-pages',
        fileBytes,
        pagesToDelete
      }, [fileBytes.buffer]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Deletion operation failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Image files compilation into PDF
  const executeImgToPdf = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please upload compliant images (JPG or PNG) first.', 'error');
      return;
    }

    setLoading(true);
    setProcessingProgress(15);
    try {
      const imageFilesData: { bytes: Uint8Array; type: string; name: string }[] = [];
      
      let progress = 15;
      for (let i = 0; i < selectedFiles.length; i++) {
        const imgFile = selectedFiles[i];
        const bytes = await fileToBytes(imgFile);
        imageFilesData.push({ bytes, type: imgFile.type, name: imgFile.name });
        progress = Math.min(60, progress + 10);
        setProcessingProgress(progress);
        if (i % 2 === 0) await yieldToMain();
      }

      setProcessingProgress(60);
      const { createDedicatedWorker } = await import('./core/WorkerManager');
      const worker = createDedicatedWorker('img-to-pdf');

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, 'image_compilation.pdf');
          showToast('Images successfully mapped into document.', 'success');
        } else {
          showToast(`Conversion failed: ${error}`, 'error');
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error('ImgToPdf Worker Error:', err);
        showToast('Worker connection error occurred during image compilation.', 'error');
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      const transferList = imageFilesData.map(item => item.bytes.buffer);
      worker.postMessage({
        type: 'img-to-pdf',
        imageFilesData
      }, transferList);
      setProcessingProgress(80);
    } catch (err: any) {
      showToast(`Conversion failed: ${err.message}`, 'error');
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Action: Render entire PDF and download high fidelity pages inside a ZIP container
  const executePdfToImg = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(0);
    try {
      const primaryFile = selectedFiles[0];
      const arrayBuffer = await primaryFile.arrayBuffer();
      
      const pdfjs = await getPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const zipDoc = new JSZip();

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        // High quality representation render
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          // Strip data header to acquire base64 binary values for ZIP writer
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          const base64Data = dataUrl.split(',')[1];
          zipDoc.file(`page_sequence_${i}.jpg`, base64Data, { base64: true });
        }

        setProcessingProgress(Math.round((i / totalPages) * 100));
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      const contentBlob = await zipDoc.generateAsync({ type: 'blob' });
      const dlLink = document.createElement('a');
      const zipUrl = URL.createObjectURL(contentBlob);
      dlLink.href = zipUrl;
      dlLink.download = 'pdf_converted_images.zip';
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
      URL.revokeObjectURL(zipUrl);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.85 }
      });
      showToast('Document conversion successful! Extracted ZIP downloaded.', 'success');
    } catch (err: any) {
      showToast(`Conversion to image failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  // Tools list configuration
  const toolsList = [
    {
      id: 'merge' as ToolType,
      name: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single master document sequentially.',
      icon: Merge,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300',
    },
    {
      id: 'split' as ToolType,
      name: 'Extract Pages',
      description: 'Extract specific page ranges to form a brand new light document.',
      icon: Scissors,
      color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300',
    },
    {
      id: 'rotate' as ToolType,
      name: 'Rotate Pages',
      description: 'Rotate individual or all pages of your PDF document physically.',
      icon: RotateCw,
      color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300',
    },
    {
      id: 'delete-pages' as ToolType,
      name: 'Delete Pages',
      description: 'Review rendered page previews and prune unneeded pages interactively.',
      icon: Trash2,
      color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300',
    },
    {
      id: 'watermark' as ToolType,
      name: 'Add Watermark',
      description: 'Stamp customized overlay text with precision tilt and opacity control.',
      icon: Stamp,
      color: 'bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300',
    },
    {
      id: 'page-numbers' as ToolType,
      name: 'Page Numbers',
      description: 'Stamp sequential page count strings cleanly atop or below pages.',
      icon: Hash,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
    },
    {
      id: 'add-blank' as ToolType,
      name: 'Add Blank Page',
      description: 'Insert standard blank empty canvas sheets anywhere in the document.',
      icon: Plus,
      color: 'bg-violet-50 text-violet-600 border-violet-100 hover:border-violet-300',
    },
    {
      id: 'protect' as ToolType,
      name: 'Secure Private Vault',
      description: 'Encrypt document bytes client-side with a strong secret offline key derived from password using AES-GCM.',
      icon: Lock,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300',
    },
    {
      id: 'unlock' as ToolType,
      name: 'Unlock Private Vault',
      description: 'Decrypt and restore AES-GCM encrypted documents locally inside your browser cache.',
      icon: Unlock,
      color: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300',
    },
    {
      id: 'img-to-pdf' as ToolType,
      name: 'Image to PDF',
      description: 'Stitch standard images (JPG/PNG) into beautiful, page-synchronized PDFs.',
      icon: Image,
      color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 hover:border-fuchsia-300',
    },
    {
      id: 'pdf-to-img' as ToolType,
      name: 'PDF to Image',
      description: 'Render PDF page content client-side to export individual sharp JPEGs in ZIP.',
      icon: Layers,
      color: 'bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300',
    },
    {
      id: 'compress' as ToolType,
      name: 'Compress PDF',
      description: 'Perform advanced, non-destructive file size reductions completely offline.',
      icon: Minimize2,
      color: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300',
    },
    {
      id: 'ai-analyze' as ToolType,
      name: 'AI Analyze Document',
      description: 'Generate high-fidelity executive summaries, key action points, tags using Gemini.',
      icon: Brain,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300',
    },
  ];

  const handleThumbnailRotate = (idx: number) => {
    setPdfPages(prev => prev.map(p => {
      if (p.index === idx) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
    showToast(`Page ${idx + 1} rotated locally in preview. Press Apply to save.`, 'info');
  };

  const togglePageDeletion = (idx: number) => {
    setPagesToDelete(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  return (
    <ErrorBoundary>
      <div id="pdfminty-root" className="min-h-screen flex flex-col bg-slate-50 transition-colors duration-200">
      
      {/* Dynamic Toast Notifications */}
      <div id="toast-deck" className="fixed top-4 right-4 left-4 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 sm:max-w-sm pointer-events-none"> aria-live="polite" aria-atomic="true"
        {toasts.map(toast => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-slideup ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-teal-400 shrink-0" />}
            <span className="text-xs font-medium tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Modern High Contrast Top Menu */}
      <header id="header-bar" className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTool(null); clearWorkspace(); }}
          >
            <div className="p-2 bg-emerald-500 rounded-xl text-white group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/10">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">PDFMinty</span>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest leading-none mt-0.5">Offline Document Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-sans">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 tracking-wider uppercase border border-slate-200/50">
              🔒 100% Client-Side Encryption
            </span>
          </div>
        </div>
      </header>

      {/* Primary Workspace Space */}
      <main id="main-space" className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {!activeTool ? (
          // Main Dashboard Showcase
          <div className="animate-fadein">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-100 rounded-full text-emerald-600 text-xs font-semibold mb-4 leading-none">
                <Sparkles className="w-3 h-3 animate-pulse" /> Corrected Local Scripts & Secure Bundled Worker Engines
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                Full-Featured Professional <span className="text-emerald-500 font-extrabold">PDF Studio</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base font-normal max-w-xl mx-auto">
                Modify, protect, transform, and number your confidential papers with professional visual previews completely in-browser. Zero servers. 
                Zero CORS/CSP timeouts. Complete offline independence.
              </p>
            </div>

            {/* Grid of Modular Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolsList.map(tool => {
                const Icon = tool.icon;
                return (
                  <button type="button"
                    key={tool.id}
                    id={`tool-card-${tool.id}`}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setActiveTool(tool.id);
                      clearWorkspace();
                    }}
                    className="p-6 rounded-2xl border bg-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 border ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-emerald-600 transition-colors">{tool.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{tool.description}</p>
                  </button>
                );
              })}
            </div>

            {/* How PDFMinty Works */}
            <div className="mt-20">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center tracking-tight mb-2">How PDFMinty Works</h2>
              <p className="text-slate-500 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">Three simple steps to manage your documents</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div id="step-1-card" className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">1</div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Select Files</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Choose your PDF files from your computer or mobile device. Files are stored entirely temporarily in your browser's IndexedDB storage.
                  </p>
                </div>

                <div id="step-2-card" className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">2</div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Process Locally</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Our browser-based engine handles the work. They are never sent to any external server or third-party service.
                  </p>
                </div>

                <div id="step-3-card" className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">3</div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Download & Clean</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Get your processed PDF instantly. All temporary data is cleared automatically when you close the browser tab.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Choose PDFMinty? */}
            <div className="mt-20">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center tracking-tight mb-2">Why Choose PDFMinty?</h2>
              <p className="text-slate-500 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">Professional grade tools without the premium price tag.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div id="why-card-1" className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 shadow-sm">
                    <Shield className="w-6 h-6 text-sky-500 fill-sky-500/10" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">100% Private</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Your files never leave your device. All processing happens locally in your browser.
                  </p>
                </div>

                <div id="why-card-2" className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 shadow-sm">
                    <span className="text-amber-500 font-bold text-xl leading-none">⚡</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Lightning Fast</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    No waiting for uploads or downloads. Get your results instantly.
                  </p>
                </div>

                <div id="why-card-3" className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 shadow-sm">
                    <span className="bg-indigo-600 text-white text-xs font-black tracking-widest px-2.5 py-1 rounded shadow-sm">FREE</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Completely Free</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    No hidden fees, no subscriptions, and no watermarks on your documents.
                  </p>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions / Privacy & Security */}
            <div id="faq-section" className="mt-20 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center tracking-tight mb-8">
                Frequently Asked Questions / Privacy & Security
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "Privacy & Security: Are my files safe?",
                    a: "Yes, completely! PDFMinty operates 100% client-side. Your files are processed local to your browser using safe WebAssembly and JavaScript compilation. They are never transmitted to any external server or stored anywhere online."
                  },
                  {
                    q: "Is it really free?",
                    a: "Yes, PDFMinty is 100% free with no premium subscriptions, no lockouts, and no watermarks. We believe professional formatting utilities should be accessible to everyone."
                  },
                  {
                    q: "Do I need to install anything?",
                    a: "No installation is required. PDFMinty runs directly in any modern device browser (Chrome, Safari, Firefox, Edge) both on desktop and mobile platforms."
                  },
                  {
                    q: "Does it work offline?",
                    a: "Yes! Because the application uses persistent client-side caching of workers and libraries, you can continue loading and processing your documents even without an active internet connection."
                  }
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      id={`faq-item-${idx}`}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer text-slate-700 hover:text-indigo-600"
                      >
                        <span className="text-sm font-bold">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-4 animate-bounce-short" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-4" />
                        )}
                      </button>
                      
                      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 border-t border-slate-100' : 'max-h-0'}`}>
                        <p className="p-6 text-xs text-slate-500 leading-relaxed bg-slate-50/30">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ready to Mint Your PDF banner */}
            <div id="cta-banner" className="mt-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Ready to Mint Your PDF?</h2>
                <p className="text-indigo-100 text-sm md:text-base font-normal mb-8">
                  Experience the fastest and most secure PDF tools today.
                </p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white text-indigo-700 hover:bg-slate-100 px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Active Tool Sandbox
          <div className="animate-fadein bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            
            {/* Tool Sandbox Navbar */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <button
                id="back-to-dashboard"
                onClick={() => { window.scrollTo(0, 0); setActiveTool(null); clearWorkspace(); }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors w-fit group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  {React.createElement(toolsList.find(t => t.id === activeTool)?.icon || FileText, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 leading-none">
                    {toolsList.find(t => t.id === activeTool)?.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">WORKSPACE ACTIVE</p>
                </div>
              </div>
            </div>

            {/* Config & Work Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1">
              
              {/* Left Column: configuration, action triggers and uploads */}
              <div className="lg:col-span-4 p-6 flex flex-col gap-6">
                
                {/* File Dropzone Section */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">Upload Target File(s)</span>
                  
                  {/* Unified File Input placed outside to prevent recursive bubbling blocks on mobile */}
                  <input aria-label="File upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple={activeTool === 'merge' || activeTool === 'img-to-pdf'}
                    accept={activeTool === 'img-to-pdf' ? 'image/jpeg,image/png' : 'application/pdf'}
                    className="hidden min-h-[48px] p-2"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div
                    id="dropzone-area"
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all active:scale-[0.99] select-none flex flex-col items-center justify-center min-h-[180px] ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[0.98]'
                        : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50/30'
                    }`}
                  >
                    <FileUp className="w-8 h-8 text-emerald-500 mb-3 animate-pulse" />
                    <p className="text-xs font-extrabold text-slate-700 max-w-[240px] leading-tight">
                      {activeTool === 'img-to-pdf' ? 'Drag & drop clear JPG, PNG images' : 'Drag & drop standard PDF file here'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Or use the tap upload below</p>
                    
                    {/* Highly tactile touch-target button conforming to Mobile guidelines */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 w-full max-w-[220px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer min-h-[48px] transition-transform duration-75 active:scale-[0.97]"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>Choose File(s)</span>
                    </button>
                  </div>
                </div>

                {/* Showing Selected Files Stack */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">Selected Elements ({selectedFiles.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const previewEl = document.getElementById('visual-verification-canvas');
                            previewEl?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                          title="Scroll to previews below"
                        >
                          👁️ Previews
                        </button>
                        <button 
                          id="clear-files-btn"
                          type="button"
                          onClick={clearWorkspace} 
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-100 transition-colors min-h-[48px] min-w-[48px] p-2"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 p-1 bg-slate-50">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="p-2 flex items-center justify-between text-xs text-slate-600 font-medium">
                          <span className="truncate pr-4 max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-slate-500 shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configurations parameters dependant on Tool */}
                <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
                  <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">Operation Settings</span>

                  {/* Settings module rendering dynamically */}
                  {activeTool === 'merge' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                        💡 Dropped PDFs are concatenated in the sequence they are shown in the list box above. Clear and load them in custom orders to sequence.
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs space-y-2 text-left">
                        <strong className="text-emerald-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select or drag-and-drop multiple PDF files.</li>
                          <li>Pages will be ordered according to the sequence in the list.</li>
                          <li>Click <span className="font-bold text-slate-800">Merge PDFs</span> below to compile and download.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'split' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Extract Range Definition</label>
                        <input aria-label="Input field"
                          type="text"
                          value={splitRange}
                          onChange={(e) => setSplitRange(e.target.value)}
                          placeholder="e.g. 1-3, 5, 8-10"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-500 leading-relaxed block font-sans">
                          Specify exact indexes with hyphens for ranges and commas for distinct indexes. (e.g., "1-2, 5" gets pages 1, 2 and 5)
                        </span>
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs space-y-2 text-left">
                        <strong className="text-blue-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select the PDF file you want to split.</li>
                          <li>Type page numbers or ranges in the input field above (e.g., <code className="bg-white px-1 py-0.5 rounded border">1-3, 5</code>).</li>
                          <li>Click <span className="font-bold text-slate-800">Extract Pages</span> below to download the split PDF.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'watermark' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Overlay Text Msg</label>
                        <input aria-label="Input field"
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="e.g. CONFIDENTIAL"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Opacity</span>
                          <span>{Math.round(watermarkOpacity * 100)}%</span>
                        </div>
                        <input aria-label="Input field"
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">Font Size ({watermarkSize}px)</label>
                          <input aria-label="Input field"
                            type="number"
                            min="12"
                            max="120"
                            value={watermarkSize}
                            onChange={(e) => setWatermarkSize(parseInt(e.target.value) || 24)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">Rotation ({watermarkRotation}°)</label>
                          <input aria-label="Input field"
                            type="number"
                            min="-180"
                            max="180"
                            value={watermarkRotation}
                            onChange={(e) => setWatermarkRotation(parseInt(e.target.value) || 0)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                          />
                        </div>
                      </div>
                      <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 text-xs space-y-2 text-left">
                        <strong className="text-teal-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Upload your PDF document.</li>
                          <li>Type your watermark text in the box (e.g., <code className="bg-white px-1 py-0.5 rounded border font-sans">APPROVED</code>).</li>
                          <li>Set opacity and angle using the slider and rotation input.</li>
                          <li>Click <span className="font-bold text-slate-800">Apply Watermark</span> below to compile and download.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'protect' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Set Protection Password</label>
                        <input aria-label="Input field"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Type security password"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-500 leading-none">The output document requires this password to unlock.</span>
                      </div>
                      <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 text-xs space-y-2 text-left">
                        <strong className="text-cyan-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select your confidential or personal PDF file.</li>
                          <li>Type a strong offline password in the field above.</li>
                          <li>Click <span className="font-bold text-slate-800">Protect Vault</span> below to download the encrypted PDF.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'unlock' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">Enter Safety Password</label>
                        <input aria-label="Input field"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Passphrase to decrypt"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-500 leading-none">Must submit active document password keys. All locks will be permanently removed.</span>
                      </div>
                      <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-xs space-y-2 text-left">
                        <strong className="text-orange-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select the locked or encrypted PDF file.</li>
                          <li>Enter the correct password of the file in the field above.</li>
                          <li>Click <span className="font-bold text-slate-800">Unlock Vault</span> below to decrypt and save the unlocked copy.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'page-numbers' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">Display Format</label>
                          <select aria-label="Select option"
                            value={pageNumberFormat}
                            onChange={(e) => setPageNumberFormat(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 mt-1"
                          >
                            <option value="simple">Simple digit ("1", "2")</option>
                            <option value="page-of">Format sequence ("Page 1 of 10")</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">Placement Position</label>
                          <select aria-label="Select option"
                            value={pageNumberPosition}
                            onChange={(e) => setPageNumberPosition(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 mt-1"
                          >
                            <option value="bottom-center">Bottom Center</option>
                            <option value="top-center">Top Center</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs space-y-2 text-left">
                        <strong className="text-indigo-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select or upload the PDF file you want to number.</li>
                          <li>Select the page number format and position (header or footer) from the dropdowns.</li>
                          <li>Click <span className="font-bold text-slate-800">Stamp Numbers</span> below to compile and download.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'add-blank' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">Page Dimensions</label>
                          <select aria-label="Select option"
                            value={blankPageSize}
                            onChange={(e) => setBlankPageSize(e.target.value as 'A4' | 'Letter')}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 mt-1"
                          >
                            <option value="A4">A4 Standard Format</option>
                            <option value="Letter">US Letter Format</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">Specific Position</label>
                          <select aria-label="Select option"
                            value={blankPagePos}
                            onChange={(e) => setBlankPagePos(e.target.value as 'start' | 'end' | 'custom')}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 mt-1"
                          >
                            <option value="start">At the very start</option>
                            <option value="end">At the absolute end</option>
                            <option value="custom">Custom page reference index</option>
                          </select>
                        </div>
                        {blankPagePos === 'custom' && (
                          <div>
                            <label className="text-xs font-bold text-slate-700 block">Insert Page At Position Number</label>
                            <input aria-label="Input field"
                              type="number"
                              min="1"
                              value={blankPageAt}
                              onChange={(e) => setBlankPageAt(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1"
                            />
                          </div>
                        )}
                      </div>
                      <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 text-xs space-y-2 text-left">
                        <strong className="text-violet-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Upload your main PDF document.</li>
                          <li>Select the blank page size (A4 or US Letter).</li>
                          <li>Choose the page position (e.g., at the beginning, at the end, or a custom page index).</li>
                          <li>Click <span className="font-bold text-slate-800">Insert Blank Page</span> below to compile and download.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'delete-pages' && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-xs text-slate-600 leading-relaxed">
                        💡 Click directly on the page checkboxes in the preview area to select. Page indexes marked in red or with checks will be omitted entirely upon compilation. ({pagesToDelete.length} selected).
                      </div>
                      <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-xs space-y-2 text-left">
                        <strong className="text-rose-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select or drop the PDF file to upload.</li>
                          <li>Click the checkboxes on the right-side preview pages that you want to delete.</li>
                          <li>Click <span className="font-bold text-slate-800">Keep Remaining</span> below to compile and download the new PDF.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'pdf-to-img' && (
                    <div className="space-y-4">
                      <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-xs text-sky-850 leading-relaxed">
                        💡 Outputs high fidelity JPG assets compiled locally using JSZip inside an archive.
                      </div>
                      <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-xs space-y-2 text-left">
                        <strong className="text-sky-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Upload the PDF file you wish to convert to images.</li>
                          <li>Click <span className="font-bold text-slate-800">Convert to JPEGs</span> below.</li>
                          <li>Every page will be converted to a high-resolution JPEG, and a compiled `.zip` file will download automatically.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'rotate' && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-xs text-slate-600 leading-relaxed">
                        💡 Use the rotation turn icons on the individual page thumbnail cards inside the preview area. Angles resolve and overwrite on target file creation.
                      </div>
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs space-y-2 text-left">
                        <strong className="text-amber-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Upload the PDF file you wish to rotate.</li>
                          <li>Click the rotate icon on individual page previews on the right to rotate them.</li>
                          <li>Click <span className="font-bold text-slate-800">Apply changes</span> below to compile your rotated PDF.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'img-to-pdf' && (
                    <div className="space-y-4">
                      <div className="bg-fuchsia-50/50 p-4 rounded-xl border border-fuchsia-100 text-xs space-y-2 text-left">
                        <strong className="text-fuchsia-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select or drag-and-drop the images (JPG/PNG) you want to compile into a PDF.</li>
                          <li>Verify or re-order page sequence in the preview deck above if needed.</li>
                          <li>Click <span className="font-bold text-slate-800">Convert to PDF</span> below to generate and download.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'compress' && (
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Compression Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'high', label: 'Maximum', desc: '⚠️ High' },
                            { value: 'medium', label: 'Balanced', desc: '⚡ Recommend' },
                            { value: 'low', label: 'Lossless', desc: '✨ Raw' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setCompressQuality(opt.value as any)}
                              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                                compressQuality === opt.value
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <div className="text-xs font-extrabold">{opt.label}</div>
                              <div className="text-xs font-bold opacity-75 mt-0.5">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 text-xs space-y-2">
                        <strong className="text-pink-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select the PDF file you wish to compress.</li>
                          <li>Choose your desired compression quality mode.</li>
                          <li>Click the <span className="font-bold text-pink-700">Compile & Export</span> button below to process and save.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTool === 'ai-analyze' && (
                    <div className="space-y-4 text-left">
                      <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 leading-relaxed font-sans">
                        🔒 **Local-first Text Parsing**: To prevent heavy bandwidth usage and safeguard your deep privacy, PDFMinty extracts raw text locally inside your browser cache first. We only proxy raw text payloads.
                      </div>

                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <strong className="text-indigo-800 font-bold block">💡 How to Use:</strong>
                        <ul className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                          <li>Select the document that you wish to summarize.</li>
                          <li>Click the <span className="font-bold text-indigo-700">Compile & Export</span> button below.</li>
                          <li>The AI analysis report produced by Gemini AI will render in the right preview panel.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Execute Action Buttons */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button
                    id="execute-main-action"
                    disabled={selectedFiles.length === 0 || loading}
                    onClick={() => {
                      if (activeTool === 'merge') executeMerge();
                      else if (activeTool === 'split') executeSplit();
                      else if (activeTool === 'rotate') executeRotate();
                      else if (activeTool === 'protect') executeProtect();
                      else if (activeTool === 'unlock') executeUnlock();
                      else if (activeTool === 'page-numbers') executeAddPageNumbers();
                      else if (activeTool === 'watermark') executeWatermark();
                      else if (activeTool === 'add-blank') executeAddBlankPage();
                      else if (activeTool === 'delete-pages') executeDeletePages();
                      else if (activeTool === 'img-to-pdf') executeImgToPdf();
                      else if (activeTool === 'pdf-to-img') executePdfToImg();
                      else if (activeTool === 'compress') executeCompress();
                      else if (activeTool === 'ai-analyze') executeAIAnalyze();
                    }}
                    className={`w-full py-3.5 rounded-xl text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/10 cursor-pointer transition-all ${
                      selectedFiles.length === 0 || loading
                        ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
                        : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Download className="w-4.5 h-4.5" />
                    )}
                    {loading 
                      ? 'Processing Document...' 
                      : `Compile & Export ${toolsList.find(t => t.id === activeTool)?.name.split(' ')[0]}`
                    }
                  </button>
                  {processingProgress !== null && (
                    <div className="mt-3 space-y-1.5" role="status" aria-live="polite">
                      <div className="flex justify-between text-xs font-bold text-emerald-600">
                        <span>Rendering Page Sequences</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <progress value={processingProgress} max="100" className="w-full h-2 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500 transition-all"></progress>
                    </div>
                  )}

                  {completedResult && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/55 border border-emerald-200/80 shadow-md animate-fade-in space-y-3.5 text-left">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1 px-2 text-xs font-black bg-emerald-500 text-white rounded-md tracking-wider uppercase mt-0.5">
                          ✓ Ready
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-extrabold text-slate-800">Resource file compiled successfully!</h3>
                          <p className="text-xs text-emerald-800 font-bold leading-tight truncate">
                            {completedResult.filename}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Download anchor conforming to strict iOS / standalone touch target (>= 48px) */}
                        <a
                          href={completedResult.url}
                          download={completedResult.filename}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs py-3 px-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-transform active:scale-95 text-center cursor-pointer min-h-[48px]"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          <span>Download</span>
                        </a>

                        {/* Inline Open Preview fallback for Apple / iOS Safari limitations */}
                        <button
                          type="button"
                          onClick={() => {
                            window.open(completedResult.url, '_blank');
                          }}
                          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-extrabold text-xs py-3 px-3 rounded-xl transition-colors active:scale-95 text-center cursor-pointer min-h-[48px]"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Open Inline</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 leading-tight font-medium">
                        💡 iOS Safari Users: If download does not start automatically, please tap "Open Inline" to save or print the PDF directly from the browser viewer.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Previews Sandbox / Drag items list */}
              <div id="visual-verification-canvas" className="lg:col-span-8 p-6 bg-slate-50/30 flex flex-col scroll-mt-20 min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-slate-500 tracking-wider uppercase">Visual Verification Canvas</span>
                  {pdfPages.length > 0 && (
                    <span className="text-xs text-slate-500 font-bold px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200/50">
                      Loaded total {pdfPages.length} rendered pages
                    </span>
                  )}
                </div>

                {loading && pdfPages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                    <p className="text-slate-600 text-xs font-semibold">Generating document thumbnail configurations locally...</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">100% Client-Side Render Layer</p>
                  </div>
                ) : selectedFiles.length === 0 ? (
                  <div className="flex-1 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-white/50 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">No active documents uploaded</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Upload target PDF document or compatible imagery elements in the configuration section to populate sandbox.
                    </p>
                  </div>
                ) : activeTool === 'img-to-pdf' ? (
                  /* Special rendering list for images uploaded to image-to-pdf */
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 overflow-y-auto font-sans">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 col-span-full">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-36">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded leading-none uppercase">Item {idx + 1}</span>
                            <button aria-label="Remove image" id={`remove-img-${idx}`}
                              onClick={() => setSelectedFiles(prev => prev.filter((_, fIdx) => fIdx !== idx))}
                              className="p-1.5 bg-rose-50 hover:bg-rose-150 rounded-lg text-rose-500 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer transition-colors"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="my-2 h-12 flex items-center justify-center overflow-hidden rounded bg-slate-100">
                            {file.type.startsWith('image/') && imageUrls[`${file.name}-${file.size}-${file.lastModified}`] ? (
                              <img src={imageUrls[`${file.name}-${file.size}-${file.lastModified}`]} className="object-cover h-full w-full" alt="thumbnail" referrerPolicy="no-referrer" loading="lazy" decoding="async" width="48" height="48" />
                            ) : (
                              <Image className="w-5 h-5 text-slate-300" />
                            )}
                          </div>

                          <div className="text-xs font-bold text-slate-600 truncate max-w-full">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTool === 'ai-analyze' ? (
                  /* Upgraded Premium AI Analysis Dashboard Output */
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 overflow-y-auto font-sans flex flex-col justify-start">
                    {aiAnalyzing ? (
                      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-slate-100">
                        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <h3 className="text-sm font-bold text-slate-800">Gemini Intelligence Analyzing...</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                          Extracting textual features locally, validating tokens, and generating premium summary and categorized index streams safely.
                        </p>
                        {processingProgress && (
                          <div className="w-full max-w-xs mt-4">
                            <div className="flex justify-between text-xs text-slate-500 font-extrabold mb-1">
                              <span>Local OCR Scan</span>
                              <span>{processingProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${processingProgress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : aiError ? (
                      <div role="alert" className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-rose-50/30 rounded-xl border border-rose-100/50 text-slate-700">
                        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                        <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest">Analysis Failure</h3>
                        <p className="text-xs text-rose-800 font-semibold mt-1 max-w-md">{aiError}</p>
                        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-tight">
                          Please verify your network connection, support of local browser API endpoints, and ensure that your Pages Environment has the required credentials.
                        </p>
                      </div>
                    ) : aiAnalysisResult ? (
                      <div className="space-y-6 text-left animate-fade-in flex flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              <span>Gemini AI Analytics Dashboard</span>
                            </h3>
                            <p className="text-xs text-indigo-600 font-bold mt-0.5 uppercase tracking-wider">
                              Secure Sandbox Intelligence report
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* Download summary logic */}
                            <button
                              onClick={() => {
                                const dlBlob = new Blob([aiAnalysisResult], { type: 'text/plain' });
                                const dlUrl = URL.createObjectURL(dlBlob);
                                const a = document.createElement('a');
                                a.href = dlUrl;
                                a.download = `AI_Summary_${selectedFiles[0]?.name || 'document'}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(dlUrl);
                                showToast('Summary text file exported and downloaded!', 'success');
                              }}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer select-none min-h-[44px] flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5 shrink-0" />
                              <span>Save Text</span>
                            </button>

                            {/* Copy logic */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(aiAnalysisResult).then(() => {
                                  showToast('AI analysis copied to clipboard!', 'success');
                                }).catch(() => {
                                  showToast('Unable to access clipboard. Please select text manually.', 'error');
                                });
                              }}
                              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 text-xs font-extrabold rounded-xl transition-all cursor-pointer select-none min-h-[44px] flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 shrink-0" />
                              <span>Copy Summary</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 overflow-y-auto max-h-[500px]">
                          <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed text-slate-600 whitespace-pre-line font-medium">
                            {aiAnalysisResult}
                          </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs font-medium text-slate-500 leading-normal shrink-0">
                          ⚠️ **AI Model Disclaimer**: AI translations or text intelligence is produced automatically via serverless machine learning models. Accuracy may vary. Verify any legal or critical metrics individually.
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-slate-100">
                        <Brain className="w-12 h-12 text-slate-350 mb-3 animate-pulse" />
                        <h3 className="text-xs font-extrabold text-slate-700">Intel Dashboard Sleeping</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-tight">
                          Press "Compile & Export" in the parameters section to trigger local OCR text extraction and construct your complete secure report.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Rendering detailed PDF pages previews for page manipulation */
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 overflow-y-auto">
                    {pdfPages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center">
                        <Check className="w-12 h-12 text-emerald-500 bg-emerald-50 p-2.5 rounded-full mb-3" />
                        <p className="text-xs font-extrabold text-slate-700">Document ready for export</p>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Previews aren't available for this safe-encrypt target, proceed with parameters in the configuration panel.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {pdfPages.map((page) => {
                          const isPageDeleted = pagesToDelete.includes(page.index);
                          return (
                            <div 
                              key={page.index} 
                              id={`page-card-${page.index}`}
                              onClick={() => {
                                if (activeTool === 'delete-pages') {
                                  togglePageDeletion(page.index);
                                } else if (activeTool === 'rotate') {
                                  handleThumbnailRotate(page.index);
                                }
                              }}
                              className={`group relative border rounded-xl bg-slate-50/50 p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                                (activeTool === 'delete-pages' || activeTool === 'rotate')
                                  ? 'cursor-pointer active:scale-[0.98]'
                                  : ''
                              } ${
                                isPageDeleted
                                  ? 'border-rose-300 bg-rose-50/30'
                                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2 shrink-0">
                                <span className="text-xs font-extrabold text-slate-500">PAGE {page.index + 1}</span>
                                
                                {/* Dynamic context controls inside thumbnail cards */}
                                {activeTool === 'delete-pages' && (
                                  <input aria-label="Input field"
                                    type="checkbox"
                                    checked={isPageDeleted}
                                    readOnly
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => {}}
                                    className="w-5 h-5 rounded text-rose-500 focus:ring-rose-400 cursor-pointer border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                  />
                                )}

                                {activeTool === 'rotate' && (
                                  <button aria-label="Rotate page" id={`rotate-${page.index}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleThumbnailRotate(page.index);
                                    }}
                                    className="p-1 px-2 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:text-emerald-700 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all cursor-pointer flex items-center gap-1 font-sans text-xs font-bold"
                                    title="Rotate 90 degrees clockwise"
                                  >
                                    <RotateCw className="w-3 h-3 transition-transform hover:rotate-90" />
                                    <span>Rotate</span>
                                  </button>
                                )}
                              </div>

                              <div className="my-2 flex-grow h-32 flex items-center justify-center overflow-hidden rounded-md bg-white border border-slate-100 shadow-sm relative">
                                <LazyPDFPage
                                  pdfDoc={pdfDocument}
                                  pageIndex={page.index}
                                  rotation={page.rotation}
                                />
                                {isPageDeleted && (
                                  <div className="absolute inset-0 bg-rose-100/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="text-xs font-black text-rose-600 bg-white border border-rose-200 py-1 px-2.5 rounded-full shadow-sm tracking-wide uppercase">Omit Page</span>
                                  </div>
                                )}
                              </div>

                              {activeTool === 'rotate' && page.rotation > 0 ? (
                                <div className="text-xs font-bold text-center text-amber-600 mt-2 leading-none uppercase">
                                  Rotation +{page.rotation}°
                                </div>
                              ) : (
                                (activeTool === 'delete-pages' || activeTool === 'rotate') && (
                                  <div className="text-xs font-semibold text-center text-slate-500 mt-1 leading-none uppercase">
                                    {activeTool === 'delete-pages' ? 'Tap to toggle omit' : 'Tap card to rotate'}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      {/* Botton Lock Alert Block */}
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-2 font-sans">
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center justify-center gap-3 max-w-2xl mx-auto shadow-sm text-center">
          <span className="text-lg">🔒</span>
          <p className="text-xs font-bold text-slate-700 leading-snug">
            <span className="text-emerald-600 mr-1">100% Secure & Private.</span> All files are processed locally on your device. No data is ever uploaded to our servers.
          </p>
        </div>
      </div>
      </main>

      <footer id="footer-menu" className="border-t border-slate-200/60 bg-white py-12 transition-colors font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
          
          {/* Quick Info badging */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
              🛡️ Privacy Secure
            </span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1.5 shadow-sm">
              📂 100% Offline Core
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 flex items-center gap-1.5 shadow-sm">
              ✨ Free Forever
            </span>
          </div>

          {/* Centered Feedback & Contact & FAQ links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-slate-600">
            <button
              id="open-feedback-modal"
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4.5 h-4.5 text-emerald-500" /> Provide Feedback
            </button>
            <button
              id="open-contact-modal"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <Mail className="w-4.5 h-4.5 text-blue-500" /> Contact Us
            </button>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                setActiveTool(null);
                setTimeout(() => {
                  const faqSection = document.getElementById('faq-section');
                  faqSection?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4.5 h-4.5 text-indigo-500" /> Privacy & FAQ
            </button>
          </div>

          {/* PDFMinty Ownership Details */}
          <div className="max-w-2xl text-xs text-slate-500 space-y-3 leading-relaxed border-t border-slate-100 pt-6">
            <p className="font-extrabold text-slate-800">
              PDFMinty Proprietorship & Copyright Information
            </p>
            <p className="font-medium">
              © 2026 PDFMinty. All rights reserved. PDFMinty is a 100% secure, independent, and open-source client-side offline distributed studio. No files or user data processed here are ever uploaded to remote servers. All calculations and file generations are performed securely inside the user's browser using local Web Worker technology.
            </p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
              Developed by & under Proprietorship of PDFMinty. Strictly safe & distributed.
            </p>
          </div>
        </div>
      </footer>

      {/* Feedback Modal Overlay */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadein">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 animate-slideup relative text-left"
            id="feedback-modal-content" role="dialog" aria-modal="true" aria-labelledby="feedback-title"
          >
            <button aria-label="Close dialog" onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-600 transition-colors text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <h2 id="feedback-title" className="text-xl md:text-2xl font-black text-slate-900 mb-2">Provide Feedback</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Let us know your thoughts or any issues you have faced with our browser tools.</p>
            
            <form onSubmit={submitFeedback} className="space-y-5 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Rate your experience *</label>
                <div className="flex justify-between items-center gap-2 py-2">
                  {[
                    { val: 1, label: '😩', name: 'Very Bad' },
                    { val: 2, label: '🙁', name: 'Poor' },
                    { val: 3, label: '😐', name: 'Average' },
                    { val: 4, label: '🙂', name: 'Good' },
                    { val: 5, label: '😄', name: 'Excellent' }
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setFeedbackRating(r.val)}
                      className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center border transition-all cursor-pointer ${
                        feedbackRating === r.val
                          ? 'border-indigo-600 bg-indigo-50/50 scale-105'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{r.label}</span>
                      <span className="text-xs font-bold text-slate-500">{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Feedback Message *</label>
                <textarea aria-label="Text area"
                  required
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details about what you liked, or where we can improve..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address (Optional)</label>
                <input aria-label="Input field"
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] p-2"
                >
                  {feedbackSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Us Modal Overlay */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadein">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 animate-slideup relative text-left"
            id="contact-modal-content" role="dialog" aria-modal="true" aria-labelledby="contact-title"
          >
            <button aria-label="Close dialog" onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-600 transition-colors text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Contact Us</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Drop us an inquiry and our team will get back to you as soon as possible.</p>
            
            <form onSubmit={submitContactUs} className="space-y-4 text-left font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                  <input aria-label="Input field"
                    required
                    autoFocus
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Email *</label>
                  <input aria-label="Input field"
                    required
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject *</label>
                <input aria-label="Input field"
                  required
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Inquiry or partnership topic"
                  className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message *</label>
                <textarea aria-label="Text area"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type details of your message..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] p-2"
                >
                  {contactSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Scroll back to top trigger */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:translate-y-[-2px] hover:scale-105 active:scale-95 transition-all cursor-pointer z-40 group"
        title="Scroll to Top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:translate-y-[-1px] transition-transform animate-none" />
      </button>
    </div>
    </ErrorBoundary>
  );
}
