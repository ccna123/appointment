import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { useForm } from "react-hook-form";
import Spinner from "../component/Spinner";

const Signup = () => {
  const [response, setResponse] = useState({
    status: null,
    mess: "",
  });
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${
          window.env.REACT_APP_AUTH_SERVICE_URL || "http://localhost:4020/auth"
        }signup`,
        {
          email: data.email,
          password: data.password,
          name: data.name,
        }
      );
      setResponse({
        status: res.status,
        mess: res.data.mess,
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setResponse({
        status: error.response.status,
        mess: error.response.data.error,
      });
    }
  };

  return (
    <div className="bg-white rounded-md h-fit md:w-[50%] p-4 mt-20 mx-4">
      <h1 className="text-4xl font-bold">Sign up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("name", { required: true })}
          type="text"
          placeholder="Name..."
          className={`mt-3 ${errors.name && "border-red-500"}`}
          autoComplete={"name"}
        />
        <Input
          {...register("email", { required: true })}
          type="text"
          placeholder="Email..."
          className={`mt-3 ${errors.email && "border-red-500"}`}
          autoComplete={"email"}
        />
        <Input
          {...register("password", { required: true })}
          type="password"
          placeholder="Password..."
          className={`my-3 ${errors.password && "border-red-500"}`}
          autoComplete={"current-password"}
        />
        <Button
          type="submit"
          className={
            "bg-green-500 mt-4 hover:bg-green-700 flex items-center justify-center gap-4"
          }
        >
          Confirm
          {isSubmitting && <Spinner />}
        </Button>
      </form>
      <Button
        onClick={() => navigate("/")}
        className={"bg-blue-500 mt-4 hover:bg-blue-700"}
      >
        Go to login
      </Button>
      {response && <ResMess mess={response.mess} status={response.status} />}
    </div>
  );
};

export default Signup;
