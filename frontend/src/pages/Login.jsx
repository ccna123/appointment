import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import userPool from "../userpool"
import { jwtDecode } from "jwt-decode";

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
    if (!formData.email || !formData.password) {
      setResMess("Email and password are required")
      setStatus(400)
      return
    }

    const authenticationDetails = new AuthenticationDetails({
      Username: formData.email,
      Password: formData.password
    })

    const user = new CognitoUser({
      Username: formData.email,
      Pool: userPool
    })

    user.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        localStorage.clear()
        const payload = jwtDecode(JSON.stringify(result.getIdToken()));

        const idToken = result.getIdToken().jwtToken
        const accessToken = result.getAccessToken().jwtToken
        const refreshToken = result.getRefreshToken().token

        setResMess("Login successfull!")
        setStatus(200)
        const user = {
          userId: payload["sub"],
          userRole: payload["custom:role"],
          userName: payload["name"]
        }

        await axios.post(`${process.env.REACT_APP_BACKEND_URL}auth/tokens`, {
          idToken, accessToken, refreshToken
        }, {
          withCredentials: true
        })

        localStorage.setItem("user", JSON.stringify(user))
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}user/login`, { userId: user.userId }, { withCredentials: true }
        )
        setTimeout(() => {
          navigate("/main")
        }, 2000);
      },
      onFailure: (err) => {
        console.log(err);
        setResMess(err.message)
        setStatus(401)

      }
    })
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
      <Button
        onClick={() => navigate("/signup")}
        className={"bg-green-500 mt-4 hover:bg-green-700"}
      >
        Sign up
      </Button>
      {resMess && <ResMess mess={resMess} status={status} />}
    </div>
  );
};

export default Login;
