import React from "react";

const Input = ({
  children,
  value,
  type,
  className,
  placeholder,
  name,
  onChange,
}) => {
  return (
    <input
      name={name}
      value={value}
      type={type}
      placeholder={placeholder}
      className={`border-2 rounded-md w-full focus:outline-none ${className}`}
      onChange={onChange}
    >
      {children}
    </input>
  );
};

export default Input;
