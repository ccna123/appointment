import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { coaches, times } from "../data/data";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import Select from "../component/Select/Select";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import TextArea from "../component/TextArea/TextArea";
import axios from "axios";
import handleLogout from "../helper/Logout";

export const Main = () => {
  const navigate = useNavigate();
  const [formData, setformData] = useState({
    date: "",
    selectedTime: "",
    course: "",
    location: "",
    note: "",
  });
  const { date, selectedTime, course, location, note } = formData;

  const handleInputChange = (name, value) => {
    setformData({
      ...formData,
      [name]: value,
    });
  };

  const {
    userId: userId,
    role: userRole,
    name: name,
  } = JSON.parse(localStorage.getItem("user")).user;

  const handleMakeAppointment = async () => {
    if (!date || !selectedTime || !course || !location) {
      notify("Please fill all the fields", "warning");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}appoint/create`,
        {
          userId: userId,
          date: date,
          selectedTime: selectedTime,
          course: course,
          location: location,
          note: note,
          coach: coaches[Math.floor(Math.random() * coaches.length)],
        },
        { withCredentials: true }
      );
      notify("Make appointment successfully", "success");
      setformData({
        date: "",
        selectedTime: "",
        course: "",
        location: "",
        note: "",
      });
    } catch (error) {
      console.error(error);
      notify("Failed to create appointment", "error");
    }
  };

  return (
    <div className="bg-white overflow-y-scroll rounded-md my-4 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] flex items-start flex-col p-4 w-full mx-2 lg:mx-0 lg:w-[50%]">
      <ToastContainer />
      <div className="flex items-center justify-between w-full ">
        <Title className={"uppercase"}>Book an appointment</Title>
        <div className="flex items-center gap-3">
          <i className="fa-regular fa-user"></i>
          <Link
            to={userRole === "admin" ? "/admin" : `/detail/${userId}`}
            className="font-bold hover:underline"
          >
            {name}
          </Link>

          <Button
            onClick={() => handleLogout(navigate)}
            className="bg-red-500 hover:bg-red-700 text-sm p-1"
          >
            Logout
          </Button>
        </div>
      </div>
      <Title className={"my-3 text-slate-400 uppercase"}>pick a date</Title>
      <Input
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        value={formData.date}
        type="date"
        placeholder="Choose date"
        className="p-4"
        name={"date"}
      />
      <Title className={"my-3 text-slate-400 uppercase"}>
        pick an available time
      </Title>
      <div className="grid grid-cols-3 w-full gap-3 cursor-pointer">
        {times.map((time, index) => (
          <p
            key={index}
            onClick={(e) =>
              handleInputChange("selectedTime", e.target.textContent)
            }
            className={`${
              time === selectedTime ? "bg-black text-white" : "text-black"
            } border-2 py-2 rounded-md hover:bg-black hover:text-white`}
          >
            {time}
          </p>
        ))}
      </div>
      <Title className={"my-3 text-slate-400 uppercase"}>programme</Title>
      <Select
        name={"course"}
        value={formData.course}
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
      >
        <option value="">Select traing course</option>
        <option value="Algorithm Basic">Algorithm Basic</option>
        <option value="Web Development">Web Development</option>
        <option value="Programming Advanced">Programming Advanced</option>
        <option value="Coding Challenge">Coding Challenge</option>
      </Select>
      <Title className={"my-3 text-slate-400 uppercase"}>location</Title>
      <Select
        name={"location"}
        value={formData.location}
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
      >
        <option value="">Select location</option>
        <option value="A University Campus">A University Campus</option>
        <option value="City Library">City Library</option>
        <option value="ABC Hotel">ABC Hotel</option>
      </Select>
      <TextArea
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        value={formData.note}
        className="border-2 focus:outline-none resize-none w-full mt-4 rounded-md min-h-[100px] p-2"
        cols="30"
        rows="5"
        name="note"
      />
      <Button
        onClick={handleMakeAppointment}
        className={"bg-green-500 my-4 hover:bg-green-700"}
      >
        Pick appointment
      </Button>
    </div>
  );
};
