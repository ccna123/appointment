import React, { useState } from "react";
import CardContainer from "../Card/Container";
import Button from "../Button/Button";
import { calculateProgress } from "../../ultil/calculateProgess";

const MyCourseItem = ({ course }) => {
  const [chapter, setChapter] = useState(1);
  return (
    <CardContainer
      className={
        "w-full h-full flex items-center gap-4 cursor-pointer hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      }
    >
      <div className="w-1/3 rounded-lg">
        <img
          src={course.course.imageUrl}
          className="object-contain rounded-lg w-full h-full"
          alt=""
        />
      </div>
      <div className="w-2/3">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-start">{course.course.title}</p>
        </div>
        <div className="mb-5 mt-2 text-start">
          <p className="text-gray-500">{course.course.title} for beginner</p>
        </div>
        {course.course.paymentStatus === "Unpaid" ? (
          <p className="text-xl text-red-500 font-bold text-start">
            Please finish payment
          </p>
        ) : (
          <>
            <div className="w-full">
              <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-1.5 leading-none rounded-full"
                  style={{
                    width:
                      calculateProgress(
                        chapter,
                        course.course.length
                      ).toString() + "%",
                  }}
                >
                  {" "}
                  {calculateProgress(chapter, course.course.length).toString() +
                    "%"}
                </div>
              </div>
              <p className="text-gray-500">{`${chapter} / ${course.course.length}`}</p>
            </div>
            {chapter === course.course.length ? (
              <Button
                onClick={() => setChapter(0)}
                className={
                  "bg-red-500 my-4 hover:bg-red-700 hover:duration-100 cursor-pointer w-fit"
                }
              >
                Play back
              </Button>
            ) : (
              <Button
                onClick={() => setChapter(chapter + 1)}
                className={
                  "bg-blue-500 my-4 hover:bg-blue-700 hover:duration-100 cursor-pointer w-fit"
                }
              >
                Learn
              </Button>
            )}
          </>
        )}
      </div>
    </CardContainer>
  );
};

export default MyCourseItem;
