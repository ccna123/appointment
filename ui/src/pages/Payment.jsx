import React, { useEffect, useState } from "react";
import CardContainer from "../component/Card/Container";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [myRecipt, setMyRecipt] = useState([]);
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser)?.user?.userId : null;
  const navigate = useNavigate();
  const getReceipt = async () => {
    try {
      const res = await axios.get(
        `${
          window.env.REACT_APP_PAYMENT_SERVICE_URL ||
          "http://localhost:4010/payment"
        }/receipt?userId=${userId}`
      );
      setMyRecipt(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    getReceipt();
  }, [userId]);

  return (
    <CardContainer className={""}>
      <div className="relative overflow-x-auto">
        {myRecipt.length === 0 ? (
          <p className="text-xl font-bold my-4 text-start">
            There are no receipt
          </p>
        ) : (
          <table className="w-full text-lg text-left">
            <thead className="uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">
                  No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Recipt
                </th>
              </tr>
            </thead>
            <tbody>
              {myRecipt.map((receipt, index) => (
                <tr key={index} className="border-b bg-gray-50">
                  <th
                    scope="row"
                    className="px-6 py-2 font-medium whitespace-nowrap"
                  >
                    {index + 1}
                  </th>
                  <th
                    scope="row"
                    className="px-6 py-2 font-medium whitespace-nowrap"
                  >
                    <a
                      href={receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Receipt
                    </a>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CardContainer>
  );
};

export default Payment;
