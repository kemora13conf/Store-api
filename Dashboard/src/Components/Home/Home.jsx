import React, { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { motion } from "framer-motion";
import MyLink from "../Global/MyLink";

function Home() {
  const { reqFinished, setActiveTab, currentUser, setLoaded } = useContext(AppContext);
  console.log(reqFinished)
  useEffect(() => {
    setLoaded(true);
    setActiveTab("Dashboard");
  }, [reqFinished]);
  
  // well lookin modern design for a dashboard home page with a nice animation on the cards and a nice background color
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div
          className="flex flex-col w-full h-full p-4"
          >
          <div className="flex flex-col w-full h-full bg-white rounded-xl gap-8">
            <div className="flex justify-between items-center w-full px-4">
              <h1 className="text-center flex flex-col justify-center items-cente w-full text-light-primary-500dark-soft">
                Welcome back
                <span className="font-bold">{currentUser.fullname}</span> 
              </h1>
            </div>
            <div className="flex gap-4 w-full h-full">
              <MyLink to='categories/create' className="w-full shadow-md rounded-xl flex flex-col justify-start items-start gap-4 px-4 py-4 bg-tertiary cursor-pointer transition-all duration-300 hover:bg-secondary">
                <div className="w-[70px] h-[70px] flex justify-center items-center bg-light-primary-500dark-soft rounded-2xl shadow-md">
                  <i className="fas fa-plus text-3xl text-tertiary"></i>
                </div>
                <h1 className="text-gray-800 w-full">
                  Add a new category
                </h1>
              </MyLink>
              <MyLink to='products/create' className="w-full shadow-md rounded-xl flex flex-col justify-start items-start gap-4 px-4 py-4 bg-tertiary cursor-pointer transition-all duration-300 hover:bg-secondary">
                <div className="w-[70px] h-[70px] flex justify-center items-center bg-light-primary-500dark-soft rounded-2xl shadow-md">
                  <i className="fas fa-plus text-3xl text-tertiary"></i>
                </div>
                <h1 className="text-gray-800 w-full">
                  Add a new product
                </h1>
              </MyLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
