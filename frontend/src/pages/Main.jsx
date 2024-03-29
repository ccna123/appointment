import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { coaches, times } from "../data/data";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@apollo/client";
import { ADD_APPOINTMENT } from "../mutate/appointMutate";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import Select from "../component/Select/Select";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import TextArea from "../component/TextArea/TextArea";

export const Main = () => {
  const navigate = useNavigate();
  const [addAppointment] = useMutation(ADD_APPOINTMENT);
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
    id: userId,
    role: userRole,
    name: userName,
  } = JSON.parse(localStorage.getItem("user")).user;

  const handleMakeAppointment = async () => {
    if (!date || !selectedTime || !course || !location) {
      notify("Please fill all the fields", "warning");
      return;
    }
    await addAppointment({
      variables: {
        userId: userId,
        date: date,
        time: selectedTime,
        course: course,
        location: location,
        notes: note,
        coach: coaches[Math.floor(Math.random() * coaches.length)],
      },
    });
    notify("Make appointment successfully", "success");
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    navigate("/");
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
            {userName}
          </Link>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-sm p-1 border-none"
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
        rows="30"
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
