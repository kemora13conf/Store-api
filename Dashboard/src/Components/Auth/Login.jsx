import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../App";
import { nanoid } from "nanoid";

export default function Login() {
  const { setIsAuth, setCurrentUser, setLoaded } = useContext(AppContext);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.type == "success") {  
          setErrors({});
          localStorage.setItem("jwt", res.data.token);
          toast.success(res.message);
          setCurrentUser(res.data.client);
          setIsAuth(true);
        } else {
          setErrors({ [res.type]: res.message });
        }
      });
  };
  useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0.4, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0.4, y: -50 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col justify-center min-h-screen px-4 md:px-0"
    >
      <div className="w-full max-w-[400px] p-6 md:px-12 m-auto bg-white rounded-md shadow-xl shadow-rose-600/40 ring ring-tertiary lg:max-w-xl">
        <img
          src={`${import.meta.env.VITE_ASSETS}/logo/logo.png`}
          className="max-h-[150px] mx-auto"
        />
        <h1 className="text-3xl font-semibold text-center text-secondary uppercase ">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="my-6">
          <div className="mb-2">
            <label
              for="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email
            </label>
            <div className="w-full relative flex items-center mt-2">
              <i className="absolute left-3 w-fit right-3 text-gray-400 fas fa-envelope"></i>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-4 py-2 pl-9 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  key={nanoid()}
                  initial={{ opacity: 0.4, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.4, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mb-2">
            <label
              for="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <div className="w-full relative flex items-center mt-2">
              <i className="absolute left-3 w-fit right-3 text-gray-400 fas fa-lock"></i>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-4 py-2 pl-9 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>

            <AnimatePresence>
              {errors.password && (
                <motion.p
                  key={nanoid()}
                  initial={{ opacity: 0.4, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.4, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-red-500"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-6">
            <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-quaternary rounded-md hover:bg-light-primary-500dark-soft focus:outline-none focus:bg-light-primary-500dark-soft">
              Login
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
