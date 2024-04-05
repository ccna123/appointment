import React from "react";
import Button from "../Button/Button";

const AppointmentSearch = ({
  keyword,
  handleSearchInputChange,
  handleSearch,
  handleClear,
}) => {
  return (
    <div className="p-1 bg-white rounded-md my-5 flex items-center gap-4">
      <input
        value={keyword}
        onChange={(e) => handleSearchInputChange(e.target.value)}
        className="border-npne w-full p-2 focus:outline-none"
        type="text"
        placeholder="Enter keyword..."
      />
      <Button
        onClick={handleSearch}
        className={"text-white w-fit bg-blue-500 hover:bg-blue-700"}
      >
        Search
      </Button>
      <Button
        onClick={handleClear}
        className={"text-white w-fit bg-red-500 hover:bg-red-700"}
      >
        Clear
      </Button>
    </div>
  );
};

export default AppointmentSearch;
