import Swal from "sweetalert2";

// ✅ Success Toast
export const showSuccessToast = (message = "Success") => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};

// ❌ Error Toast
export const showErrorToast = (message = "Something went wrong") => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 2000,
  });
};

// ⏳ Loader
export const showLoader = (message = "Please wait...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// ❎ Close Loader
export const closeLoader = () => {
  Swal.close();
};

// ⚠️ Confirm Dialog
export const confirmAction = async (
  message = "Are you sure?"
) => {
  const result = await Swal.fire({
    title: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
  });

  return result.isConfirmed;
};