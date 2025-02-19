import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import React from "react";
import Signup from "./pages/Signup";
import axios from "axios";
import Home from "./pages/Home";
import MyCourse from "./pages/MyCourse";
import Layout from "./component/Layout/Layout";

function App() {
  axios.defaults.withCredentials = true;
  return (
    <div className="App bg-gray-200 flex justify-center w-full min-h-screen">
      <BrowserRouter router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/mycourse/:userId" element={<MyCourse />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
