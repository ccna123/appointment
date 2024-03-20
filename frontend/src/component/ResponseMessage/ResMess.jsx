import React from "react";
import { twMerge } from "tailwind-merge";

const ResMess = ({ mess, status }) => {
  return (
    <p
      className={twMerge(
        "text-lg mt-4 font-bold",
        `bg-${status === 200 ? "green" : "red"}-500`
      )}
    >
      {mess}
    </p>
  );
};

export default ResMess;
