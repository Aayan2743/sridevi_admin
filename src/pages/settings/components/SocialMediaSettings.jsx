import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import {
  Linkedin,
  Dribbble,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Link as LinkIcon,
} from "lucide-react";

import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "dribbble", label: "facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "Twitter (X)", icon: Twitter },
];

export default function SocialMediaSettings() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);



  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [links, setLinks] = useState({
    linkedin: "",
    dribbble: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });

  /* ---------------- GET ---------------- */
  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/social-media-settings");

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to load social media");
        return;
      }

      if (res.data?.data) {
        setLinks({
          linkedin: res.data.data.linkedin || "",
          dribbble: res.data.data.dribbble || "",
          instagram: res.data.data.instagram || "",
          twitter: res.data.data.twitter || "",
          youtube: res.data.data.youtube || "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.errors || "Failed to load social media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  /* ---------------- CHANGE ---------------- */
  const handleChange = (e) => {
    setLinks({
      ...links,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      const params = new URLSearchParams();

      Object.entries(links).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const res = await api.post(
        `/admin-dashboard/social-media-settings?${params.toString()}`,
      );

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Update failed");
        return;
      }

      toast.success(res.data?.message || "Social media settings updated");

      setEditMode(false);
      fetchSocialLinks();
    } catch (err) {
      toast.error(err.response?.data?.errors || "Update failed");
    }
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="p-6 text-sm text-gray-500">Loading...</div>
      </SettingsLayout>
    );
  }


     if (!can("settings.socialmedia")) {
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
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Social media</h2>

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

        {/* CONTENT */}
        <div className="space-y-6">
          {SOCIALS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-start gap-4 pb-6 border-b last:border-b-0"
            >
              {/* ICON */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon size={20} className="text-gray-600" />
              </div>

              {/* FIELD */}
              <div className="flex-1">
                <p className="font-medium text-sm">{label}</p>

                {editMode ? (
                  <div className="relative mt-1">
                    <LinkIcon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name={key}
                      value={links[key]}
                      onChange={handleChange}
                      placeholder={`Enter ${label} URL`}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="mt-1">
                    {links[key] ? (
                      <a
                        href={
                          links[key].startsWith("http")
                            ? links[key]
                            : `https://${links[key]}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {links[key]}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">Not added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
