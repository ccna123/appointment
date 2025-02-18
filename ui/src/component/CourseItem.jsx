import React from "react";
import CardContainer from "./Card/Container";
import Button from "./Button/Button";

const CourseItem = ({ course }) => {
  return (
    <CardContainer className={"w-full flex items-center gap-4"}>
      <div className="w-[35%] rounded-lg">
        <img src={course.image} className="object-contain rounded-lg" alt="" />
      </div>
      <div className="w-[65%]">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">{course.title}</p>
          <p className="text-orange-500 text-xl font-bold">${course.price}</p>
        </div>
        <div className="mb-5 mt-2 text-start">
          <p className="text-gray-500">{course.title} for beginner</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="border-2 gap-2 rounded-md border-gray-300 flex items-center w-fit px-2 py-1">
            <p className="bg-orange-500 rounded-lg w-fit p-2 text-white font-bold">
              123
            </p>
            <p>Enrolled</p>
          </div>
          <Button
            className={
              "bg-blue-500 hover:bg-blue-700 hover:duration-100 cursor-pointer w-fit"
            }
          >
            Enroll now
          </Button>
        </div>
      </div>
    </CardContainer>
  );
};

export default CourseItem;
