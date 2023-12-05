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

export { total };
