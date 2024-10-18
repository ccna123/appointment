import React from "react";

const AppointmentContainer = ({ children }) => {
  return (
    <>
      <div className="my-4 lg:w-[70%] mx-auto">
        <section>{children}</section>
      </div>
    </>
  );
};

export default AppointmentContainer;
