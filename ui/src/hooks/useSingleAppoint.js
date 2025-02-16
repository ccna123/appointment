import { useEffect, useState } from "react";

export default function useSingleAppoint(loading, error, data) {
  const [singleAppoint, setSingleAppoint] = useState({});
  useEffect(() => {
    if (!loading && !error && data) {
      setSingleAppoint(data.appointment);
    }
  }, [data]);
  return [singleAppoint, setSingleAppoint];
}
