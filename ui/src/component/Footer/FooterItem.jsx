import React from "react";

const FooterItem = ({ selectedFooterItem, item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      <i
        className={`${item.icon} text-2xl ${
          selectedFooterItem == item.id && "text-blue-600"
        }`}
      ></i>
      <div
        className={`font-bold my-4 text-xl ${
          selectedFooterItem == item.id && "text-blue-600"
        }`}
      >
        {item.title}
      </div>
      <div>{item.description}</div>
    </div>
  );
};

export default FooterItem;
