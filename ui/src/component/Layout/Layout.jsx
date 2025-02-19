import React from "react";
import { Outlet } from "react-router-dom";
import LayoutLeft from "./LayoutLeft";

const Layout = () => {
  return (
    <div className="flex justify-between w-full gap-4 pr-4">
      <section className="w-[20%]">
        <LayoutLeft />
      </section>
      <section className="w-[80%]">
        <Outlet />
      </section>
    </div>
  );
};

export default Layout;
