import React from "react";
import { twMerge } from "tailwind-merge";

const ResMess = ({ mess, status }) => {
  const bgColor =
    status === 200 || status === 201 ? "bg-green-400" : "bg-red-400";
  const textColor =
    status === 200 || status === 201 ? "text-green-700" : "text-red-700";
  return (
    <p className={twMerge("text-lg mt-4 font-bold rounded-lg", bgColor)}>
      <span className={textColor}>{mess}</span>
    </p>
  );
};

export default ResMess;
