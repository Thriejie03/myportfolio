import Swal from "sweetalert2";

const commonOptions = {
  background: "var(--card)",
  color: "var(--foreground)",
  confirmButtonColor: "#0ea5e9",
  customClass: {
    popup: "rounded-2xl border border-border",
    confirmButton: "rounded-xl px-5 py-3 font-semibold",
  },
};

export function showErrorAlert(title: string, text: string) {
  return Swal.fire({
    ...commonOptions,
    icon: "error",
    title,
    text,
    confirmButtonText: "Got it",
  });
}

export function showSuccessAlert(title: string, text: string) {
  return Swal.fire({
    ...commonOptions,
    icon: "success",
    title,
    text,
    confirmButtonText: "Done",
  });
}

export function showSuccessToast(title: string) {
  return Swal.fire({
    ...commonOptions,
    icon: "success",
    title,
    toast: true,
    position: "top-end",
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}
