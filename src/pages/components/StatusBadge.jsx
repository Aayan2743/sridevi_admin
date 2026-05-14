export default function StatusBadge({ status }) {
  console.log("satys", status);
  const map = {
    Published: {
      text: "Published",
      className: "bg-green-100 text-green-700",
    },
    draft: {
      text: "Draft",
      className: "bg-yellow-100 text-yellow-700",
    },
    inactive: {
      text: "Inactive",
      className: "bg-gray-100 text-gray-600",
    },
  };

  const badge = map[status] || map.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
    >
      {badge.text}
    </span>
  );
}
