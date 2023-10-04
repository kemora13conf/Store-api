import { httpException, isInArray, response } from "../../utils.js";
import multer, { diskStorage } from "multer";
import path from "path";
import Image from "../../Models/Image.js";
import Category from "../../Models/Category.js";
import Product from "../../Models/Product.js";

const categoryById = async (req, res, next, id) => {
  const { lang } = req;
  try {
    const category = await Category.findOne({ _id: id })
      .populate("gallery")
      .populate("client", "fullname email phone image");
    if (!category)
      return res
        .status(404)
        .json(response("error", lang.category + " " + lang.not_found + "."));
    req.category = category;
    next();
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

const list = async (req, res) => {
  const { lang } = req;
  let { search, searchby, orderby, page, limit } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  searchby = searchby ? searchby.toLocaleLowerCase() : "all";
  orderby = orderby ? orderby.toLocaleLowerCase() : "name";

  try {
    let categories = [];
    if (search) {
      if (searchby == "all") {
        categories = await Category.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        })
          .populate("gallery")
          .populate("client", "fullname email phone image")
          .collation({ locale: "en", strength: 2 }) // make the search case insensitive
          .sort({ [orderby]: "asc" }); // sort the result ascendinly
      } else {
        categories = await Category.find({
          [searchby]: { $regex: search, $options: "i" },
        })
          .populate("gallery")
          .populate("client", "fullname email phone image")
          .collation({ locale: "en", strength: 2 }) // make the search case insensitive
          .sort({ [orderby]: "asc" }); // sort the result ascendinly
      }
    } else {
      categories = await Category.find({})
        .populate("gallery")
        .populate("client", "fullname email phone image")
        .collation({ locale: "en", strength: 2 }) // make the search case insensitive
        .sort({ [orderby]: "asc" }); // sort the result ascendinly
    }
    const total = categories.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    limit ? (categories = categories.slice(offset, offset + limit)) : "";
    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        categories,
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

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), "Public/Images"));
  },
  filename: function (req, file, cb) {
    const { lang } = req;
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

    const fileName = "Categories-" + Date.now() + "." + ext;
    if (fileName) req.images = [...images, fileName];
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

const verifyInputs = (req, res, next) => {
  const { name, title, description } = req.body;
  const { images, lang } = req;
  if (!name) return res.status(400).json(response("name", lang.field_required));
  if (!title)
    return res.status(400).json(response("title", lang.field_required));
  if (!description)
    return res.status(400).json(response("description", lang.field_required));
  if (images.length == 0)
    return res.status(400).json(response("file", lang.image_required));
  if (name.length < 3)
    return res.status(400).json(response("name", lang.field_length));
  if (title.length < 3)
    return res.status(400).json(response("title", lang.field_length));
  if (description.length < 3)
    return res.status(400).json(response("description", lang.field_length));
  next();
};
const create = async (req, res) => {
  try {
    const { name, title, description } = req.body;
    const { lang, images } = req;

    // check if the category name is already taken
    const catName = await Category.findOne({ name });
    if (catName) return res.status(400).json(response("name", lang.taken_name));

    // setling the uploaded images array
    const imagesArr = images.map((image) => {
      return {
        name: image,
        src: `/assets/Images/${image}`,
        client: req.currentUser._id,
      };
    });
    let IMAGES = await Image.insertMany(imagesArr);
    IMAGES = IMAGES.map((image) => image._id);
    const category = await Category.create({
      name,
      title,
      description,
      gallery: IMAGES,
      client: req.currentUser._id,
    });
    res
      .status(200)
      .json(
        response(
          "success",
          lang.category + " " + lang.created + " " + lang.successfully,
          category
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
            lang.creating_category +
            ". " +
            error.message
        )
      );
  }
};
const verifyUpdateInputs = (req, res, next) => {
  const { name, title, description } = req.body;
  const { lang } = req;
  if (!name) return res.status(400).json(response("name", lang.field_required));
  if (!title)
    return res.status(400).json(response("title", lang.field_required));
  if (!description)
    return res.status(400).json(response("description", lang.field_required));
  if (name.length < 3)
    return res.status(400).json(response("name", lang.field_length));
  if (title.length < 3)
    return res.status(400).json(response("title", lang.field_length));
  if (description.length < 3)
    return res.status(400).json(response("description", lang.field_length));
  next();
};
const update = async (req, res) => {
  const { lang } = req;
  try {
    let { name, title, description, remove } = req.body;
    const { category, images } = req;

    // check if the category name is already taken
    const catName = await Category.findOne({ name });
    if (catName)
      if (catName.name != category.name)
        return res.status(400).json(response("name", req.lang.taken_name));

    // setling the uploaded images array
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
    const updated_category = await Category.findOne({ _id: category._id });
    if (typeof remove != undefined) {
      if (typeof remove == "string") {
        const arr = remove.split(",");
        arr.forEach((imageId) => {
          updated_category.gallery = updated_category.gallery.filter(
            (image) => image != imageId
          );
        });
      }
    }

    // updating the category with the new data
    updated_category.name = name;
    updated_category.title = title;
    updated_category.description = description;
    updated_category.gallery = [...updated_category.gallery, ...IMAGES];

    await updated_category.populate("gallery");
    await updated_category.kind();
    await updated_category.save();
    res
      .status(200)
      .json(
        response(
          "success",
          lang.category + " " + lang.updated + " " + lang.successfully,
          updated_category
        )
      );
  } catch (error) {
    // this is beeing returned when something wrong happens
    res
      .status(500)
      .json(
        response(
          "error",
          lang.something_wrong +
            " " +
            lang.updating_category +
            ". " +
            error.message
        )
      );
  }
};

// delete category
const remove = async (req, res) => {
  const { lang } = req;
  try {
    const { category } = req;
    const products = await Product.find({ category: category._id }).kind();
    if (products.length != 0)
      return res
        .status(400)
        .json(response("error", lang.category_can_not_be_deleted));
    await Category.deleteOne({ _id: category._id });
    res.status(200).json(response("success", "Category is deleted!"));
  } catch (error) {
    res
    .status(500)
    .json(
      response(
        "error",
        lang.something_wrong +
          " " +
          lang.deleting_category +
          ". " +
          error.message
      )
    );
  }
};

// delete multiple categories
const deleteMultiple = async (req, res) => {
    const { lang } = req;
  try {
    const { ids } = req.body;
    const products = await Product.find({ category: { $in: ids } }).kind();
    if (products.length != 0)
      return res
        .status(400)
        .json(
          response(
            "error",
            lang.categories_can_not_be_deleted
          )
        );
    await Category.deleteMany({ _id: { $in: ids } });
    res.status(200).json(response("success", lang.categories+' '+lang.deleted+' '+lang.successfully+'!'));
  } catch (error) {
    res
      .status(500)
      .json(
        response(
          "error",
            lang.something_wrong +
            " " +
            lang.deleting_categories +
            ". " +
            error.message
        )
      );
  }
};

// change state
const changeState = async (req, res) => {
    const { lang } = req;
  try {
    const { state } = req.body;
    const { category } = req;
    category.enabled = state;
    await category.save();
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.category} ${state ? lang.enabled : lang.disabled} ${lang.successfully}!`,
          category
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
            lang.changing_state_of_category +
            ". " +
            error.message
        )
      );
  }
};

export {
  categoryById,
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
