import React, { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  progress?: number | null;
  children: React.ReactNode;
}

export default function LoadingButton({ 
  loading, 
  progress, 
  children, 
  className = '', 
  ...props 
}: Props) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`
        relative overflow-hidden touch-target
        px-6 py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase
        transition-all duration-300 active:scale-[0.98]
        disabled:opacity-80 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {/* Wave-like Progress Bar Overlay */}
      {loading && progress !== undefined && progress !== null && progress > 0 && (
        <div 
          className="absolute inset-y-0 left-0 bg-white/20 dark:bg-white/10 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}

      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span>
          {loading 
            ? (progress !== undefined && progress !== null && progress > 0 
                ? `Processing (${Math.round(progress)}%)` 
                : "Processing...") 
            : children
          }
        </span>
      </span>
    </button>
  );
}
