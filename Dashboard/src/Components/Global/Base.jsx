import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext } from '../../App';
import Loading from './Loading';
import Header from './Header/Header';
const Base = () => {
  const { loaded } = useContext (AppContext);
  return (
    <>
      <Loading loading={loaded} />
      <div className="flex w-full md:w-[calc(100%-270px)] md:ml-[270px] justify-center pt-[96px] min-h-screen px-2 md:px-4 overflow-hidden">
        <Header />
        <div className="w-full h-full px-4 py-2">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Base