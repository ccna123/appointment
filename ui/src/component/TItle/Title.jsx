import React from "react";
import { twMerge } from "tailwind-merge";
const Title = ({ children, className }) => {
  return <p className={twMerge("text-lg font-bold", className)}>{children}</p>;
};

export default Title;
