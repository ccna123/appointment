import React, { useState } from "react";
import { ModalEdit } from "./ModalEdit";
import Button from "../component/Button/Button";

export const DetailCard = ({
  item,
  toggleModal,
  selectedId,
  setToggleModal,
  setSelectedId,
  handleDeleteAppointment,
  handleUpdateAppointment,
}) => {
  const [showNote, setShowNote] = useState(false);

  const convertDate = (date) => {
    const inputDate = date; // Your input date in "yyyy-MM-dd" format

    // Parse the input date
    const parsedDate = new Date(inputDate);

    // Define the day names and months

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get the day, month, and year components
    const month = monthNames[parsedDate.getUTCMonth()];
    const year = parsedDate.getUTCFullYear();

    // Create the formatted date string
    const formattedDate = `${month} ${parsedDate.getUTCDate()}, ${year}`;
    return formattedDate;
  };

  return (
    <div className="bg-slate-100/30 mt-4 py-3 rounded-md flex flex-col w-full shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
      {["course", "coach", "location", "date", "time", "status"].map(
        (key, index) => (
          <div key={index} className="flex items-center justify-between mx-4">
            <p className="text-slate-500 text-sm uppercase">{key}</p>
            <p
              className={`${item[key] === "waiting"
                ? "text-blue-600 font-bold"
                : item[key] === "confirmed"
                  ? "text-green-600 font-bold"
                  : ""
                }`}
            >
              {key === "date" ? convertDate(item[key]) : item[key]}
            </p>
          </div>
        )
      )}
      <p
        onClick={() => setShowNote(!showNote)}
        className="cursor-pointer hover:underline my-3"
      >
        View Note
      </p>
      <p
        className={`${showNote ? "shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] block overflow-y-scroll break-words h-[128px] mx-2 mb-2 rounded-lg" : "hidden"
          } p-3`}
      >
        {item.note}
      </p>

      <div className="flex items-center justify-center mx-4 gap-3 mb-4">
        <Button
          onClick={() => {
            setToggleModal(!toggleModal)
            setSelectedId(item.appointId)
          }
          }
          className="bg-green-500 hover:bg-green-700"
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </Button>

        <Button
          className="bg-red-500 hover:bg-red-700"
          onClick={() => handleDeleteAppointment(item.appointId)}
        >
          <i className="fa-solid fa-trash"></i>
        </Button>
      </div>
      {toggleModal && (
        <ModalEdit
          handleUpdateAppointment={handleUpdateAppointment}
          toggleModal={toggleModal}
          setToggleModal={setToggleModal}
          itemId={selectedId}
        />
      )}
    </div>
  );
};
