import React from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  onClick,
  className,
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      className={twMerge(
        "text-white rounded-md p-2 w-full border-none duration-100 font-bold",
        className
      )}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
