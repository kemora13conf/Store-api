import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../App';
import Fetch from '../utils';
import { Toggle } from '../Global/ToggleBtn/Toggle';
import { motion, AnimatePresence } from 'framer-motion';
import MyLink from '../Global/MyLink';
import Alert from '../Global/Alert/Alert';
import { toast } from 'react-toastify';


function Categories() {
    const { setActiveTab, setLoaded, reqFinished, setReqFinished } = useContext(AppContext);
    const [ categories, setCategories ] = useState([]);

    const changeState = (state, id) => {
      console.log("Category: ", id,"Toggled: ", state)
      Fetch(import.meta.env.VITE_API+'/categories/change-state-category/'+id, 'PUT', { state })
      .then(res => {
        setCategories(prv => {
          return prv.map(category => {
            if(category._id === id) {
              console.log({
                ...category,
                enabled: state
              })
              return {
                ...category,
                enabled: state
              }
            }
            return category;
          })
        })
      })
    }

    const deleteCategory = async (id) => {
      Alert({
          title: "Are you sure you want to delete this category ?",
          message: "You won't be able to revert this!",
          icon: "warning",
          buttons: [
              {
                  text: "Yes, delete it!",
                  type: 'primary' 
              },
              {
                  text: "Cancel",
                  type: 'secondary'
              }
          ],
          close: async (closeAlert) => {
              await new Promise((resolve) => {
                  Fetch(import.meta.env.VITE_API+'/categories/delete-category/'+id, 'DELETE')
                  .then(res => {
                      if(res.type == 'success') {
                          toast.success("Category deleted successfully");
                          setCategories(prv => prv.filter(category => category._id !== id));
                      } else {
                          toast.error(res.message);
                      }
                      resolve();
                  })
                  .catch(err => {
                      toast.error("Something went wrong");
                      resolve();
                  })
                  closeAlert();
              })
          }
      })
  }


    useEffect(() => {
        setActiveTab("Categories");
        Fetch(import.meta.env.VITE_API+'/categories', 'GET')
        .then(res => {
          setCategories(res.data);
          setReqFinished(true);
        })
    },[]);

    useEffect(() => {
      setLoaded(true);
    }, [reqFinished]);
  return (
    <div>
      <div className="flex justify-between items-center w-full px-4 py-4">
        <h1 className="w-full text-light-primary-500dark-soft text-xl font-medium">
          Categories
        </h1>
        <MyLink to='create' className="flex w-full max-w-fit  justify-center items-center gap-2 px-4 py-2 bg-tertiary rounded-xl shadow-md text-white font-semibold transition-all duration-300 hover:bg-secondary">
          <i className="fas fa-plus"></i>
          <p className=''>new category</p>
        </MyLink>
      </div>

      <div className="w-full max-w-[1000px] mx-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm font-semibold text-gray-800">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-gray-700">
            <AnimatePresence>
              {
                categories?.map((category, index) =>{
                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      exit={{ opacity: 0, y: -20}}
                      key={index} className="border-b border-gray-200 hover:bg-gray-100 overflow-hidden">
                      <td className="px-4 py-3">{category.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold ${category.enabled ? 'text-green-600' : 'bg-red-600'} bg-green-200 rounded-full`}>
                          { category.enabled ? 'Enabled' : 'Disabled' }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full h-auto relative flex gap-2">
                          <Toggle
                            toggled={category.enabled}
                            onClick={(state) => changeState(state, category._id)}
                          />
                          <MyLink to={`${category._id}/update`} className="shadow w-8 h-8 flex justify-center items-center rounded-full bg-light-primary-500light text-light-primary-500dark-soft hover:bg-light-primary-500dark-soft hover:text-light-primary-500light transition-all duration-300">
                            <i className="fas fa-pen"></i>
                          </MyLink >
                          <button
                            onClick={() => {deleteCategory(category._id)}} 
                            className="shadow w-8 h-8 flex justify-center items-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              }
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Categories