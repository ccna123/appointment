import React, { useEffect } from "react";
import CardContainer from "../component/Card/Container";
import axios from "axios";

const PaymentCancel = () => {
  const { userId } = JSON.parse(localStorage.getItem("user")).user || "";
  useEffect(() => {
    console.log(`use effect call: ${userId}`);

    async function handlePayCancel() {
      try {
        const res = await axios.get(
          `${
            process.env.REACT_APP_PAYMENT_SERVICE_URL ||
            "http://localhost:4010/payment"
          }/cancel?userId=${userId}`
        );
      } catch (error) {
        console.error(error);
      }
    }
    handlePayCancel();
  }, [userId]);
  return (
    <CardContainer className={"h-full flex items-center justify-center"}>
      <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-4 rounded-lg w-[50%]">
        <img src="/cancel.png" className="h-[128px] w-fit mx-auto" alt="" />
        <p className="text-xl font-bold my-4">Payment cancel</p>
      </div>
    </CardContainer>
  );
};

export default PaymentCancel;
