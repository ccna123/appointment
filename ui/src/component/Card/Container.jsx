import React from "react";
import { twMerge } from "tailwind-merge";

const CardContainer = ({ children, className }) => {
  return (
    <div className={twMerge("border-2 rounded-xl bg-white p-2", className)}>
      {children}
    </div>
  );
};

export default CardContainer;
