import React from "react";
import Button from "../Button/Button";

const AppointmentItem = ({ appoint, index, handleConfirm }) => {
  return (
    <section>
      <div className="grid grid-cols-12 items-center p-2 bg-white rounded-tl-md rounded-bl-md mb-4">
        <p className="col-span-2">{index + 1}</p>
        <p className="col-span-4">{appoint.user?.name}</p>
        <div className=" col-span-6 md:col-span-4 gap-1">
          <div className="flex flex-col items-start gap-1">
            <p>Customer: {appoint.userName}</p>
            <p>Course: {appoint.course}</p>
            <p>Coach: {appoint.coach}</p>
            <p>Location: {appoint.location}</p>
            <p>
              Date: {appoint.date}, {appoint.time}
            </p>
          </div>
        </div>
        <div className="col-span-12 my-4 md:my-0 md:col-span-2">
          <Button
            disabled={appoint.status === "confirmed"}
            onClick={() => handleConfirm(appoint.id, appoint.userId)}
            className={`${
              appoint.status === "confirmed"
                ? "bg-slate-400 cursor-not-allowed "
                : "bg-green-400 text-white hover:bg-green-700"
            } `}
          >
            {appoint.status === "confirmed" ? "Confirmed" : "Confirm"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AppointmentItem;
