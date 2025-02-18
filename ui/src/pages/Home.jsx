import React from "react";
import CardContainer from "../component/Card/Container";
import { items, social, courses, footer } from "../data/item_list";
import Button from "../component/Button/Button";
import CourseItem from "../component/CourseItem";

const Home = () => {
  return (
    <div className="flex justify-between border-2 border-blue-500 w-full gap-4">
      <section className="w-[20%]">
        <CardContainer className={"h-full"}>
          <img src="/education.png" className="mx-auto" alt="" />
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center text-xl text-gray-500 font-bold space-x-2 gap-4 p-4 cursor-pointer hover:text-blue-500 hover:font-bold hover:bg-blue-100 rounded-xl hover:duration-100"
            >
              <i className={item.icon}></i>
              <p>{item.title}</p>
            </div>
          ))}
          <img src="/online-education.jpg" alt="" />
          <Button
            className={
              "bg-blue-500 w-[50%] my-4 text-2xl rounded-2xl hover:bg-blue-700"
            }
          >
            Contact us
          </Button>
        </CardContainer>
      </section>
      <section className="w-[80%]">
        <CardContainer className={"flex justify-between gap-4 h-[400px]"}>
          <section className="w-[30%] text-start p-10">
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
                <div key={index} className="flex items-center gap-2">
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
          </section>
          <section className="w-[70%]">
            <img
              src="/banner.jpg"
              className="object-contain w-full h-full"
              alt=""
            />
          </section>
        </CardContainer>
        <p className="text-2xl font-bold w-fit">Popular Courses</p>
        <div className="border-2 border-red-500 grid grid-cols-3 items-center gap-4">
          {courses.map((item, index) => (
            <CourseItem key={index} course={item} />
          ))}
        </div>
        {footer.map((item, index) => (
          <CardContainer className={"w-fit"}>
            <i className={item.icon}></i>
            <div>{item.title}</div>
            <div>{item.description}</div>
          </CardContainer>
        ))}
      </section>
    </div>
  );
};

export default Home;
