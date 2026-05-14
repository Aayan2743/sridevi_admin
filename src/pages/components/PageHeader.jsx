export default function PageHeader({
  title,
  total,
  search,
  onSearch,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">
          {title}
        </h1>
        {total !== undefined && (
          <p className="text-sm text-gray-500">
            Total {total}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <input
          placeholder={search}
          onChange={(e) => onSearch(e.target.value)}
          className="h-10 px-4 border rounded-lg text-sm w-64"
        />

        <button
          onClick={onAction}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
