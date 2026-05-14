export default function SettingRow({ title, value }) {
  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-gray-500">{value}</p>
        </div>
        <button className="text-blue-600 text-sm hover:underline">
          Edit
        </button>
      </div>
      <hr />
    </>
  );
}
