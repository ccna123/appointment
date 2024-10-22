import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { Main } from "./pages/Main";
import { Detail } from "./pages/Detail";
import { Admin } from "./pages/Admin";
import React from "react";
import Signup from "./pages/Signup";
import Verification from "./pages/Verification";

function App() {
  return (
    <div className="App bg-gray-200 flex justify-center w-full min-h-screen">
      <BrowserRouter router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify/:email" element={<Verification />} />
          <Route path="/main" element={<Main />} />
          <Route path="/detail/:userId" element={<Detail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
