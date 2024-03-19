import React from "react";

const Select = ({ children, value, onChange, className, name }) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full rounded-md border-2 p-2 focus:outline-none ${className}`}
    >
      {children}
    </select>
  );
};

export default Select;
