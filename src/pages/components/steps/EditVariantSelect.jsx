import { useEffect, useMemo, useRef, useState } from "react";

export default function EditVariantSelect({
  label,
  options = [],
  selected = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isSelected = (opt) => selected.some((s) => s.id === opt.id);

  const filteredOptions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return options;

    return options.filter((opt) =>
      String(opt.value || "").toLowerCase().includes(trimmedQuery),
    );
  }, [options, query]);

  const toggle = (opt) => {
    onChange(
      isSelected(opt)
        ? selected.filter((s) => s.id !== opt.id)
        : [...selected, opt],
    );
  };

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4" ref={wrapperRef}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <p className="mt-1 text-xs text-slate-400">
        Search and select one or more values.
      </p>

      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (open) setQuery("");
        }}
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-white"
      >
        <span className={selected.length ? "text-slate-700" : "text-slate-400"}>
          {selected.length ? `${selected.length} selected` : `Select ${label}`}
        </span>
        <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                    isSelected(opt)
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected(opt)}
                    onChange={() => toggle(opt)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{opt.value}</span>
                </label>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                No matching values found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
