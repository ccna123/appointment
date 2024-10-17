import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { CognitoUserPool, CognitoUserAttribute } from "amazon-cognito-identity-js";
import userpool from "../userpool";

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

    console.log(process.env.REACT_APP_USER_POOL_ID);


    if (!formData.email || !formData.password) {
      setResMess("Email and password are required")
      setStatus(400)
      return
    }

    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: formData.email }),
      new CognitoUserAttribute({ Name: 'name', Value: formData.name }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: formData.role })
    ]

    userpool.signUp(
      formData.email,
      formData.password,
      attributeList,
      null,
      (err, data) => {
        if (err) {
          console.log(err);
          setResMess(err.message)
          setStatus(409)
          setFormData({
            email: "",
            password: "",
            name: "",
            role: "user",
          })
          return
        }
        setResMess("Signup successfully! Please verify your email")
        setStatus(201)
        navigate(`/verify/${formData.email}`)
      }
    )
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
