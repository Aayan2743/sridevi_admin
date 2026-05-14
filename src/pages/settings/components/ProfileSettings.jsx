import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import useDynamicTitle from "../../../hooks/useDynamicTitle";
import { useProfile } from "../../../context/ProfileContext";
import DefaultAvatar from "../../../assets/profile.jpg";
import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

const DEFAULT_AVATAR = DefaultAvatar;

export default function ProfileSettings() {
  useDynamicTitle("Profile Settings");

  const { can } = useAuth();

  const {
    profile,
    getProfile,
    updateProfile,
    removeAvatar,
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    getProfile();
  }, []);

  /* ---------------- MAP PROFILE → FORM ---------------- */
  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phone: String(profile.phone ?? ""),
      password: "",
    });

    setAvatar(profile?.avatar ?? DEFAULT_AVATAR);
  }, [profile]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);

    if (form.password.trim().length > 0) {
      formData.append("password", form.password);
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const success = await updateProfile(formData);

    if (success) {
      setEditMode(false);
      setAvatarFile(null);
      setForm((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatar();
    setAvatar(DEFAULT_AVATAR);
    setAvatarFile(null);
  };

  if (!can("settings.profile")) {
    return (
      <SettingsLayout>
        <>
          <AccessDenied />
        </>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <p className="mt-1 text-xs text-slate-500">
              Keep your account information updated for better account security and communication.
            </p>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* BRAND NAME TOGGLE */}
        {/* <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <p className="text-sm font-medium">Brand</p>
          </div>

          <button
            onClick={() => setShowBrandName((prev) => !prev)}
            className={`px-4 py-1.5 text-sm rounded-lg border transition ${
              showBrandName
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {showBrandName ? "ON" : "OFF"}
          </button>
        </div> */}

        <div className="border-t border-slate-200" />

        {/* PROFILE IMAGE */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white">
            <img
              src={avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {editMode && (
            <div className="flex gap-3">
              <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label>
              <button
                onClick={handleRemoveAvatar}
                className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          )}
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* PROFILE INFO */}
        <div className="grid gap-4 text-sm md:grid-cols-2">
          {["name", "email", "phone"].map((field) => (
            <div key={field} className="space-y-1 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field}</p>
              {editMode ? (
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              ) : (
                <p className="font-medium text-slate-700">{form[field] || "—"}</p>
              )}
            </div>
          ))}

          {/* PASSWORD */}
          <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</p>
            {editMode ? (
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="New password"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            ) : (
              <p className="font-medium text-slate-700">••••••••</p>
            )}
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
