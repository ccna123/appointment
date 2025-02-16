import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import AppointmentItem from "../component/Appointment/AppointmentItem";
import AppontmentDetailContainer from "../component/Appointment/AppontmentDetailContainer";
import axios from "axios";
import Button from "../component/Button/Button";
import handleLogout from "../helper/Logout";
import AppointmentContainer from "../component/Appointment/AppointmentContainer";
import AppointmentSearch from "../component/Appointment/AppointmentSearch";

export const Admin = () => {
  const [data, setData] = useState([{}]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [isSearchInvalid, setIsSearchInvalid] = useState(false);

  const handleConfirm = async (appointId, userId) => {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}admin/update/status`, {
      appointId,
      userId,
    });
    notify("Confirm successfully", "success");
    setRefresh((prev) => !prev);
  };

  const handleSearchInputChange = (value) => {
    setKeyword(value);
  };

  const handleClear = () => {
    setKeyword("");
    setRefresh((prev) => !prev);
    setIsSearchInvalid(false);
  };

  const handleSearch = async () => {
    try {
      if (keyword === "") {
        setIsSearchInvalid(true);
        return null;
      }
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}admin/search`,
        { keyword }
      );
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchAllAppoint = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}admin/get`
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
          className="bg-red-500 hover:bg-red-700 text-sm p-1 w-[64px]"
        >
          Logout
        </Button>
      </div>
      <AppointmentContainer>
        <AppointmentSearch
          isSearchInvalid={isSearchInvalid}
          keyword={keyword}
          handleSearchInputChange={handleSearchInputChange}
          handleSearch={handleSearch}
          handleClear={handleClear}
        />
        <AppontmentDetailContainer>
          {data.map((appoint, index) => {
            return (
              <AppointmentItem
                key={index}
                appoint={appoint}
                index={index}
                handleConfirm={handleConfirm}
              />
            );
          })}
        </AppontmentDetailContainer>
      </AppointmentContainer>
    </div>
  );
};
