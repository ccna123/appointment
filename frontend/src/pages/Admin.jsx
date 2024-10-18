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
import AppointmentContainer from "../component/Appointment/AppointmentContainer";
import AppointmentSearch from "../component/Appointment/AppointmentSearch";

export const Admin = () => {
  const [data, setData] = useState([{}]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [isSearchInvalid, setIsSearchInvalid] = useState(false);

  const handleConfirm = async (appointId, userId) => {
    await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}admin/updateAppointStatus`,
      {
        appointId,
        userId,
      },
      { withCredentials: true }
    );
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
      if (keyword == "") {
        setIsSearchInvalid(true);
        return null;
      }
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}admin/searchAppoint`,
        { keyword }, { withCredentials: true }
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
          `${process.env.REACT_APP_BACKEND_URL}admin/getAllUserAppoint`, { withCredentials: true }
        );
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAppoint();
  }, [refresh]);

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/");
  };

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
        <div className="my-4 mx-auto">
          <section className="grid grid-cols-12 p-2 bg-white rounded-md font-bold text-xl">
            <p className="col-span-2">No.</p>
            <p className="col-span-4">Cus. Name</p>
            <p className="col-span-4">Content</p>
          </section>
        </div>
        <AppontmentDetailContainer>
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
        </AppontmentDetailContainer>
      </AppointmentContainer>
    </div>
  );
};
