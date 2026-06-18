import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { tools } from "@/config/constants";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchComponentProps {
  value?: string;
  onChange?: (val: string) => void;
  isDebouncing?: boolean;
  placeholder?: string;
}

export function SearchComponent({ value, onChange, isDebouncing = false, placeholder }: SearchComponentProps) {
  // If controlled props are provided, use them (for Home page integration)
  const isControlled = value !== undefined && onChange !== undefined;

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(isControlled ? value : query, 150);
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  if (isControlled) {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Search tools..."}
          className="w-full ps-11 pe-11 py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-sm"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute inset-y-0 end-0 pe-4 flex items-center"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
        {isDebouncing && (
          <div className="absolute inset-y-0 end-10 pe-4 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center rounded-lg border bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <Search className="mr-2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tools..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setIsOpen(false); }} aria-label="Clear search">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="font-medium">{tool.title}</span>
              <span className="ml-2 text-slate-500">{tool.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchComponent;
