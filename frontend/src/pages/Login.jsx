import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";

const Login = () => {
  const [status, setStatus] = useState(null);
  const [resMess, setResMess] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}user/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );
      if (res.data.status === 200) {
        setResMess(res.data.mess);
        setStatus(200);
        localStorage.setItem("user", JSON.stringify(res.data));

        if (res.data.user.role === "admin") {
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          setTimeout(() => {
            navigate("/main");
          }, 1000);
        }
      } else {
        setResMess(res.data.mess);
        setStatus(401);
        setFormData("");
      }
    } catch (error) {}
  };

  return (
    <div className="bg-white rounded-md h-fit md:w-[50%] p-4 mt-20 mx-4">
      <h1 className="text-4xl font-bold">Login</h1>
      <Input
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        value={formData.email}
        type="email"
        name={"email"}
        placeholder="Email..."
        className={"p-2 mt-3"}
      />
      <Input
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        value={formData.password}
        type="password"
        name={"password"}
        placeholder="Password..."
        className={"p-2 my-3"}
      />
      <Button
        onClick={handleLogin}
        className={"bg-blue-500 mt-4 hover:bg-blue-700"}
      >
        Login
      </Button>
      {resMess && <ResMess mess={resMess} status={status} />}
    </div>
  );
};

export default Login;
