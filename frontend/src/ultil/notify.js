import { toast } from "react-toastify";

export default function notify(mess, type) {
  const toastStyle = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  switch (type) {
    case "success":
      return toast.success(mess, {
        toastStyle,
      });
    case "error":
      return toast.error(mess, {
        toastStyle,
      });
    case "warning":
      return toast.warning(mess, {
        toastStyle,
      });

    default:
      break;
  }
}
