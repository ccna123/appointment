import React, { useEffect, useState } from "react";
import CardContainer from "../component/Card/Container";
import { social, footer } from "../data/item_list";
import Button from "../component/Button/Button";
import CourseItem from "../component/Course/CourseItem";
import FooterItem from "../component/Footer/FooterItem";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import notify from "../ultil/notify";
const Home = () => {
  const [selectedFooterItem, setSelectedFooterItem] = useState(0);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const { user = {} } = userData;

  const { userId = "", role: userRole = "", name = "" } = user;

  const handleEnroll = async (course) => {
    if (!userId) {
      navigate("/login");
      return;
    }
    const enroll = {
      courseId: course.courseId,
      userId: userId,
      paymentStatus: false,
    };
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}course/enroll`,
        {
          enroll,
        },
        { withCredentials: true }
      );
      res.status === 201 && notify("Enroll successfully", "success");
    } catch (error) {
      if (error.response.status === 409) {
        notify("You already enrolled this course", "error");
        return;
      }
      notify("Failed to enroll", "error");
      return;
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}course/get`
      );
      setCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      <CardContainer className={"flex justify-between gap-4 h-[400px]"}>
        <ToastContainer />
        <section className="w-[30%] text-start p-10">
          <div>
            <div>
              <p className="text-6xl font-bold">
                Expand <br /> your <br /> future
              </p>
            </div>
            <Button
              className={
                "bg-blue-500 rounded-xl w-fit hover:bg-blue-700 hover:duration-100 my-10"
              }
            >
              Follow us
            </Button>
            <div className="flex items-center justify-between w-fit gap-10">
              {social.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:underline hover:text-blue-600"
                >
                  <img
                    src={`${item.icon}`}
                    className="w-7 h-7"
                    alt=""
                    srcset=""
                  />
                  <p>{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>
          <img src="/decor1.png" alt="" />
        </section>
        <section className="w-[70%]">
          <img
            src="/banner.jpg"
            className="object-contain w-full h-full"
            alt=""
          />
        </section>
      </CardContainer>
      <p className="text-2xl font-bold w-fit mt-3 mb-5">Popular Courses</p>
      <div className="grid grid-cols-3 items-center gap-4 w-fit">
        {courses.length !== 0 ? (
          courses.map((item, index) => (
            <CourseItem
              key={index}
              course={item}
              onClick={() => handleEnroll(item)}
            />
          ))
        ) : (
          <p className="text-xl">There are no courses</p>
        )}
      </div>
      <div className="flex items-center gap-4 mt-8">
        {footer.map((item, index) => (
          <CardContainer
            key={index}
            className={
              "w-fit p-4 text-start cursor-pointer box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;"
            }
          >
            <FooterItem
              item={item}
              selectedFooterItem={selectedFooterItem}
              onClick={() => setSelectedFooterItem(item.id)}
            />
          </CardContainer>
        ))}
      </div>
    </div>
  );
};

export default Home;
