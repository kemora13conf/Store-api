import Order from "../../Models/Order.js";
import { response } from "../../utils.js";
import { faker } from "@faker-js/faker";
import Status from "../../Models/Status.js";
import Product from "../../Models/Product.js";
import Item from "../../Models/Item.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

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

async function generateInvoicePDF({ _id, amount, client, items }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set font and text
  page.drawText("Invoice", {
    x: 50,
    y: height - 50,
    font,
    fontSize: 30,
    color: rgb(0, 0, 0),
  });

  let yPosition = height - 100;

  // Iterate through items and add them to the PDF
  items.forEach((item) => {
    yPosition -= 20;
    page.drawText(
      `${item.product.name} - ${item.quantity} x $${item.product.price}`,
      { x: 50, y: yPosition, font, fontSize: 12, color: rgb(0, 0, 0) }
    );
  });

  yPosition -= 20;
  page.drawText(`Total Amount: $${amount}`, {
    x: 50,
    y: yPosition,
    font,
    fontSize: 12,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  const pdfNmae = `${_id}-${new Date().getTime()}-invoice.pdf`;
  const PdfPath = `Public/Invoices/${pdfNmae}`;
  fs.writeFileSync(PdfPath, pdfBytes);
  return pdfNmae;
}

const invoice = async (req, res) => {
  const { lang } = req;
  const { order } = req;
  try {
    const invoice = {
      _id: order._id,
      transaction_id: order.transaction_id,
      amount: order.amount,
      status: order.paid ? lang.paid : lang.unpaid,
      client: {
        fullname: order.client.fullname,
        email: order.client.email,
        image: order.client.image,
      },
      items: order.items.map((item) => {
        return {
          product: {
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
          amount: item.amount,
        };
      }),
    };
    const pdf = await generateInvoicePDF(invoice);
    return res
      .status(200)
      .json(response("success", lang.data_fetched_successfully, pdf));
  } catch (error) {
    console.log(error);
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

const list = async (req, res) => {
  const { lang } = req;
  let { orderby, page, limit } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  orderby = orderby ? orderby : lang.date;
  try {
    let orders = [];
    if (orderby === lang.amount) {
      orders = await Order.find()
        .populate("status")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
            populate: {
              path: "gallery",
              model: "Image",
            },
          },
        })
        .populate("client", "fullname image email")
        .sort({ amount: -1 });
    } else if (orderby === lang.date) {
      orders = await Order.find()
        .populate("status")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
            populate: {
              path: "gallery",
              model: "Image",
            },
          },
        })
        .populate("client", "fullname image email")
        .sort({ createdAt: -1 });
    } else if (orderby === lang.status) {
      orders = await Order.find()
        .populate("status")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
            populate: {
              path: "gallery",
              model: "Image",
            },
          },
        })
        .populate("client", "fullname image email");

      let statusOrder = await Status.find({}); // You should replace this with a valid ObjectId from your database
      statusOrder = statusOrder
        .map((status) => status.name)
        .sort((a, b) => a.localeCompare(b));

      const ordersArr = [];
      statusOrder.forEach((status) => {
        const order = orders.filter((order) => order.status.name === status);
        ordersArr.push(...order);
      });
      orders = ordersArr;
    } else {
      orders = await Order.find()
        .populate("status")
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
            populate: {
              path: "gallery",
              model: "Image",
            },
          },
        })
        .populate("client", "fullname image email");
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

const stateList = async (req, res) => {
  const { lang } = req;
  try {
    const states = await Status.find();
    return res
      .status(200)
      .json(response("success", lang.data_fetched_successfully, states));
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
      product: productsIds[Math.floor(Math.random() * productsIds.length)], // You should replace this with a valid ObjectId from your database
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
    status: statusIds[Math.floor(Math.random() * statusIds.length)], // You should replace this with a valid ObjectId from your database
    client: "654e378cbf5e6950b63c1830", // You should replace this with a valid ObjectId from your database
    items: fakeItems,
  });
  await order.save();
  return res
    .status(200)
    .json(response("success", "Orders created successfully.", order));
};

const update_status = async (req, res) => {
  const { order, lang, currentUser } = req;
  if (!currentUser.can_edit_order()) {
    return res.status(401).json(response("error", lang.no_permission));
  }
  const { status } = req.body;
  try {
    const statusId = await Status.findOne({ name: status });
    if (!statusId)
      return res.status(400).json(response("error", lang.status_not_found));
    const newOrder = await Order.findOneAndUpdate(
      { _id: order._id },
      { status: statusId },
      { new: true }
    ).populate("status");
    return res
      .status(200)
      .json(
        response(
          "success",
          `${lang.order} ${lang.updated} ${lang.successfully}`,
          newOrder
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          lang.something_wrong +
            " " +
            lang.updating +
            " " +
            lang.order +
            ". " +
            error.message
        )
      );
  }
};

const deleteMultiple = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_delete_order())
    return res.status(401).json(response("error", lang.no_permission));

  try {
    const { ids } = req.body;
    const orders = await Order.deleteMany({ _id: { $in: ids } });
    return res
      .status(200)
      .json(
        response(
          "success",
          `${lang.order} ${lang.deleted} ${lang.successfully}`,
          orders
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.deleting} ${lang.order}. ${error.message}`
        )
      );
  }
};

export {
  orderById,
  invoice,
  list,
  create,
  stateList,
  update_status,
  deleteMultiple,
};
