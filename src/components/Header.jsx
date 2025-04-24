import React from "react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <div className=" z-50 sticky top-0 flex justify-between text-white bg-blue-600 p-6">
      <h2 className="text-2xl font-bold  ">TaskFlow</h2>
      <Input
        placeholder="Search tasks..."
        className="w-1/2 bg-white  placeholder:text-gray-700 rounded-[50px]"
      />
      <div className="w-10 h-10 bg-gray-300 rounded-full" />
    </div>
  );
};

export default Header;
