import { useEffect, useState } from "react";

export default function useDetail(loading, error, data) {
  const userId = JSON.parse(localStorage.getItem("user"))
    ? JSON.parse(localStorage.getItem("user")).user.id
    : null;
  const [details, setDetails] = useState([]);
  useEffect(() => {
    const get_appointment = async () => {
      if (!loading && !error && data) {
        setDetails(data.appointments);
      }
    };
    get_appointment();
  }, [userId, data]);
  return details;
}
