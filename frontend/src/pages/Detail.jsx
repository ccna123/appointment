import React from "react";
import { Link } from "react-router-dom";
import { DetailCard } from "../component/DetailCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DELETE_APPOINTMENT } from "../mutate/appointMutate";
import { useMutation, useQuery } from "@apollo/client";
import { GET_APPOINTMENTS } from "../queries/appointQuery";
import useDetail from "../hooks/useDetails";
import notify from "../ultil/notify";
import Title from "../component/TItle/Title";

export const Detail = () => {
  const { loading, error, data } = useQuery(GET_APPOINTMENTS);
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT);
  const details = useDetail(loading, error, data);

  const handleDeleteAppointment = async (id) => {
    const result = await deleteAppointment({
      variables: { id: id },
      update: (cache, { data }) => {
        const { appointments } = cache.readQuery({
          query: GET_APPOINTMENTS,
        });
        cache.writeQuery({
          query: GET_APPOINTMENTS,
          data: {
            appointments: appointments.filter(
              (appointment) => appointment.id !== id
            ),
          },
        });
      },
    });
    notify("Delete successfully", "error");
  };

  return (
    <div className="bg-white overflow-y-scroll rounded-md my-4 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] flex items-start flex-col p-4 w-full mx-2 md:mx-0 md:w-[30%]">
      <ToastContainer />
      <div className="flex items-center gap-2">
        <Link to="/main" className="fa-solid fa-arrow-left" />
        <Title className={"uppercase"}>Details</Title>
      </div>

      {details.length === 0 ? (
        <p className="mt-3 text-lg">There are no appointments</p>
      ) : (
        details.map((item, index) => {
          return (
            <DetailCard
              key={index}
              item={item}
              handleDeleteAppointment={handleDeleteAppointment}
            />
          );
        })
      )}
    </div>
  );
};
