import { useContext, useEffect } from "react"
import { AppContext } from "../../App"
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ProtectedRoute(){
    const { isAuth, reqFinished } = useContext(AppContext)
    const Navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if(reqFinished && !isAuth){
            Navigate('login', { state: { from: location.pathname } });
        }
    },[reqFinished, isAuth]);
    return (
        isAuth == true && <Outlet />
    )
}