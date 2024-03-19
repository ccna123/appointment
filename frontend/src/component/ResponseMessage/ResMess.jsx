import React from "react";

const ResMess = ({ mess, status }) => {
  return (
    <p
      className={`${
        status === 200 ? "text-green-500" : "text-red-500"
      } text-lg mt-4 font-bold`}
    >
      {mess}
    </p>
  );
};

export default ResMess;
