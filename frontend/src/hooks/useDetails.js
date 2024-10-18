import { useEffect, useState } from "react";
import axios from 'axios'

export default function useDetail(refesh) {
  const { userId } = JSON.parse(localStorage.getItem("user"))
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const [details, setDetails] = useState([]);
  useEffect(() => {
    const get_appointment = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}appoint/getAllAppoint?userId=${userId}`,
        {
          withCredentials: true
        }
      )
      setDetails(res.data);
    };
    get_appointment();
  }, [userId, refesh]);
  return details;
}
