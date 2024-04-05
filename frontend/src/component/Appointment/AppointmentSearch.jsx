import React from "react";
import Button from "../Button/Button";

const AppointmentSearch = ({
  keyword,
  isSearchInvalid,
  handleSearchInputChange,
  handleSearch,
  handleClear,
}) => {
  return (
    <section className="md:flex items-center gap-4">
      <div className="my-5 w-full">
        <input
          value={keyword}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          className={`w-full p-2 focus:outline-none rounded-md ${
            isSearchInvalid
              ? "bg-red-300 border-red-400 border-2 placeholder:text-red-700"
              : ""
          }`}
          type="text"
          placeholder={
            isSearchInvalid ? "Please enter keyword..." : "Enter keyword..."
          }
        />
      </div>
      <section className="flex flex-col md:flex-none md:flex-row items-center gap-2">
        <Button
          onClick={handleSearch}
          className={"text-white md:w-fit bg-blue-500 hover:bg-blue-700"}
        >
          Search
        </Button>
        <Button
          onClick={handleClear}
          className={"text-white lg:w-fit bg-red-500 hover:bg-red-700"}
        >
          Clear
        </Button>
      </section>
    </section>
  );
};

export default AppointmentSearch;
