import { useContext, useEffect } from "react"
import { AppContext } from "../../App"
import { Outlet, useLocation, useNavigate, } from "react-router-dom"

export default function Locked(){
    const { isAuth, setLoaded, reqFinished } = useContext(AppContext)
    const location = useLocation(); 
    const Navigate = useNavigate();
    const from = location.state && location.state.from ? location.state.from : '/dashboard';
    useEffect(() => {
        setLoaded(true);
        if(reqFinished && isAuth){
            Navigate(from);
        }
    },[reqFinished, isAuth]);
    return (
        reqFinished ? isAuth == false ? <Outlet /> : null : null
    )
}