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
  const isLocalEnv = process.env.ENV === "prod";

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Check if config was injected at runtime
        if (window.APP_CONFIG) {
          setConfig(window.APP_CONFIG);
          return;
        }

        // Fallback to fetching config file
        const res = await axios.get("/config.json");
        setConfig(res.data);
      } catch (error) {
        console.error("Error fetching config:", error);
        // Optional: Set default config in case of failure
        setConfig({
          REACT_APP_COURSE_SERVICE_URL: "http://localhost:4000/course",
          REACT_APP_PAYMENT_SERVICE_URL: "http://localhost:4010/payment",
          REACT_APP_AUTH_SERVICE_URL: "http://localhost:4020/auth",
          REACT_APP_STRIPE_PK:
            "pk_test_51OazL7D3eD5YrsaQKPJqS7kHJJSrLpPMbh2sZmSrS9WI48NSYnr5dxPry4Me2G1Bp54Ads6KvX2XrohZvlXQP6d600WQy85XCz",
          REACT_APP_PLAYGROUND_URL: "http://localhost:4030/playground",
        });
      }
    };

    fetchConfig();
  }, []);

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
