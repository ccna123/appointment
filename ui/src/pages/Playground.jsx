import axios from "axios";
import React, { useEffect, useState } from "react";
import Spinner from "../component/Spinner";
import CardContainer from "../component/Card/Container";
import { useConfig } from "../App";
import Button from "../component/Button/Button";

const Playground = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceList, setServiceList] = useState([]);
  const config = useConfig();
  const labs = [
    {
      id: 1,
      name: "Pod issue 1",
      description: "Pod is not running. Fix it.",
    },
    // {
    //   id: 2,
    //   name: "Pod issue 2",
    //   description: "Pod is not running. Fix it.",
    // },
  ];

  const handleStart = async (labId) => {
    try {
      const res = await axios.post(
        `${
          config.REACT_APP_PLAYGROUND_URL ||
          process.env.REACT_APP_PLAYGROUND_URL
        }/start`,
        {
          labId,
        }
      );
      console.log(res.data);
    } catch (error) {
      console.error("Error starting lab:", error);
    }
  };

  return (
    <div>
      <p className="text-2xl font-bold my-4">Playground</p>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <section className="flex items-center gap-4">
            {labs.map((lab, index) => (
              <CardContainer
                key={index}
                className={
                  "flex items-center justify-between gap-4 text-xl cursor-pointer w-[25%] hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
                }
                // onClick={() =>
                //   // open new browser window with the service URL
                //   window.open(service.serviceUrl, "_blank")
                // }
              >
                <img src={"/container.png"} alt="" className="w-24 h-24" />
                <div className="flex flex-col gap-1 items-start">
                  <p className="text-xl font-bold">{lab.name}</p>
                  <p className="text-sm text-gray-400">{lab.description}</p>
                  <Button
                    onClick={() => handleStart(lab.id)}
                    className={"bg-green-600"}
                  >
                    Start
                  </Button>
                </div>
              </CardContainer>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Playground;
