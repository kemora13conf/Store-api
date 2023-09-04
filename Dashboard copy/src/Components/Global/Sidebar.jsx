import React, { useContext } from 'react'
import { AppContext } from '../../App'
import { toast } from 'react-toastify';
import MyLink from './MyLink';

function Sidebar({openedSidebar, width}) {
    const { setIsAuth, setCurrentUser, activeTab } = useContext(AppContext)
    const logout = () => {
        localStorage.removeItem("jwt");
        setIsAuth(false);
        setCurrentUser({});
        toast.success("Logged out successfully");
      };
    return (
        <div className={`flex flex-col left-0 fixed z-50 top-[96px] ${width < 767 ? openedSidebar ? 'left-2 !top-[86px] bg-light-primary-500light min-h-[calc(100vh-106px)] shadow-xl rounded-xl ' : '!-left-[270px]' : ''} w-[270px] min-h-[calc(100vh-96px)] py-4 px-2 transition-all duration-300 overflow-hidden`}>
            <div className="flex flex-col justify-center w-full gap-4 min-h-[calc(100vh-138px)] md:min-h-[calc(100vh-128px)] flex-grow-0 flex-shrink-0">
                {/* dashboard icon */}
                <MyLink to='' className={`${ activeTab == 'Dashboard' ? 'activeTab' : '' } flex items-center w-full rounded-xl  p-2 gap-2 cursor-pointer transition-all duration-300 hover:bg-tertiary hover:shadow-md group`}>
                    <div className="flex w-[40px] h-[40px] bg-secondary justify-center items-center rounded-lg shadow-md transition-all duration-300 group-hover:bg-light-primary-500dark-soft">
                        <i className="text-1xl text-light-primary-500dark-soft fas fa-tachometer-alt transition-all duration-300 group-hover:text-tertiary"></i>
                    </div>
                    <p className='text-light-primary-500dark-soft'>Dashboard</p>
                </MyLink>

                {/* category icon */}
                <MyLink to='categories' className={`${ activeTab == 'Categories' ? 'activeTab' : '' } flex items-center w-full rounded-xl  p-2 gap-2 cursor-pointer transition-all duration-300 hover:bg-tertiary hover:shadow-md group`}>
                    <div className="flex w-[40px] h-[40px] bg-secondary justify-center items-center rounded-lg shadow-md transition-all duration-300 group-hover:bg-light-primary-500dark-soft">
                        <i className="text-1xl text-light-primary-500dark-soft fas fa-list transition-all duration-300 group-hover:text-tertiary"></i>
                    </div>
                    <p className='text-light-primary-500dark-soft'>Categories</p>
                </MyLink>
                
                {/* product icon */}
                <MyLink to='products' className={`${ activeTab == 'Products' ? 'activeTab' : '' } flex items-center w-full rounded-xl  p-2 gap-2 cursor-pointer transition-all duration-300 hover:bg-tertiary hover:shadow-md group`}>
                    <div className="flex w-[40px] h-[40px] bg-secondary justify-center items-center rounded-lg shadow-md transition-all duration-300 group-hover:bg-light-primary-500dark-soft">
                        <i className="text-1xl text-light-primary-500dark-soft fas fa-box transition-all duration-300 group-hover:text-tertiary"></i>
                    </div>
                    <p className='text-light-primary-500dark-soft'>Products</p>
                </MyLink>

                {/* logout icon */}
                <button onClick={logout} className="flex items-center w-full rounded-xl  p-2 mt-auto gap-2 cursor-pointer transition-all duration-300 hover:bg-tertiary hover:shadow-md group">
                    <div className="flex w-[40px] h-[40px] bg-secondary justify-center items-center rounded-lg shadow-md transition-all duration-300 group-hover:bg-light-primary-500dark-soft">
                        <i className="text-1xl text-light-primary-500dark-soft fas fa-sign-out-alt rotate-180 transition-all duration-300 group-hover:text-tertiary"></i>
                    </div>
                    <p className='text-light-primary-500dark-soft'>Logout</p>
                </button>

            </div>
        </div>
    )
}

export default Sidebar