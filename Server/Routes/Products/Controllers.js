import multer, { diskStorage } from "multer";
import path from "path";
import Product from "../../Models/Product.js";
import Category from "../../Models/Category.js";
import { httpException, isInArray, response } from "../../utils.js";
import Image from "../../Models/Image.js";

const productById = async (req, res, next, id) => {
  const { lang } = req;
  try {
    const product = await Product.findOne({ _id: id })
      .populate("gallery")
      .populate("client")
      .populate("category", "name");

    if (!product)
      return res
        .status(404)
        .json(response("error", lang.product + " " + lang.not_found + "!"));
    req.product = product;
    next();
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          lang.something_wrong +
            " " +
            lang.fetching +
            " " +
            lang.product +
            ". " +
            lang.try_again_later +
            " " +
            error.message
        )
      );
  }
};
const sortByCategory = (products) => {
  const categories = [];
  products.forEach((product) => {
    if (!categories.includes(product.category.name)) {
      categories.push(product.category.name);
    }
  });
  categories.sort();
  let sortedProducts = categories.map((category) => {
    return products.filter((product) => product.category.name == category);
  });
  sortedProducts = sortedProducts.flat();
  return sortedProducts;
};
const list = async (req, res) => {
  const { lang } = req;
  let { search, searchby, orderby, page, limit } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  searchby = searchby ? searchby.toLocaleLowerCase() : "all";
  orderby = orderby ? orderby.toLocaleLowerCase() : "name";
  try {
    let products = [];
    if (search) {
      if (searchby == "all") {
        if (orderby == "category") {
          products = await Product.find({
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          })
            .populate("gallery")
            .populate("client")
            .populate("category", "name");

          // also search by category
          let catProducts = await Product.find({})
            .populate("gallery")
            .populate("client")
            .populate("category", "name");
          catProducts = catProducts.filter((product) =>
            product.category.name.includes(search)
          );
          products = [...products, ...catProducts];
          products = sortByCategory(products);
        } else {
          products = await Product.find({
            $or: [
              { name: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          })
            .populate("gallery")
            .populate("client")
            .populate("category", "name")
            .collation({ locale: "en", strength: 2 }) // make the search case insensitive
            .sort({ [orderby]: "asc" }); // sort the result ascendinly
          // also search by category
          let catProducts = await Product.find({})
            .populate("gallery")
            .populate("client")
            .populate("category", "name")
            .collation({ locale: "en", strength: 2 }) // make the search case insensitive
            .sort({ [orderby]: "asc" }); // sort the result ascendinly
          catProducts = catProducts.filter((product) =>
            product.category.name.includes(search)
          );
          products = [...products, ...catProducts];
        }
      } else {
        if (searchby == "price" || searchby == "quantity") {
          // if the search by is price or quantity
          if (orderby == "category") {
            products = await Product.find({ [searchby]: search })
              .populate("gallery")
              .populate("client")
              .populate("category", "name");
            products = sortByCategory(products);
          } else {
            products = await Product.find({ [searchby]: search })
              .populate("gallery")
              .populate("client")
              .populate("category", "name")
              .collation({ locale: "en", strength: 2 }) // make the search case insensitive
              .sort({ [orderby]: "asc" }); // sort the result ascendinly
          }
        } else if (searchby == "category") {
          // if the search by is category
          if (orderby == "category") {
            products = await Product.find({})
              .populate("gallery")
              .populate("client")
              .populate("category", "name");
            products = products.filter((product) =>
              product.category.name.includes(search)
            );
            products = sortByCategory(products);
          } else {
            products = await Product.find({})
              .populate("gallery")
              .populate("client")
              .populate("category", "name")
              .collation({ locale: "en", strength: 2 }) // make the search case insensitive
              .sort({ [orderby]: "asc" }); // sort the result ascendinly
            products = products.filter((product) =>
              product.category.name.includes(search)
            );
          }
        } else {
          // if the search by is name or description
          products = await Product.find({
            [searchby]: { $regex: search, $options: "i" },
          });
        }
      }
    } else {
      if (orderby == "category") {
        products = await Product.find({ quantity: { $ne: 0 } })
          .populate("gallery")
          .populate("client")
          .populate("category", "name");
        products = sortByCategory(products);
      } else {
        products = await Product.find()
          .populate("gallery")
          .populate("client")
          .populate("category", "name")
          .collation({ locale: "en", strength: 2 }) // make the search case insensitive
          .sort({ [orderby]: "asc" }); // sort the result ascendinly
      }
    }

    // make sure that each item of the products array is unique
    let tempProducts = [];
    products.forEach((product) => {
      let flag = false;
      tempProducts.forEach((tempProduct) => {
        if (String(tempProduct._id) == String(product._id)) {
          flag = true;
        }
      });
      if (!flag) {
        tempProducts.push(product);
      }
    });
    products = tempProducts;
    // pagination
    const total = products.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    limit ? (products = products.slice(offset, offset + limit)) : "";
    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        products,
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
          lang.something_wrong +
            " " +
            lang.fetching +
            " " +
            lang.products +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), "Public/Images"));
  },
  filename: function (req, file, cb) {
    const { images } = req;
    const ALLOWEDEXT = ["png", "jpg", "jpeg", "webp"];

    // separating the name from the extension.
    const nameArr = file.originalname.split("."); // array: [name, ext]
    const ext = nameArr[nameArr.length - 1]; // extension

    // checking the allowed filetypes
    if (!isInArray(ext.toLocaleLowerCase(), ALLOWEDEXT)) {
      const error = response(
        "file",
        req.lang.file_format_error +
          ". " +
          req.lang.allowed_file_types +
          ": " +
          ALLOWEDEXT.join(", ")
      );
      return cb(new httpException(JSON.stringify(error)), false);
    }

    const fileName = "Products-" + Date.now() + "." + ext;
    if (fileName) req.images = [...images, fileName];
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

const verifyInputs = async (req, res, next) => {
  const { lang } = req;
  const { name, description, price, quantity, category } = req.body;
  const { images } = req;
  if (!name) return res.status(400).json(response("name", lang.field_required));
  if (!description)
    return res.status(400).json(response("description", lang.field_required));
  if (!price)
    return res.status(400).json(response("price", lang.field_required));
  if (!quantity)
    return res.status(400).json(response("quantity", lang.field_required));
  if (!category)
    return res.status(400).json(response("category", lang.field_required));

  // check the category by name
  const catName = await Category.findOne({ name: category });
  if (!catName) {
    return res
      .status(400)
      .json(response("category", lang.choose_valid_category));
  } else {
    req.body.category = catName._id;
  }

  if (name.length < 3)
    return res.status(400).json(response("name", lang.field_length));
  if (description.length < 3)
    return res.status(400).json(response("description", lang.field_length));
  if (price <= 0)
    return res.status(400).json(response("price", lang.invalid_price));
  if (quantity <= 0)
    return res.status(400).json(response("quantity", lang.invalid_quantity));
  next();
};
const create = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_create_product()) return res.status(401).json(response('error', lang.no_permission))

  try {
    const { name, description, price, quantity, category } = req.body;
    const { fileError, images } = req;

    // checking that there is nothing wrong with uploading files
    if (fileError != undefined) {
      return res.status(400).json(fileError);
    }
    const imagesArr = images.map((image) => {
      return {
        name: image,
        src: `/assets/Images/${image}`,
        client: req.currentUser._id,
      };
    });
    let IMAGES = await Image.insertMany(imagesArr);
    IMAGES = IMAGES.map((image) => image._id);
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      category,
      gallery: IMAGES,
    });
    console.log(product);
    console.log(category);
    res
      .status(200)
      .json(
        response(
          "success",
          lang.product + " " + lang.created + " " + lang.successfully + ".",
          product
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
          lang.something_wrong +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};

const verifyUpdateInputs = async (req, res, next) => {
  const { name, description, price, quantity, category } = req.body;
  if (!name) return res.status(400).json(response("name", lang.field_required));
  if (!description)
    return res.status(400).json(response("description", lang.field_required));
  if (!price)
    return res.status(400).json(response("price", lang.field_required));
  if (!quantity)
    return res.status(400).json(response("quantity", lang.field_required));
  if (!category)
    return res.status(400).json(response("category", lang.field_required));

  // check the category by name
  const catName = await Category.findOne({ name: category });
  if (!catName) {
    return res
      .status(400)
      .json(response("category", lang.choose_valid_category));
  } else {
    req.body.category = catName._id;
  }

  if (name.length < 3)
    return res.status(400).json(response("name", lang.field_length));
  if (description.length < 3)
    return res.status(400).json(response("description", lang.field_length));
  if (price <= 0)
    return res.status(400).json(response("price", lang.invalid_price));
  if (quantity <= 0)
    return res.status(400).json(response("quantity", lang.invalid_quantity));
  next();
};
const update = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_edit_product()) return res.status(401).json(response('error', lang.no_permission))

  try {
    const { name, description, price, quantity, category, remove } = req.body;
    const { product, images } = req;
    let IMAGES = [];
    if (images.length != 0) {
      const imagesArr = images.map((image) => {
        return {
          name: image,
          src: `/assets/Images/${image}`,
          client: req.currentUser._id,
        };
      });
      IMAGES = await Image.insertMany(imagesArr);
      IMAGES = IMAGES.map((image) => image._id);
    }
    const updated_product = await Product.findOne({ _id: product._id });
    if (typeof remove != undefined) {
      if (typeof remove == "string") {
        const arr = remove.split(",");
        arr.forEach(async (id) => {
          updated_product.gallery = updated_product.gallery.filter(
            (image) => String(image._id) != String(id)
          );
        });
      }
    }
    updated_product.name = name;
    updated_product.description = description;
    updated_product.price = price;
    updated_product.quantity = quantity;
    updated_product.category = category;
    updated_product.gallery = [...updated_product.gallery, ...IMAGES];
    await updated_product.save();
    await updated_product.populate("gallery");
    await updated_product.populate("client");
    await updated_product.populate("category", "name");
    res
      .status(200)
      .json(
        response(
          "success",
          lang.product + " " + lang.updated + " " + lang.successfully + "!",
          updated_product
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
            lang.something_wrong +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};

const remove = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_delete_product()) return res.status(401).json(response('error', lang.no_permission))
  try {
    const { product } = req;
    await product.deleteOne({ _id: product._id });
    res.status(200).json(
        response(
            "success",
            lang.product + " " + lang.deleted + " " + lang.successfully + "!",
        )
    );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
            lang.something_wrong +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};

const deleteMultiple = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_delete_product()) return res.status(401).json(response('error', lang.no_permission))
  try {
    const { ids } = req.body;
    console.log(ids);
    const products = await Product.deleteMany({ _id: { $in: ids } });
    res.status(200).json(
        response(
            "success",
            lang.products + " " + lang.deleted + " " + lang.successfully + "!",
        )
    );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
            lang.something_wrong +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};
// change state
const changeState = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_edit_product()) return res.status(401).json(response('error', lang.no_permission))
  
  try {
    const { state } = req.body;
    const { product } = req;
    product.enabled = state;
    await product.save();
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.product} ${state ? lang.enabled : lang.disabled} ${lang.successfully}!`,
          product
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
            lang.something_wrong +
            ". " +
            lang.try_again_later +
            "! " +
            error.message
        )
      );
  }
};

export {
  productById,
  list,
  upload,
  verifyInputs,
  create,
  verifyUpdateInputs,
  update,
  remove,
  deleteMultiple,
  changeState,
};
