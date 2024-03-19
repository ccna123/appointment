import React from "react";

const Title = ({ children, className }) => {
  return <p className={`text-lg font-bold ${className}`}>{children}</p>;
};

export default Title;
