import { useEffect, useState } from "react";
import axios from 'axios'

export default function useDetail(refesh) {
  const userId = JSON.parse(localStorage.getItem("user"))
    ? JSON.parse(localStorage.getItem("user")).user.id
    : null;
  const [details, setDetails] = useState([]);
  useEffect(() => {
    const get_appointment = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_GATEWAY_URL}?userId=${userId}`,
      )
      setDetails(res.data);
    };
    get_appointment();
  }, [userId, refesh]);
  return details;
}
