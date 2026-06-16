import React from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchComponentProps {
  value: string;
  onChange: (val: string) => void;
  isDebouncing?: boolean;
  placeholder?: string;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  value,
  onChange,
  isDebouncing,
  placeholder,
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search tools..."}
        className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-sm"
      />
      {isDebouncing && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
        </div>
      )}
    </div>
  );
};
