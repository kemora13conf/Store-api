
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

// Costume alert component for react-confirm-alert with costume ui
const Alert = ({ title, message, buttons, close }) => {
    return confirmAlert({
        customUI: ({ onClose }) => {
        return (
            <div className="bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center px-4 py-2 gap-3 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
                <div className="flex items-center justify-center w-[30px] shadow h-[30px] rounded-xl bg-light-primary-500light p-2 transition-all duration-300 cursor-pointer hover:bg-tertiary">
                    <i 
                        onClick={() => {
                            onClose();
                        }}
                        className="fas fa-close"></i>
                </div>
            </div>
            <div className="px-4 py-4">
                <p className="text-sm text-gray-800">{message}</p>
            </div>
            <div className="flex justify-end items-center px-4 py-2 border-t border-gray-200">
                {buttons.map((btn, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
                        btn.type == "primary"
                            ? "bg-red-500"
                            : "bg-transparent !text-light-primary-500dark-soft"
                        }`}
                        onClick={() => {
                            if (btn.type == "primary"){
                                close(onClose);
                            }else{
                                onClose()
                            }
                        }}
                    >
                        {btn.text}
                    </button>
                ))}
            </div>
            </div>
        );
        },
    });
};


export default Alert;