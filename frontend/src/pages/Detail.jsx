import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DetailCard } from "../component/DetailCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import useDetail from "../hooks/useDetails";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";

export const Detail = () => {
  const { id: userId } = JSON.parse(localStorage.getItem("user")).user;
  const [refresh, setRefresh] = useState(false);
  const details = useDetail(refresh);

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_APPOINT_GATEWAY_URL}?id=${id}&userId=${userId}`
      );
      notify("Delete successfully", "error");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateAppointment = async (itemId, userId, singleAppoint) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_APPOINT_GATEWAY_URL}`,
        singleAppoint
      );
      setRefresh((prev) => !prev);
      notify("Edit successfully", "success");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white overflow-y-scroll rounded-md my-4 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] flex items-start flex-col p-4 w-full mx-2 md:mx-0 md:w-[50%]">
      <ToastContainer />
      <div className="flex items-center gap-2">
        <Link to="/main" className="fa-solid fa-arrow-left" />
        <Title className={"uppercase"}>Details</Title>
      </div>

      {details.length === 0 ? (
        <Title className={"mt-3 text-lg"}>There are no appointments</Title>
      ) : (
        details.map((item, index) => {
          return (
            <DetailCard
              key={index}
              item={item}
              handleDeleteAppointment={handleDeleteAppointment}
              handleUpdateAppointment={handleUpdateAppointment}
            />
          );
        })
      )}
    </div>
  );
};
