import React, { useEffect, useState } from "react";
import CardContainer from "../component/Card/Container";
import axios from "axios";
import Button from "../component/Button/Button";
import notify from "../ultil/notify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadStripe } from "@stripe/stripe-js";

const Payment = () => {
  const [myCourses, setMyCourses] = useState([]);
  const { userId, email, name } = JSON.parse(localStorage.getItem("user")).user;
  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}course/get/enrolled/${userId}`
      );
      setMyCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchEnrolledCourses();
  }, [userId]);

  const totalPrice = myCourses.reduce(
    (sum, course) => sum + course.course.price,
    0
  );

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
          products: myCourses,
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
      <ToastContainer />
      <div className="relative overflow-x-auto">
        <table className="w-full text-lg text-left">
          <thead className="uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">
                Course image
              </th>
              <th scope="col" className="px-6 py-3">
                Course name
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map((course) => (
              <tr className="border-b bg-gray-50">
                <th
                  scope="row"
                  className="px-6 py-2 font-medium whitespace-nowrap"
                >
                  <img
                    src={course.course.imageUrl}
                    className="w-[64px] h-[70px]"
                    alt=""
                  />
                </th>
                <td className="px-6 py-4">{course.course.title}</td>
                <td className="px-6 py-4 text-red-500 font-bold">
                  ${course.course.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href="#"
                    className="font-medium text-red-600 cursor-pointer"
                  >
                    <i
                      className="fa-solid fa-trash"
                      onClick={() =>
                        handleDeleteCourse(
                          course._id,
                          course.course.courseId,
                          course.userId
                        )
                      }
                    />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-3 w-full justify-end">
          <p className="text-end my-5 mr-4 text-2xl font-bold">
            Total:{" "}
            <span className="text-red-500">${totalPrice.toLocaleString()}</span>
          </p>
          <Button onClick={handleCheckOut} className={"bg-green-500 w-fit"}>
            Go to checkout
          </Button>
        </div>
      </div>
    </CardContainer>
  );
};

export default Payment;
