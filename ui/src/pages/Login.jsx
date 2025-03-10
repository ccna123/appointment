import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { useForm } from "react-hook-form";
import Spinner from "../component/Spinner";
import { useConfig } from "../App";

const Login = () => {
  const config = useConfig();
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
          config.REACT_APP_AUTH_SERVICE_URL || "http://localhost:4020/auth"
        }/login`,
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true,
        }
      );

      setResponse({
        status: res.status,
        mess: res.data.mess,
      });
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.user.role === "admin") {
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        setResponse({
          status: error.response.status,
          mess: error.response.statusText,
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-md h-fit md:w-[50%] p-4 mt-20 mx-4">
      <h1 className="text-4xl font-bold">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register("email", { required: true })}
          type="text"
          placeholder="Email..."
          className={`my-3 ${errors.email && "border-red-500"}`}
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
            "bg-blue-500 mt-4 hover:bg-blue-700 flex items-center justify-center gap-4"
          }
        >
          Login
          {isSubmitting && <Spinner />}
        </Button>
      </form>
      <Button
        onClick={() => navigate("/signup")}
        className={"bg-green-500 mt-4 hover:bg-green-700"}
      >
        Sign up
      </Button>
      {response && <ResMess mess={response.mess} status={response.status} />}
    </div>
  );
};

export default Login;
