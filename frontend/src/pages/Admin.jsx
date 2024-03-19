import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GET_APPOINTMENTS } from "../queries/appointQuery";
import { CONFIRM_APPOINTMENT } from "../mutate/appointMutate";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";
import AppointmentItem from "../component/Appointment/AppointmentItem";
import AppontmentContainer from "../component/Appointment/AppontmentContainer";

export const Admin = () => {
  const { loading, error, data } = useQuery(GET_APPOINTMENTS);
  const [confirmAppointment] = useMutation(CONFIRM_APPOINTMENT);

  const handleConfirm = async (itemId) => {
    await confirmAppointment({
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
        <Title className={"my-3 uppercase"}>Appointment List</Title>
      </div>
      <div className="grid grid-cols-12 items-center p-2 bg-white rounded-md my-4 lg:w-[50%] mx-auto font-bold text-xl">
        <p className="col-span-2">No.</p>
        <p className="col-span-4">Cus. Name</p>
        <p className="col-span-4">Content</p>
      </div>
      <AppontmentContainer>
        {!loading &&
          !error &&
          data &&
          data.appointments.map((appoint, index) => {
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
