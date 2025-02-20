import React from "react";
import CardContainer from "../component/Card/Container";

const PaymentSuccess = () => {
  return (
    <CardContainer className={"h-full flex items-center justify-center"}>
      <div className="shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-4 rounded-lg w-[50%]">
        <img src="/cancel.png" className="h-[128px] w-fit mx-auto" alt="" />
        <p className="text-xl font-bold my-4">Payment cancel</p>
      </div>
    </CardContainer>
  );
};

export default PaymentSuccess;
