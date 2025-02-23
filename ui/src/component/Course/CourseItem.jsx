import React from "react";
import Button from "../Button/Button";
import CardContainer from "../Card/Container";
import { formatEnrolled } from "../../ultil/numberFormat";
import Spinner from "../Spinner";
const CourseItem = ({ course, onCheckOut, isLoading }) => {
  return (
    <CardContainer
      className={
        "w-full h-full flex items-center gap-4 cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      }
    >
      <div className="w-1/3 rounded-lg">
        <img
          src={course.image}
          className="object-contain rounded-lg w-full h-full"
          alt=""
        />
      </div>
      <div className="w-2/3">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-start">{course.title}</p>
          <p className="text-orange-500 text-xl font-bold">${course.price}</p>
        </div>
        <div className="mb-5 mt-2 text-start">
          <p className="text-gray-500">{course.title} for beginner</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center w-fit px-2 py-1 gap-2">
            <p className="bg-orange-500 rounded-lg w-fit p-2 text-white font-bold">
              {formatEnrolled(course.enrolled)}
            </p>
            <p className="font-bold">Enrolled</p>
          </div>
          <Button
            onClick={onCheckOut}
            className={
              "bg-blue-500 hover:bg-blue-700 hover:duration-100 cursor-pointer"
            }
          >
            {isLoading ? <Spinner /> : "Enroll now"}
          </Button>
        </div>
      </div>
    </CardContainer>
  );
};

export default CourseItem;
