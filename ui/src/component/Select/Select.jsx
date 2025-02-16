import React from "react";
import { twMerge } from "tailwind-merge";
const Select = ({ children, value, onChange, className, name }) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={twMerge(
        "w-full rounded-md border-2 p-2 focus:outline-none",
        className
      )}
    >
      {children}
    </select>
  );
};

export default Select;
