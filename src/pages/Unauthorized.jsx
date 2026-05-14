export default function Unauthorized() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-10 text-center">
        
        <h1 className="text-3xl font-bold text-red-500">
          Access Denied 🚫
        </h1>

        <p className="text-gray-600 mt-3">
          You don't have permission to view this page
        </p>

        <p className="text-sm text-gray-400 mt-2">
          Contact admin if you think this is a mistake
        </p>

      </div>
    </div>
  );
}