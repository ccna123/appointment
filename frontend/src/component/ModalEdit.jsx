import React from "react";
import { coaches, times } from "../data/data";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_APPOINTMENT } from "../mutate/appointMutate";
import { GET_SINGLE_APPOINTMENTS } from "../queries/appointQuery";
import Button from "./Button/Button";
import Select from "./Select/Select";
import Input from "./Input/Input";
import useSingleAppoint from "../hooks/useSingleAppoint";
import notify from "../ultil/notify";
import Title from "./TItle/Title";
import TextArea from "./TextArea/TextArea";

export const ModalEdit = ({ setToggleModal, toggleModal, itemId }) => {
  const [editAppointment] = useMutation(EDIT_APPOINTMENT);
  const { loading, error, data } = useQuery(GET_SINGLE_APPOINTMENTS, {
    variables: { id: itemId },
  });
  const [singleAppoint, setSingleAppoint] = useSingleAppoint(
    loading,
    error,
    data
  );

  const handleUpdateAppointment = async () => {
    setToggleModal(false);
    notify("Edit successfully", "success");
  };

  return (
    <div className="w-full min-h-screen overflow-hidden absolute top-0 left-0 bg-gray-600/50">
      <ToastContainer />
      <section className="bg-white rounded-md lg:w-[50%] mx-auto mt-20 p-5">
        <div className="flex items-center justify-between">
          <Title>Edit</Title>
          <i
            onClick={() => setToggleModal(!toggleModal)}
            className="fa-solid fa-x cursor-pointer"
          ></i>
        </div>
        <hr className="mt-3" />

        <div className="md:grid md:grid-cols-12 mx-4 items-center ms-0 w-full gap-6 md:gap-4 my-3 ">
          <p className="text-lg font-bold md:col-span-2">Course</p>
          <Select
            value={singleAppoint.course}
            onChange={(e) =>
              setSingleAppoint({ ...singleAppoint, course: e.target.value })
            }
            className={"md:mx-0 md:col-span-10"}
          >
            <option value="Algorithm Basic">Algorithm Basic</option>
            <option value="Web Development">Web Development</option>
            <option value="Programming Advanced">Programming Advanced</option>
            <option value="Coding Challenge">Coding Challenge</option>
          </Select>
        </div>

        <div className="md:grid md:grid-cols-12 gap-4 items-center">
          <p className="text-lg font-bold md:col-span-2">Coach</p>

          <Select
            value={singleAppoint.coach}
            onChange={(e) =>
              setSingleAppoint({ ...singleAppoint, coach: e.target.value })
            }
            className={"md:mx-0 md:col-span-10"}
          >
            {coaches.map((coach, index) => (
              <option key={index} value={coach}>
                {coach}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:grid md:grid-cols-12 items-center w-full ms-0 gap-6 md:gap-4 mx-4 my-3">
          <p className="text-lg font-bold md:col-span-2 ms-0">Location</p>
          <Select
            value={singleAppoint.location}
            onChange={(e) =>
              setSingleAppoint({ ...singleAppoint, location: e.target.value })
            }
            className={"md:mx-0 md:col-span-10"}
          >
            <option value="">Select location</option>
            <option value="A University Campus">A University Campus</option>
            <option value="City Library">City Library</option>
            <option value="ABC Hotel">ABC Hotel</option>
          </Select>
        </div>

        <div className="md:grid md:grid-cols-12 items-center gap-4">
          <p className="text-lg font-bold md:col-span-2">Date</p>
          <Input
            onChange={(e) =>
              setSingleAppoint({
                ...singleAppoint,
                date: e.target.value,
              })
            }
            className={"md:mx-0 md:col-span-10 p-2"}
            value={singleAppoint.date}
            type="date"
            placeholder="Choose date"
          />
        </div>

        <div className="md:grid md:grid-cols-12 gap-4 my-3 items-center">
          <p className="text-lg font-bold md:col-span-2">Time</p>

          <Select
            value={singleAppoint.time}
            onChange={(e) =>
              setSingleAppoint({ ...singleAppoint, time: e.target.value })
            }
            className={"md:mx-0 md:col-span-10"}
          >
            {times.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </Select>
        </div>
        <TextArea
          onChange={(e) =>
            setSingleAppoint({ ...singleAppoint, note: e.target.value })
          }
          value={singleAppoint.notes}
          className="p-2 border-2 focus:outline-none resize-none w-full mt-4 rounded-md min-h-[100px]"
          cols="30"
          rows="5"
        />

        <Button
          onClick={handleUpdateAppointment}
          className="mt-2 bg-green-500  hover:bg-green-700"
        >
          Save
        </Button>
      </section>
    </div>
  );
};
