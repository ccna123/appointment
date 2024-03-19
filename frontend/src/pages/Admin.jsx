import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GET_APPOINTMENTS } from "../queries/appointQuery";
import { CONFIRM_APPOINTMENT } from "../mutate/appointMutate";
import Button from "../component/Button/Button";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";

export const Admin = () => {
  const { loading, error, data } = useQuery(GET_APPOINTMENTS);
  const [confirmAppointment] = useMutation(CONFIRM_APPOINTMENT);

  const handleConfirm = async (itemId) => {
    const result = await confirmAppointment({
      variables: { id: itemId },
      refetchQueries: [{ query: GET_APPOINTMENTS }],
    });
    notify("Confirm successfully", "success");
  };

  return (
    <div className="my-10 w-full p-4">
      <ToastContainer />
      <div className="flex items-center gap-3 w-fit mx-auto">
        <Link to="/main" className="fa-solid fa-arrow-left" />
        <Title className={"my-3 text-slate-400 uppercase"}>
          Appointment List
        </Title>
      </div>
      <div className="grid grid-cols-12 items-center p-2 bg-white rounded-md my-4 md:w-[50%] mx-auto font-bold text-xl">
        <p className="col-span-2">No.</p>
        <p className="col-span-4">Cus. Name</p>
        <p className="col-span-4">Content</p>
      </div>
      <div className="my-4 h-[512px] overflow-y-auto">
        {!loading &&
          !error &&
          data &&
          data.appointments.map((appoint, index) => {
            return (
              <section key={index}>
                <div className="grid grid-cols-12 items-center p-2 bg-white rounded-md my-4 md:w-[50%] mx-auto ">
                  <p className="col-span-2">{index + 1}</p>
                  <p className="col-span-4">{appoint.user.name}</p>
                  <div className=" col-span-6 md:col-span-4 gap-1">
                    <div className="flex flex-col items-start gap-1">
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
                      disabled={appoint.status === "Confirmed"}
                      onClick={() => handleConfirm(appoint.id)}
                      className={`${
                        appoint.status === "Confirmed"
                          ? "bg-slate-400 cursor-not-allowed "
                          : "bg-green-400 text-white hover:bg-green-700"
                      } `}
                    >
                      {appoint.status === "Confirmed" ? "Confirmed" : "Confirm"}
                    </Button>
                  </div>
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
};
