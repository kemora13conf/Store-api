import Client from "../../Models/Client.js";
import Category from "../../Models/Category.js";
import Order from "../../Models/Order.js";
import Product from "../../Models/Product.js";
import { response } from "../../utils.js";

const total = async (req, res) => {
  const { lang } = req;
  try {
    const categories = await Category.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const clients = await Client.countDocuments();

    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        "categories": categories,
        "products": products,
        "orders": orders,
        "clients": clients,
      })
    );
  } catch (error) {
    res
      .status(400)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.fetching} ${lang.data}!`,
          error
        )
      );
  }
};
const order_per_month = async (req, res) => {
  let { lang, year } = req;
  
  try {
    let orders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          total: 1,
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);
    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        orders,
      })
    );
  } catch (error) {
    res
      .status(400)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.fetching} ${lang.data}!`,
          error
        )
      );
  }
};

export { total, order_per_month };
