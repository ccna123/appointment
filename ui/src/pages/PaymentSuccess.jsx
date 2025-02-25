import React, { useEffect } from "react";
import CardContainer from "../component/Card/Container";
import axios from "axios";

const PaymentSuccess = () => {
  const { userId } = JSON.parse(localStorage.getItem("user")).user || "";
  useEffect(() => {
    async function handlePaySuccess() {
      try {
        await axios.get(
          `${
            process.env.REACT_APP_PAYMENT_SERVICE_URL ||
            "http://localhost:4010/checkout"
          }/success?userId=${userId}`,
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
    handlePaySuccess();
  }, []);

  return (
    <CardContainer className={"h-full flex items-center justify-center"}>
      <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-4 rounded-lg">
        <img src="/checked.png" className="h-[128px] w-fit mx-auto" alt="" />
        <p className="text-xl font-bold my-4">Payment success</p>
      </div>
    </CardContainer>
  );
};

export default PaymentSuccess;
