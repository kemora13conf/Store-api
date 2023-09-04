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
    </div>
  );
}

export default Home;
