import React, { useState } from "react";
import Button from "./Button/Button";

const AuthMethod = () => {
  const [authMethod, setAuthMethod] = useState("username_password");

  const handleChange = (event) => {
    setAuthMethod(event.target.value);
  };

  return (
    <div>
      <h1>Select Authentication Method</h1>
      <form>
        <label>
          <input
            type="radio"
            value="username_password"
            checked={authMethod === "username_password"}
            onChange={handleChange}
          />
          Username/Password
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="cognito"
            checked={authMethod === "cognito"}
            onChange={handleChange}
          />
          Cognito
        </label>
      </form>
      {authMethod === "cognito" && (
        <div className="mt-2">
          <Button className={"bg-green-500 w-[50%] hover:bg-green-700"}>
            Create cognito resource
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthMethod;
