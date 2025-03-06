import React from "react";
import { twMerge } from "tailwind-merge";

const CardContainer = ({ children, className, onClick = null }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge("border-2 rounded-xl bg-white p-2", className)}
    >
      {children}
    </div>
  );
};

export default CardContainer;
