import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import Fetch from '../utils';
import { toast } from 'react-toastify';
import Alert from '../Global/Alert/Alert';

function ProductForm() {
    // get the id param from the url
    const { id } = useParams();
    const { setActiveTab, setLoaded, reqFinished } = useContext(AppContext);
    const [ product, setProduct ] = useState({});
    const [ categories, setCategories ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ form, setForm ] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        gallery: "",
        remove: []
    });
    const [ images, setImages ] = useState([]);
    const [ preview, setPreview ] = useState([]);
    const [ oldImagesPreview, setOldImagesPreview ] = useState([]);
    const [ errors, setErrors ] = useState({});
    const Navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm(prv => {
            return {
                ...prv,
                [name]: value
            }
        })
    }
    const removeImage = (id) => {
        setForm(prv => {
            return {
                ...prv,
                remove: [
                    ...prv.remove,
                    id
                ]
            }
        })
        setOldImagesPreview(prv => {
            return prv.filter(img => img._id !== id)
        })
    }
    const handleFile = (e) => {
        const files = e.target.files;
        if(files) {
            setImages(files);
            for(var i=0; i<files.length; i++) {
                const file = files[i];
                setPreview(prv => {
                    return [
                        ...prv,
                        URL.createObjectURL(file)
                        ]
                });
                if(file.type !== 'image/png' && file.type !== 'image/jpeg') {
                    setErrors(prv => {
                        return {
                            ...prv,
                            gallery: "Only png and jpeg files are allowed"
                        }
                    })
                }
            }
        }
    }
    const resetErrors = () => {
        setErrors(prv => {
            return {
                ...prv,
                name: "",
                title: "",
                description: "",
                gallery: "",
                price: "",
                quantity: "",
                category: ""
            }
        })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("quantity", form.quantity);
        formData.append("category", form.category);
        formData.append("remove", form.remove);
        for(var i=0; i<images.length; i++) {
            formData.append("images", images[i]);
        }
        if(id) {
            fetch(import.meta.env.VITE_API+'/products/update-product/'+id, {
                method: "PUT",
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: formData
            })
            .then(res => res.json())
            .then(res => {
                resetErrors();
                if(res.type != "success") {
                    setErrors(prv => {
                        return {
                            [res.type]: res.message
                        }
                    })
                    setLoading(false);
                    return;
                }
                toast.success("Product updated successfully");
                setProduct(res.data)
                setLoading(false);

                // reset
                setImages([])
                setPreview([])
            })
            .catch(err => {
                toast.error("Something went wrong");
                setLoading(false);
            })
        } else {
            fetch(import.meta.env.VITE_API+'/products/create-product', {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: formData,
            })
            .then(res => res.json())
            .then(res => {
                toast.success("Product added successfully");
                setLoading(false);
                Navigate('/dashboard/products');
            })
            .catch(err => {
                toast.error("Something went wrong");
                setLoading(false);
            })
        }
    }
    const handleDelete = () => {
        Alert({
            title: "Are you sure you want to delete this product ?",
            message: "You won't be able to revert this!",
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
                    Fetch(import.meta.env.VITE_API+'/products/delete-product/'+id, 'DELETE')
                    .then(res => {
                        toast.success("Product deleted successfully");
                        Navigate('/dashboard/products');
                        resolve();
                    })
                    .catch(err => {
                        toast.error("Something went wrong");
                        resolve();
                    })
                })
                closeAlert();
            }
        })
    }

    // fetch the product data
    useEffect(() => {
        setLoaded(true);
        setActiveTab("Products");
        if(id) {
            Fetch(import.meta.env.VITE_API+'/products/'+id, 'GET')
            .then(res => {
                setProduct(res.data);
            })
        }
        // loading categories
        Fetch(import.meta.env.VITE_API+'/categories', 'GET')
        .then(res => {
            setCategories(res.data);
        })
    }
    ,[reqFinished]);
    // set the form data
    useEffect(() => {
        if(id) {
            setForm(prv => {
                return {
                    ...prv,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    quantity: product.quantity,
                    category: product.category,
                    gallery: product.gallery
                }
            })
            setOldImagesPreview(prv => []);
            product.gallery?.map(image => {
                setOldImagesPreview(prv => {
                    return [
                        ...prv,
                        image
                    ]
                })
            })
        }
    }
    ,[product]);
    // set the errors
    useEffect(() => {
        resetErrors();
    },[form]);
    
    return (
        <div className='md:px-4'>
            <div className="flex justify-between items-center w-full px-4 py-4">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {id ? "Edit product" : "Add a new product"}
                </h1>
                <div className="flex items-center gap-4">
                    <button onClick={handleDelete} className="flex items-center justify-center w-fit shadow h-fit rounded-md bg-red-600 text-light-primary-500light p-2 px-4 transition-all duration-300 cursor-pointer hover:bg-red-500">
                        <i className="fas fa-trash"></i>
                        <h1 className="ml-2 text-sm  hidden md:block">Delete</h1>
                    </button>
                </div>
            </div>
            <div className="w-full max-w-[1000px] mx-auto">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-semibold text-gray-800">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={form.name}
                            onChange={handleInput}
                            className={`w-full px-4 py-2 rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-primary-500light focus:border-transparent transition-all duration-300 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                        />
                        {
                            errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )
                        }
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-semibold text-gray-800">Description</label>
                        <textarea
                            name="description"
                            id="description"
                            value={form.description}
                            onChange={handleInput}
                            className={`w-full px-4 py-2 rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-primary-500light focus:border-transparent transition-all duration-300 ${errors.description ? 'ring-2 ring-red-500' : ''}`}
                        />
                        {
                            errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )
                        }
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="price" className="text-sm font-semibold text-gray-800">Price</label>
                            <input
                                type="text"
                                name="price"
                                id="price"
                                value={form.price}
                                onChange={handleInput}
                                className={`w-full px-4 py-2 rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-primary-500light focus:border-transparent transition-all duration-300 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                            />
                            {
                                errors.price && (
                                    <p className="text-sm text-red-500">{errors.price}</p>
                                )
                            }
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label htmlFor="quantity" className="text-sm font-semibold text-gray-800">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                min={0}
                                value={form.quantity}
                                onChange={handleInput}
                                className={`w-full px-4 py-2 rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-primary-500light focus:border-transparent transition-all duration-300 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                            />
                            {
                                errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity}</p>
                                )
                            }
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="image" className="text-sm font-semibold text-gray-800">Choose an image</label>
                               {/* nice lookin file import with tailwind css */}
                                <div className="flex gap-2">
                                    <label htmlFor="image" className="flex justify-center items-center w-full h-full px-4 py-2 rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-primary-500light focus:border-transparent transition-all duration-300 cursor-pointer hover:bg-tertiary">
                                        <i className="fas fa-upload text-light-primary-500dark-soft"></i>
                                        <p className="ml-2 text-light-primary-500dark-soft">Upload</p>
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        id="image"
                                        multiple
                                        onChange={handleFile}
                                        className="hidden"
                                    />
                                </div>

                                {
                                    errors.gallery && (
                                        <p className="text-sm text-red-500">{errors.gallery}</p>
                                    )
                                }
                            </div>
                            <div className="flex gap-2 flex-col">
                                <label htmlFor="image" className="text-sm font-semibold text-gray-800">Images preview</label>
                                <div className="w-full h-[110px] p-4 flex justify-start items-start bg-gray-100 rounded-xl shadow-md gap-3 overflow-hidden overflow-x-auto">
                                    {
                                        preview?.map((img, index) => {
                                            return (
                                                <img src={img} key={index} className="w-[100px] h-full rounded-xl object-cover" />
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="flex gap-2 flex-col">
                                <label className="text-sm font-semibold text-gray-800">Old images preview</label>
                                <div className="w-full h-[160px] p-4 flex justify-start items-start bg-gray-100 rounded-xl shadow-md gap-3 overflow-hidden overflow-x-auto">
                                    {
                                        oldImagesPreview?.map((img, index) => {
                                            return (
                                                <div key={index} className="w-full relative h-full max-w-[250px] min-w-[150px] ">
                                                    <div
                                                        onClick={() => {removeImage(img._id)}}
                                                        className="flex w-[30px] h-[30px] bg-white rounded-full justify-center items-center absolute right-2 top-2 cursor-pointer">
                                                        <i className="fas fa-close"></i>
                                                    </div>
                                                    <img src={import.meta.env.VITE_ASSETS + '/Products-images/' + img.name} key={index} className="w-[250px] h-full rounded-xl object-cover" />
                                                </div>

                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="flex w-full max-w-fit  justify-center items-center gap-2 px-4 py-2 bg-tertiary rounded-lg shadow-md text-white font-semibold transition-all duration-300 hover:bg-secondary">
                        {
                            loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : null
                        }
                        <p className=''>{id ? "save product" : "Add a new product"}</p>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProductForm