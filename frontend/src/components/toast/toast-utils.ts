import { getErrorMessage } from "@/lib/api/errors";
import { ToastApi } from "./toast-types";

export function toastApiError(
  toast: ToastApi,
  err: unknown,
  fallback = "Something went wrong"
) {
  toast.error(getErrorMessage(err) || fallback);
}
