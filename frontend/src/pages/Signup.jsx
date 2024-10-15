import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";

const Signup = () => {
  const [status, setStatus] = useState(null);
  const [resMess, setResMess] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
  });

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSignUp = async () => {

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}user/signup`,
        {
          email: formData.email,
          password: formData.password,
          userName: formData.name,
          role: formData.role,
        }
      );
      if (res.data.status === 201) {
        setResMess(res.data.mess);
        setStatus(201);
        localStorage.setItem("user", JSON.stringify(res.data));
      } else {
        setResMess(res.data.mess);
        setStatus(409);
        setFormData("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-md h-fit md:w-[50%] p-4 mt-20 mx-4">
      <h1 className="text-4xl font-bold">Sign up</h1>
      <Input
        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
        value={formData.name}
        type="text"
        name={"name"}
        placeholder="Name..."
        className={"p-2 mt-3"}
      />
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
        onClick={handleSignUp}
        className={"bg-green-500 mt-4 hover:bg-green-700"}
      >
        Confirm
      </Button>
      <Button
        onClick={() => navigate("/")}
        className={"bg-blue-500 mt-4 hover:bg-blue-700"}
      >
        Go to login
      </Button>
      {resMess && <ResMess mess={resMess} status={status} />}
    </div>
  );
};

export default Signup;
