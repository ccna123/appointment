import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import AppointmentItem from "../component/Appointment/AppointmentItem";
import AppontmentContainer from "../component/Appointment/AppontmentContainer";
import axios from "axios";

export const Admin = () => {
  const [data, setData] = useState([{}]);
  const [refresh, setRefresh] = useState(false);

  const handleConfirm = async (appointId, userId) => {
    await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}admin/updateAppointStatus`,
      {
        appointId,
        userId,
      }
    );
    notify("Confirm successfully", "success");
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchAllAppoint = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}admin/getAllUserAppoint`
        );
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAppoint();
  }, [refresh]);

  return (
    <div className="my-10 w-full p-4">
      <ToastContainer />
      <div className="flex items-center gap-3 w-fit mx-auto">
        <Link to="/main" className="fa-solid fa-arrow-left" />
        <Title className={"my-3 uppercase"}>Appointment List</Title>
      </div>
      <div className="grid grid-cols-12 items-center p-2 bg-white rounded-md my-4 lg:w-[50%] mx-auto font-bold text-xl">
        <p className="col-span-2">No.</p>
        <p className="col-span-4">Cus. Name</p>
        <p className="col-span-4">Content</p>
      </div>
      <AppontmentContainer>
        {data.map((appoint, index) => {
          return (
            <AppointmentItem
              key={appoint.id}
              appoint={appoint}
              index={index}
              handleConfirm={handleConfirm}
            />
          );
        })}
      </AppontmentContainer>
    </div>
  );
};
