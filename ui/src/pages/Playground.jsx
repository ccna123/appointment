import axios from "axios";
import React, { useEffect, useState } from "react";
import Spinner from "../component/Spinner";

const Playground = () => {
  const [containerInfo, setContainerInfo] = useState({
    containerUrl: "",
    containerName: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContainerUrl = async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_PLAYROUND_URL}/container/spawn`
        );
        setContainerInfo({
          containerUrl: res.data.url,
          containerName: res.data.containerName,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching container URL:", error);
      }
    };

    fetchContainerUrl();
    return () => {
      axios
        .delete(`${process.env.REACT_APP_PLAYROUND_URL}/container/delete`, {
          data: { containerName: containerInfo.containerName },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.error("Error deleting container:", error);
        });
    };
  }, []);

  return (
    <div>
      <p className="text-2xl font-bold my-4">Playground</p>
      {isLoading ? (
        <Spinner />
      ) : (
        <iframe
          src={containerInfo.containerUrl}
          frameBorder="0"
          width={"100%"}
          height={"750px"}
        ></iframe>
      )}
    </div>
  );
};

export default Playground;
