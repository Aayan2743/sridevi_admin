export default function AccessDenied() {
  return (
    <div className="p-6">
      <div className="bg-white p-10 rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Access Denied 🚫
        </h2>
        <p className="text-gray-500 mt-2">
          You don’t have permission to view this page
        </p>
      </div>
    </div>
  );
}