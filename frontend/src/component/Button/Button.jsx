import React from "react";

const Button = ({ children, onClick, className, disabled = false }) => {
  return (
    <button
      className={`text-white rounded-md p-2 w-full border-2 duration-100 font-bold ${className}`}
      onClick={onClick}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
