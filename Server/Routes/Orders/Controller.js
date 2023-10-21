import Order from "../../Models/Order.js";
import { response } from "../../utils.js";
import { faker } from "@faker-js/faker";
import Status from "../../Models/Status.js";
import Product from "../../Models/Product.js";
import Item from "../../Models/Item.js";

const orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id)
      .populate("status")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });
    if (!order)
      return res.status(400).json(response("error", "Order not found."));
    req.order = order;
    next();
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          "Something went wrong while fetching order. Try again later."
        )
      );
  }
};

// const list = async (req, res) => {
//     try {
//         const orders = await Order.find()
//                             .populate('status')
//                             .populate({
//                                 path: 'items',
//                                 populate: {
//                                     path: 'product',
//                                     model: 'Product'
//                                 }
//                             });
//         return res.status(200).json(response('success', 'Orders fetched successfully.', orders))
//     } catch (error) {
//         res.status(500).json(response('error','Something went wrong while fetching orders. Try again later.'))
//     }
// }

const list = async (req, res) => {
  const { lang } = req;
  let { search, searchby, orderby, page, limit } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  searchby = searchby ? searchby.toLocaleLowerCase() : "all";
  orderby = orderby ? orderby.toLocaleLowerCase() : "amount";

  try {
    let orders = [];
    if (search) {
      if (searchby == "all") {
        orders = await Order.find({
        })
          .populate("status")
          .populate({
            path: "items",
            populate: {
              path: "product",
              model: "Product",
            },
          })
          .populate({
            path: "client",
            populate: {
                path: "image",
                model: "Image"
            }
          })
          .collation({ locale: "en", strength: 2 }) // make the search case insensitive
          .sort({ [orderby]: "asc" }); // sort the result ascendinly
      } else {
        orders = await Order.find({
          [searchby]: { $regex: search, $options: "i" },
        })
          .populate("status")
          .populate({
            path: "items",
            populate: {
              path: "product",
              model: "Product",
            },
          })
          .populate({
            path: "client",
            populate: {
                path: "image",
                model: "Image"
            }
          })
          .collation({ locale: "en", strength: 2 }) // make the search case insensitive
          .sort({ [orderby]: "asc" }); // sort the result ascendinly
      }
    } else {
      orders = await Order.find()
        .populate("status")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
          },
        })
        .populate({
          path: "client",
          populate: {
              path: "image",
              model: "Image"
          }
        })
        .sort({ [orderby]: "asc" }); // sort the result ascendinly
    }
        
    const total = orders.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    limit ? (orders = orders.slice(offset, offset + limit)) : "";
    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        orders,
        total,
        pages,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          lang.something_wrong + " " + lang.fetching_data + ". " + error.message
        )
      );
  }
};

const ordersByProduct = async (req, res) => {
  const { product } = req;
  try {
    const orders = await Order.find({
      items: { $elemMatch: { product: product } },
    })
      .populate("status")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });
    return res
      .status(200)
      .json(response("success", "Orders fetched successfully.", orders));
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          "Something went wrong while fetching orders. Try again later."
        )
      );
  }
};
const ordersByClient = async (req, res) => {
  const { client } = req;
  try {
    const orders = await Order.find({ client: client })
      .populate("status")
      .populate({
        path: "items",
        populate: {
          path: "product",
          model: "Product",
        },
      });
    return res
      .status(200)
      .json(response("success", "Orders fetched successfully.", orders));
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          "Something went wrong while fetching orders. Try again later."
        )
      );
  }
};

const remove = async (req, res) => {
  try {
    const order = req.order;
    await Order.deleteOne({ _id: order._id });
    return res
      .status(200)
      .json(response("success", "Order deleted successfully."));
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          "Something went wrong while deleting order. Try again later."
        )
      );
  }
};

const create = async (req, res) => {
  const fakeOrders = [];
  let statusIds = await Status.find({}); // You should replace this with a valid ObjectId from your database
  statusIds = statusIds.map((status) => status._id);
  let productsIds = await Product.find({}); // You should replace this with a valid ObjectId from your database
  productsIds = productsIds.map((product) => product._id);

  let fakeItems = [];
  for (let j = 0; j < 3; j++) {
    // You can adjust the number of items you want
    const fakeItem = new Item({
      amount: faker.number.int({ min: 1, max: 1000 }),
      product: productsIds[Math.floor(Math.random * productsIds.length)], // You should replace this with a valid ObjectId from your database
      quantity: faker.number.int({ min: 1, max: 10 }),
    });
    fakeItems.push(fakeItem);
  }
  fakeItems = await Item.insertMany(fakeItems);
  fakeItems = fakeItems.map((item) => item._id);

  const order = await Order({
    transaction_id: faker.string.alpha(10),
    paid: faker.datatype.boolean(),
    amount: faker.number.int({ min: 1, max: 1000 }),
    status: statusIds[Math.floor(Math.random * statusIds.length)], // You should replace this with a valid ObjectId from your database
    client: "6522e4d4d0cee50b1e9cc0bb", // You should replace this with a valid ObjectId from your database
    items: fakeItems,
  });
    await order.save();
  return res
    .status(200)
    .json(response("success", "Orders created successfully.", order));
};

export { orderById, list, ordersByProduct, remove, ordersByClient, create };
