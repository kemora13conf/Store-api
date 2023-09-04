import React, { useContext, useState } from 'react'
import { motion } from 'framer-motion';
import { AppContext } from '../../../App';
import MyLink from '../MyLink';
import { Toggle } from '../ToggleBtn/Toggle';

function ProfileMenu({active}) {
    const { currentUser, theme, setTheme } = useContext(AppContext);
    const handleClik = (toggled) => {
        let th = '';
        if(toggled) {
            setTheme('dark')
            th = 'dark'
        } else {
            setTheme('light')
            th = 'light'
        }
        fetch(`${import.meta.env.VITE_API}/clients/update-theme`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + localStorage.getItem('jwt')
            },
            body: JSON.stringify({ theme: th })
          })
    }
  return (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: .3 }}        
        className={`
            absolute top-[calc(100%+10px)] right-0 bg-light-secondary-500 h-auto px-3 py-3 w-full min-w-[250px] rounded-xl shadow-lg 
            flex flex-col gap-1 dark:bg-dark-secondary-500
        `}>
        <h1 className="text-light-quarternary-500 text-lg font-semibold">Profile</h1>
        <MyLink to='/profile' 
            className="flex items-center gap-3 hover:bg-light-secondary-300 hover:shadow
                transition-all duration-300 rounded-lg px-3 py-2 
                dark:hover:bg-dark-secondary-300 dark:hover:shadow
            ">
            <img src={`${import.meta.env.VITE_ASSETS}/Clients-images/${ currentUser.image }`} className="max-w-[40px] rounded-full shadow-lg" />
            <div className="flex flex-col">
                <h1 className="text-light-quarternary-500 text-sm font-semibold">{ currentUser.fullname }</h1>
                <h1 className="text-light-quarternary-500 text-xs">
                    <span className="text-light-quarternary-500 text-xs">Admin</span>
                    <span className="text-light-quarternary-500 text-xs"> | </span>
                    <span className="text-light-quarternary-500 text-xs ">
                        <i className="fas fa-circle text-green-500 mr-1"></i>
                        Online
                    </span>
                </h1>
            </div>
        </MyLink>

        <div className="w-[80%] mx-auto h-[1px] bg-light-secondary-300 dark:bg-dark-secondary-300"></div>

        <h1 className="text-light-quarternary-500 text-lg font-semibold">Settings</h1>
        <div className="flex gap-2 justify-between px-3 py-2 ">
            <h1 className="text-light-quarternary-400 text-sm font-semibold">Dark Mode</h1>
            <Toggle toggled={theme == 'dark' ? true : false} onClick={handleClik} />
        </div>
        {/* line */}
        <MyLink to='/logout'
            className="flex items-center gap-3 hover:bg-light-secondary-300 hover:shadow
                transition-all duration-300 rounded-lg px-3 py-2
                dark:hover:bg-dark-secondary-300 dark:hover:shadow
            ">
            <i className="fas fa-sign-out-alt text-light-quarternary-500 text-lg"></i>
            <h1 className="text-light-quarternary-500 text-sm font-semibold">Logout</h1>
        </MyLink>
        
        
        
    </motion.div>
  )
}

export default ProfileMenu