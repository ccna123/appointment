import axios from "axios";
import React, { useEffect, useState } from "react";
import Spinner from "../component/Spinner";
import CardContainer from "../component/Card/Container";
import { useNavigate } from "react-router-dom";

const Playground = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [serviceList, setServiceList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRunningPods = async () => {
      try {
        const res = await axios.get(
          `${window.env.REACT_APP_PLAYGROUND_URL}/instance`
        );
        setServiceList(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching container URL:", error);
      }
    };
    fetchRunningPods();
  }, []);

  return (
    <div>
      <p className="text-2xl font-bold my-4">Playground</p>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <section className="flex items-center gap-4">
            {serviceList.map((service, index) => (
              <CardContainer
                key={index}
                className={
                  "flex items-center gap-4 text-xl cursor-pointer w-fit hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
                }
                onClick={() =>
                  // open new browser window with the service URL
                  window.open(service.serviceUrl, "_blank")
                }
              >
                <img src={"/container.png"} alt="" className="w-14 h-14" />
                <p>{service.name}</p>
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
              </CardContainer>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Playground;
