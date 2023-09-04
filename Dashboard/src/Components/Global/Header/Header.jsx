import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../App";
import Sidebar from "../Sidebar";
import useMeasure from "react-use-measure";
import './header.css'
import { AnimatePresence } from "framer-motion";
import ProfileMenu from "./ProfileMenu";

function Header() {
  const { currentUser, activeTab, loaded } = useContext(AppContext);
  const [openedSidebar, setOpenedSidebar] = useState(false);
  const [ y, setY ] = useState(0);
  const [ref, bounds] = useMeasure()

  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(()=>{
    setOpenedSidebar(false)
  }, [loaded])
  useEffect(()=>{
    window.addEventListener('scroll', () => {
      setY(window.scrollY)
    })
    return () => {
      window.removeEventListener('scroll', () => {
        setY(window.scrollY)
      })
    }
  }, [])
  return (
    <>
      <div ref={ref} className={
        `flex justify-between items-center fixed z-50 top-0 left-0 w-full py-3 px-2 md:px-5 transition-all duration-300`
        + (y > 0 ? ' header-reveal' : 'bg-light-primary-500 md:bg-transparent')
      }>
        <div className="flex items-center">
          <div onClick={()=>{setOpenedSidebar(prv => !prv)}}  className={`flex md:hidden nav-btn ${openedSidebar ? 'active' : ''}`}>
              <span></span>
          </div>
          <h1 className="ml-2 text-2xl font-semibold text-light-quarternary-500 dark:text-dark-quarternary-500 ">{activeTab}</h1>
        </div>
        <div className="flex items-center">
          <div
            onClick={() => setProfileMenu(prv => !prv)}
            className={
              `flex items-center justify-center w-fit h-fit pr-4 gap-3 transition-all duration-300 cursor-pointer 
              relative border border-light-secondary-500 rounded-full
              ${profileMenu ? 'bg-light-secondary-500 dark:bg-dark-secondary-500' : 'bg-transparent'}
              dark:border-dark-secondary-500 
              `
            }>
            <img src={`${import.meta.env.VITE_ASSETS}/Clients-images/${currentUser.image}`} className="max-w-[40px] rounded-full shadow-lg" />
            <i className={`fas fa-chevron-down text-sm transition-all duration-300 ${profileMenu ? 'rotate-180' : ''}`}></i>
            <AnimatePresence mode="wait">
              {
                profileMenu 
                ? [1].map((_, i) => (
                    <ProfileMenu key={i} active={profileMenu}/>
                  ))
                : null
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Sidebar openedSidebar={openedSidebar} width={bounds.width} />
    </>
  );
}

export default Header;
