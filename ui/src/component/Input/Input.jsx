import React from "react";
import { twMerge } from "tailwind-merge";

const Input = React.forwardRef(
  ({ type, placeholder, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={twMerge(
          "border-2 rounded-md w-full p-2 outline-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);

export default Input;
