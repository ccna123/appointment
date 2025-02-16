import React from "react";

const AppointmentContainer = ({ children }) => {
  return (
    <>
      <div className="my-4 lg:w-[70%] mx-auto">
        <section className="grid grid-cols-12 p-2 bg-white rounded-md font-bold text-xl">
          <p className="col-span-2">No.</p>
          <p className="col-span-4">Cus. Name</p>
          <p className="col-span-4">Content</p>
        </section>
        <section>{children}</section>
      </div>
    </>
  );
};

export default AppointmentContainer;
