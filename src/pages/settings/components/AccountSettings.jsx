import { useState } from "react";
import SettingsLayout from "../SettingsLayout";

export default function AccountSettings() {
  const [editMode, setEditMode] = useState(false);

  const [gst, setGst] = useState({
    name: "GST18",
    percentage: 18,
  });

  const handleChange = (field, value) => {
    setGst({
      ...gst,
      [field]: value,
    });
  };

  const handleSave = () => {
    console.log("GST Settings:", gst);
    setEditMode(false);
  };

  return (
    <SettingsLayout>
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Account Settings</h2>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* GST SETTINGS */}
        <div className="grid grid-cols-12 gap-6">
          {/* GST NAME */}
          <div className="col-span-12 md:col-span-6 space-y-2">
            <p className="text-sm font-medium">GST Name</p>

            {editMode ? (
              <input
                value={gst.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                placeholder="GST Name (e.g. GST18)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {gst.name || "Not added"}
              </p>
            )}
          </div>

          {/* GST PERCENTAGE */}
          <div className="col-span-12 md:col-span-6 space-y-2">
            <p className="text-sm font-medium">GST Percentage</p>

            {editMode ? (
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gst.percentage}
                  onChange={(e) =>
                    handleChange(
                      "percentage",
                      Number(e.target.value)
                    )
                  }
                  placeholder="GST %"
                  className="w-full border rounded-lg px-3 py-2 pr-8 text-sm"
                />
                <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                  %
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {gst.percentage}%
              </p>
            )}
          </div>
        </div>

        {/* INFO */}
        <p className="text-xs text-gray-500">
          This GST will be applied automatically to orders and
          invoices.
        </p>
      </div>
    </SettingsLayout>
  );
}
