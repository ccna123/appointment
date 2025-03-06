import { useEffect, useState } from "react";
import axios from "axios";

export default function useDetail(refesh) {
  const userId = JSON.parse(localStorage.getItem("user"))
    ? JSON.parse(localStorage.getItem("user")).user.userId
    : null;
  const [details, setDetails] = useState([]);
  useEffect(() => {
    const get_appointment = async () => {
      const res = await axios.get(
        `${window.env.REACT_APP_COURSE_SERVICE_URL}/appoint/appointments?userId=${userId}`
      );
      setDetails(res.data);
    };
    get_appointment();
  }, [userId, refesh]);
  return details;
}
