import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { Main } from "./pages/Main";
import { Detail } from "./pages/Detail";
import { Admin } from "./pages/Admin";
import React from "react";
import Signup from "./pages/Signup";
import axios from "axios";
import Home from "./pages/Home";

function App() {
  axios.defaults.withCredentials = true;
  return (
    <div className="App bg-gray-200 flex justify-center w-full min-h-screen">
      <BrowserRouter router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<Main />} />
          <Route path="/detail/:userId" element={<Detail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
