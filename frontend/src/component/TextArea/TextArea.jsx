import React from "react";
import { twMerge } from "tailwind-merge";

const TextArea = ({ value, cols, rows, name, onChange }) => {
  return (
    <textarea
      onChange={onChange}
      value={value}
      className={twMerge(
        "p-2 border-2 focus:outline-none resize-none w-full mt-4 rounded-md min-h-[100px]"
      )}
      name={name}
      cols={cols}
      rows={rows}
    />
  );
};

export default TextArea;
