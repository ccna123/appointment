import React, { useState } from "react";
import { nav_items } from "../../data/item_list";
import Button from "../Button/Button";
import CardContainer from "../Card/Container";
import { useNavigate } from "react-router-dom";

const LayoutLeft = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user")) || {}; // Ensure it's an object
  const { user = {} } = userData; // Default to an empty object if user is missing

  const { userId = "", role: userRole = "", name = "" } = user;

  const handleClickItemMenu = (itemId) => {
    switch (itemId) {
      case 1:
        navigate("/");
        break;

      case 2:
        navigate("/payment");
        break;
      case 3:
        navigate("/mycourse");
        break;
      case 4:
        navigate("/");
        break;
      case 5:
        if (!userId) {
          navigate("/login");
        } else {
          localStorage.removeItem("user");
          navigate("/");
        }
        break;

      default:
        break;
    }
  };
  return (
    <CardContainer className={"h-full"}>
      <img src="/education.png" className="mx-auto mb-4" alt="" />
      {userId && <p className="text-xl font-bold">Welcome, {name}</p>}
      {nav_items.map((item, index) => (
        <div
          onClick={() => {
            handleClickItemMenu(item.id);
          }}
          key={index}
          className="mb-2 flex items-center text-xl text-gray-500 font-bold space-x-2 gap-4 p-4 cursor-pointer hover:text-blue-500 hover:font-bold hover:bg-blue-100 rounded-xl hover:duration-100"
        >
          <i className={item.icon}></i>
          <p>{userId && item.title === "Login" ? "Logout" : item.title}</p>
        </div>
      ))}
      <img src="/online-education.jpg" className="h-48 mx-auto" alt="" />
      <p className="text-xl font-bold">Build a better future</p>
      <Button
        className={
          "bg-blue-500 w-[50%] my-4 text-2xl rounded-2xl hover:bg-blue-700"
        }
      >
        Contact us
      </Button>
    </CardContainer>
  );
};

export default LayoutLeft;
