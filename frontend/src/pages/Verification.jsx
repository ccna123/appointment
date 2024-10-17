import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Button from "../component/Button/Button";
import Input from "../component/Input/Input";
import ResMess from "../component/ResponseMessage/ResMess";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import userPool from "../userpool"

const Verification = () => {

  const [status, setStatus] = useState(null);
  const [resMess, setResMess] = useState("");

  const { email } = useParams()

  const [verificationCode, setVerificationCode] = useState("")

  const navigate = useNavigate();

  const handleVerification = async () => {

    if (!verificationCode) {
      setResMess("Please enter verification code")
      setVerificationCode("")
      return
    }

    try {
      const user = new CognitoUser({
        Username: email,
        Pool: userPool
      })

      await user.confirmRegistration(verificationCode, true, (err, data) => {
        if (err) {
          console.log(err);
          setResMess(err.message)
          setStatus(400)
        } else {
          setResMess("Verification successfully! You can log in.")
          setStatus(200)
          setTimeout(() => {
            navigate("/")
          }, 2000);

        }
      })
    } catch (error) {
      console.log(error);
      setResMess(error.message)
      setStatus(500)
    }
  }

  return (
    <div className="bg-white rounded-md h-fit md:w-[50%] p-4 mt-20 mx-4">
      <h1 className="text-4xl font-bold">Login</h1>
      <Input
        onChange={(e) => setVerificationCode(e.target.value)}
        value={verificationCode}
        type="text"
        name={"verificationCode"}
        placeholder="Verification Code..."
        className={"p-2 mt-3"}
      />
      <Button
        onClick={handleVerification}
        className={"bg-green-500 mt-4 hover:bg-green-700"}
      >
        Verification
      </Button>
      {resMess && <ResMess mess={resMess} status={status} />}
    </div>
  );
};

export default Verification;
