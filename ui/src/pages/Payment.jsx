import React, { useEffect, useState } from "react";
import CardContainer from "../component/Card/Container";
import axios from "axios";
import notify from "../ultil/notify";
import "react-toastify/dist/ReactToastify.css";
import { loadStripe } from "@stripe/stripe-js";

const Payment = () => {
  const [myRecipt, setMyRecipt] = useState([]);
  const { userId, email, name } = JSON.parse(localStorage.getItem("user")).user;
  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_PAYMENT_SERVICE_URL}/receipt?userId=${userId}`
      );
      setMyRecipt(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchEnrolledCourses();
  }, [userId]);

  const handleDeleteCourse = async (id, courseId, userId) => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}course/delete`,
        {
          data: {
            id,
            courseId,
            userId,
          },
        }
      );
      notify("Delete successfully", "success");
      fetchEnrolledCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const stripePromise = await loadStripe(process.env.REACT_APP_STRIPE_PK);
      const headers = { "Content-Type": "application/json" };

      const res = await axios.post(
        `${process.env.REACT_APP_PAYMENT_SERVICE_URL}/checkout`,
        {
          products: myRecipt,
          name,
          email,
          userId,
        },
        { headers }
      );

      const session = await res.data;
      const result = stripePromise.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      notify("Error", "error");
      console.error(error);
    }
  };

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
