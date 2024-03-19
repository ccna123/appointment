import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { Main } from "./pages/Main";
import { Detail } from "./pages/Detail";
import { Admin } from "./pages/Admin";
import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App bg-gray-200 flex justify-center w-full h-screen">
        <BrowserRouter router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main" element={<Main />} />
            <Route path="/detail/:userId" element={<Detail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ApolloProvider>
  );
}

export default App;
