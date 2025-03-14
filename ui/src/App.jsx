import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import React, { createContext, useContext, useEffect, useState } from "react";
import Signup from "./pages/Signup";
import axios from "axios";
import Home from "./pages/Home";
import MyCourse from "./pages/MyCourse";
import Layout from "./component/Layout/Layout";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Playground from "./pages/Playground";

// Create a Context for config
const ConfigContext = createContext(null);
function App() {
  axios.defaults.withCredentials = true;

  const [config, setConfig] = useState(null);
  const isLocalEnv =
    process.env.ENV === "development" ||
    window.location.hostname === "localhost";

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("/config.json");
        setConfig(res.data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    if (!isLocalEnv) {
      fetchConfig();
    } else {
      // Set default local config
      setConfig({
        REACT_APP_COURSE_SERVICE_URL: process.env.REACT_APP_COURSE_SERVICE_URL,
        REACT_APP_PAYMENT_SERVICE_URL:
          process.env.REACT_APP_PAYMENT_SERVICE_URL,
        REACT_APP_AUTH_SERVICE_URL: process.env.REACT_APP_AUTH_SERVICE_URL,
        REACT_APP_STRIPE_PK: process.env.REACT_APP_STRIPE_PK,
        REACT_APP_PLAYGROUND_URL: process.env.REACT_APP_PLAYGROUND_URL,
      });
    }
  }, [isLocalEnv]);

  return (
    <ConfigContext.Provider value={config}>
      <div className="App bg-gray-200 flex justify-center w-full min-h-screen">
        <BrowserRouter router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/practice" element={<Playground />} />
              <Route path="/checkout/success" element={<PaymentSuccess />} />
              <Route path="/checkout/cancel" element={<PaymentCancel />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/mycourse" element={<MyCourse />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigContext.Provider>
  );
}
export const useConfig = () => useContext(ConfigContext);
export default App;
