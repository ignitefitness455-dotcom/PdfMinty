import React from "react";
import Search from "lucide-react/icons/search";
import X from "lucide-react/icons/x";
import Loader2 from "lucide-react/icons/loader-2";

interface SearchComponentProps {
  /** The current raw, un-debounced input text */
  value: string;
  /** Triggered instantly on keystroke to update parent state */
  onChange: (val: string) => void;
  /** True when a debounce timer is active; displays a subtle loading wheel */
  isDebouncing?: boolean;
  /** Customized field placeholder text */
  placeholder?: string;
  /** Base HTML identification string to bind inputs and labels correctly */
  id?: string;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  value,
  onChange,
  isDebouncing = false,
  placeholder = "Search resources...",
  id = "search-input-field",
}) => {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
      >
        Filter Available PDF Tools
      </label>
      <div className="relative">
        {/* Left Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
          <Search
            className="h-4 w-4 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
        </div>

        {/* Search Input */}
        <input
          type="search"
          name="search"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-describedby={isDebouncing ? `${id}-loading-desc` : undefined}
          className="block w-full pl-11 pr-11 py-3 text-sm font-semibold border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 dark:focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
        />

        {/* Right Loading wheel OR Clear button */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
          {isDebouncing && (
            <div className="flex items-center" id={`${id}-loading-desc`}>
              <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
              <span className="sr-only">Refreshing search results</span>
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default SearchComponent;
