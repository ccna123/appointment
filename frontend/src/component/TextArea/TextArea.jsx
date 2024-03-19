import React from "react";

const TextArea = ({ value, cols, rows, name, onChange }) => {
  return (
    <textarea
      onChange={onChange}
      value={value}
      className={
        "p-2 border-2 focus:outline-none resize-none w-full mt-4 rounded-md min-h-[100px]"
      }
      name={name}
      cols={cols}
      rows={rows}
    />
  );
};

export default TextArea;
