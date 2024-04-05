import React from "react";

const AppointmentContainer = ({ children }) => {
  return (
    <>
      <div className="grid grid-cols-12 items-center p-2 bg-white rounded-md my-4 lg:w-[60%] mx-auto font-bold text-xl">
        <p className="col-span-2">No.</p>
        <p className="col-span-4">Cus. Name</p>
        <p className="col-span-4">Content</p>
      </div>
      {children}
    </>
  );
};

export default AppointmentContainer;
