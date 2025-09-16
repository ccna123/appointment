import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { useForm } from "react-hook-form";
import Spinner from "../component/Spinner";
import { useConfig } from "../App";
import { signIn, fetchAuthSession } from "@aws-amplify/auth";
import { Amplify } from "@aws-amplify/core";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    },
  },
});

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
      // Use functional signIn API (positional args still supported for backwards compat, but named params preferred in v6)
      const { nextStep } = await signIn(data.email, data.password);

      // Fetch the full session/tokens after successful sign-in
      const session = await fetchAuthSession({ forceRefresh: true });
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();
      const refreshToken = session.tokens?.refreshToken?.toString();

      if (!idToken) {
        throw new Error("No ID token received");
      }

      // Decode JWT for user info/role (or fetch from backend/Cognito attributes via getCurrentUser)
      const user = await fetchAuthSession(); // Reuse to get user context
      const userData = {
        idToken,
        accessToken,
        refreshToken,
        user: {
          username: user.username || data.email,
          // role: user.signInDetails?.loginAlias || "user", // Adjust based on your setup; fetch custom attributes if needed
          // role: "user", // Placeholder; implement role fetch via backend or Cognito
        },
      };

      // Store tokens in localStorage (consider secure alternatives like HttpOnly cookies)
      localStorage.setItem("user", JSON.stringify(userData));

      setResponse({
        status: 200,
        mess: "Login successful",
      });

      // Validate role and redirect (update role logic as needed)
      if (userData.user.role === "admin") {
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Map Cognito errors to status codes
      let status = 401;
      let message = error.message || "Login failed";
      if (error.name === "NotAuthorizedException") {
        status = 401;
        message = "Invalid credentials";
      } else if (error.name === "UserNotFoundException") {
        status = 404;
        message = "User not found";
      }
      setResponse({
        status,
        mess: message,
      });
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
