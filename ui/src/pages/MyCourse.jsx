import React, { useEffect, useState } from "react";
import MyCourseItem from "../component/MyCourse/MyCourseItem";
import axios from "axios";

const MyCourse = () => {
  const [myCourses, setMyCourses] = useState([]);
  const { userId } = JSON.parse(localStorage.getItem("user")).user;
  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}course/enrolled?userId=${userId}`
      );
      setMyCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchEnrolledCourses();
  }, [userId]);
  return (
    <div className="grid grid-cols-3 mt-4 items-center gap-4">
      {myCourses.length !== 0 ? (
        myCourses.map((course) => {
          return <MyCourseItem course={course} />;
        })
      ) : (
        <p className="text-xl font-bold">There are no courses</p>
      )}
    </div>
  );
};

export default MyCourse;
