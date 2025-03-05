import React, { useEffect, useState } from "react";
import MyCourseItem from "../component/MyCourse/MyCourseItem";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyCourse = () => {
  const [myCourses, setMyCourses] = useState([]);
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser)?.user?.userId : null;
  const navigate = useNavigate();
  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(
        `${
          process.env.REACT_APP_COURSE_SERVICE_URL ||
          "http://localhost:4000/course"
        }/enrolled/${userId}`
      );
      setMyCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchEnrolledCourses();
  }, [userId]);
  return (
    <div className="grid grid-cols-3 mt-4 items-center gap-4">
      {myCourses.length !== 0 ? (
        myCourses.map((course, index) => {
          return <MyCourseItem key={index} course={course} />;
        })
      ) : (
        <p className="text-xl font-bold">There are no courses</p>
      )}
    </div>
  );
};

export default MyCourse;
