import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  isDebouncing: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  isDebouncing,
  placeholder = 'Search PDF tools...',
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search PDF tools"
        className="w-full rounded-2xl border border-border-muted bg-surface-container-low/50 backdrop-blur-md px-5 py-4 pr-12 text-sm text-primary placeholder-on-surface-variant/50 focus:border-security-green focus:outline-none focus:ring-4 focus:ring-security-green/10 transition-all duration-300"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isDebouncing && (
          <svg
            className="animate-spin h-4 w-4 text-security-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        <svg
          className="h-5 w-5 text-on-surface-variant/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};
