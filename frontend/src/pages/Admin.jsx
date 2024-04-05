import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import AppointmentItem from "../component/Appointment/AppointmentItem";
import AppontmentContainer from "../component/Appointment/AppontmentContainer";
import axios from "axios";
import Button from "../component/Button/Button";
import handleLogout from "../helper/Logout";

export const Admin = () => {
  const [data, setData] = useState([{}]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex justify-around items-center gap-3 mx-auto w-[40%]">
        <Title className={"my-3 uppercase"}>Appointment List</Title>
        <Button
          onClick={() => handleLogout(navigate)}
          className="bg-red-500 hover:bg-red-700 text-sm p-1 border-none w-[64px]"
        >
          Logout
        </Button>
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
