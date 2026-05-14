



import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: brand visibility toggle
  const [showBrandName, setShowBrandName] = useState(true);

  /* -------- GET PROFILE -------- */
  const getProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/profile");
      setProfile(res.data.user);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------- UPDATE PROFILE -------- */
  const updateProfile = async (formData) => {
    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/update-profile",
        formData
      );

      if (res.data?.success === false) {
        toast.error(res.data.errors || "Update failed");
        return false;
      }

      toast.success("Profile updated successfully");
      await getProfile();
      return true;
    } catch (err) {
      toast.error(
        err.response?.data?.errors ||
          err.response?.data?.message ||
          "Something went wrong"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* -------- REMOVE AVATAR -------- */
  const removeAvatar = async () => {
    try {
      setLoading(true);

      const res = await api.delete(
        "/admin-dashboard/profile/avatar"
      );

      if (res.data?.success === false) {
        toast.error(res.data.errors || "Failed to remove avatar");
        return;
      }

      toast.success("Avatar removed");
      await getProfile();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove avatar"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        getProfile,
        updateProfile,
        removeAvatar,

        // ✅ expose toggle
        showBrandName,
        setShowBrandName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

