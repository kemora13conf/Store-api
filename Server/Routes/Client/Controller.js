import { httpException, isInArray, response } from "../../utils.js";
import Client from "../../Models/Client.js";
import multer from "multer";
import path from "path";
import Permissions from "../../Models/Permissions.js";
import Settings from "../../Models/Settings.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), "Public/Clients-images"));
  },
  filename: function (req, file, cb) {
    const { lang } = req;
    const ALLOWEDEXT = ["png", "jpg", "jpeg", "webp"];

    // separating the name from the extension.
    const nameArr = file.originalname.split("."); // array: [name, ext]
    const ext = nameArr[nameArr.length - 1]; // extension

    // checking the allowed filetypes
    if (!isInArray(ext.toLocaleLowerCase(), ALLOWEDEXT)) {
      const error = response(
        "file",
        lang.file_format_error +
          ". " +
          lang.allowed_file_types +
          ": " +
          ALLOWEDEXT.join(", ")
      );
      return cb(new httpException(JSON.stringify(error)), false);
    }

    const fileName = "Clients-" + Date.now() + "." + ext;
    req.body.image = fileName;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

const clientById = async (req, res, next, clientId) => {
  const { lang } = req;
  try {
    const client = await Client.findById(clientId);
    if (!client || client.email == "abdelghani@gmail.com")
      return res
        .status(400)
        .json(response("error", lang.client + " " + lang.not_found + "!"));
    client.password = null;
    client.salt = null;
    req.client = client;
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

const list = async (req, res) => {
  const { lang } = req;
  let { search, searchby, orderby, page, limit } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  searchby = searchby ? searchby.toLocaleLowerCase() : "all";
  orderby = orderby ? orderby.toLocaleLowerCase() : "fullname";

  try {
    let clients = [];
    if (search) {
      if (searchby == "all") {
        clients = await Client.find({
          $or: [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
          email: {$ne: "abdelghani@gmail.com"}
        });
      } else {
        clients = await Client.find({
          [searchby]: { $regex: search, $options: "i" },
          email: {$ne: "abdelghani@gmail.com"}
        });
      }
    } else {
      clients = await Client.find({email: {$ne: "abdelghani@gmail.com"}});
    }
    if (orderby == "fullname") {
      clients.sort((a, b) => {
        if (a.fullname < b.fullname) return -1;
        if (a.fullname > b.fullname) return 1;
        return 0;
      });
    } else if (orderby == "email") {
      clients.sort((a, b) => {
        if (a.email < b.email) return -1;
        if (a.email > b.email) return 1;
        return 0;
      });
    } else if (orderby == "phone") {
      clients.sort((a, b) => {
        if (a.phone < b.phone) return -1;
        if (a.phone > b.phone) return 1;
        return 0;
      });
    }

    const total = clients.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    limit ? (clients = clients.slice(offset, offset + limit)) : "";
    res.status(200).json(
      response("success", lang.data_fetched_successfully, {
        clients,
        total,
        pages,
      })
    );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          "Something Went wrong while fetching user. Try agin later. " +
            err.message
        )
      );
  }
};

function isEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const verifyInputs = async (req, res, next) => {
  const { lang } = req;
  const { fullname, email, phone } = req.body;
  if (!fullname)
    return res.status(400).json(response("fullname", lang.field_required));
  if (!email)
    return res.status(400).json(response("email", lang.field_required));
  if (!phone)
    return res.status(400).json(response("phone", lang.field_required));

  if (fullname.length < 3 || fullname.length > 60)
    return res.status(400).json(response("fullname", lang.field_length));
  if (phone.length < 9 || phone.length > 20)
    return res.status(400).json(response("phone", lang.invalid_phone));
  if (!isEmail(email))
    return res.status(400).json(response("email", lang.invalid_email));
  const client = await Client.findOne({ email });
  if (client) return res.status(400).json(response("email", lang.taken_email));
  next();
};
const create = async (req, res) => {
  const { lang, currentUser } = req;
  console.log(req.currentUser);
  if (!currentUser.can_create_client())
    return res.status(401).json(response("error", lang.no_permission));
  try {
    // generating passowrd
    let password = Math.random().toString(36).slice(-8);
    password = 'secret'
    req.body.password = password;
    // setting the permissions
    if(req.role == 1){
      const permissionsIds = req.body.permissions.split(",");
      const permissions = await Permissions.find({
        _id: { $in: permissionsIds },
      });
      req.body.permissions = permissions;
    }else
      req.body.permissions = [];
    // creating the client
    const client = await new Client(req.body);
    await client.save();
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.new} ${lang.account} ${lang.created} ${lang.successfully}`,
          client
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.creating} ${lang.account}. ${lang.try_again_later}. ${err.message}`
        )
      );
  }
};
const verifyUPdateInputs = async (req, res, next) => {
  const { lang } = req;
  const { fullname, email, phone } = req.body;
  if (!fullname)
    return res.status(400).json(response("fullname", lang.field_required));
  if (!email)
    return res.status(400).json(response("email", lang.field_required));
  if (!phone)
    return res.status(400).json(response("phone", lang.field_required));
  if (fullname.length < 3 || fullname.length > 20)
    return res.status(400).json(response("fullname", lang.field_length));
  if (!isEmail(email))
    return res.status(400).json(response("email", lang.invalid_email));
  if (phone.length < 9 || phone.length > 60)
    return res.status(400).json(response("phone", lang.invalid_phone));
  if (req.client.email != email) {
    const client = await Client.findOne({ email });
    if (client)
      return res.status(400).json(response("email", lang.taken_email));
  }
  next();
};
const update = async (req, res) => {
  const { lang, currentUser } = req;
  // if (!currentUser.can_edit_client())
  //   return res.status(401).json(response("error", lang.no_permission));
  if (req.body.image == "null") delete req.body.image;
  try {

    // setting the permissions
    if(req.body.role == 1){
      const permissionsIds = req.body.permissions.length < 1 ? req.body.permissions = [] : req.body.permissions.split(",");
      const permissions = await Permissions.find({
        _id: { $in: permissionsIds },
      });
      req.body.permissions = permissions;
    }else
      delete req.body.permissions;
    // updating the client
    const client = await Client.findOneAndUpdate(
      { _id: req.client._id },
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.account} ${lang.updated} ${lang.successfully}`,
          client
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.updating} ${lang.account}. ${lang.try_again_later}. ${err.message}`
        )
      );
  }
};

const client = async (req, res) => {
  const { lang } = req;
  return res
    .status(200)
    .json(
      response(
        "success",
        `${lang.client} ${lang.fetched} ${lang.successfully}`,
        req.client
      )
    );
};
const updateTheme = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_edit_client())
    return res.status(401).json(response("error", lang.no_permission));
  try {
    const settings = await Settings.findOneAndUpdate({ _id: currentUser.settings }, { theme: req.body.theme }, { new: true });
    res
      .status(200)
      .json(
        response("success", `${lang.theme} ${lang.updated}!`, settings.theme)
      );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.updating} ${lang.theme}. ${lang.try_again_later}.`
        )
      );
    console.log(err.message);
  }
};
const updateLanguage = async (req, res) => {
  const { lang, currentUser } = req;
  if(!currentUser.can_edit_client())
    return res.status(401).json(response("error", lang.no_permission));
  try {
    const settings = await Settings.findOneAndUpdate({ _id: currentUser.settings }, { language: req.body.language }, { new: true });
    res
      .status(200)
      .json(response("success", `${lang.language} ${lang.updated} ${lang.successfully}!`, settings.language));
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.updating} ${lang.language}. ${lang.try_again_later}.`
        )
      );
  }
};
// delete client
const remove = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_delete_client())
    return res.status(401).json(response("error", lang.no_permission));
  try {
    const client = await Client.findOne({ _id: req.client._id });
    if (client){
      if(client.role == 1)
        return res.status(401).json(response("error", lang.deleting+' '+lang.admin+' '+lang.not_allowed));
      else
        await client.remove();
    }else{
      return res.status(401).json(response("error", lang.client + " " + lang.not_found + "!"));
    }
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.client} ${lang.deleted} ${lang.successfully}`
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.deleting} ${lang.client}. ${lang.try_again_later}.`
        )
      );
      console.log(err.message);
  }
}
// delete multiple clients
const deleteMultiple = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_delete_client())
    return res.status(401).json(response("error", lang.no_permission));
  try {
    const { ids } = req.body;
    const clients = await Client.find({ _id: { $in: ids } });
    if (clients.length < 1)
      return res.status(401).json(response("error", lang.clients + " " + lang.not_found + "!"));
    for (let i = 0; i < clients.length; i++) {
      if(clients[i].role == 1)
        return res.status(401).json(response("error", lang.deleting+' '+lang.admin+' '+lang.not_allowed));
    }
    await Client.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json(
        response(
          "success",
          `${lang.clients} ${lang.deleted} ${lang.successfully}`
        )
      );
  } catch (err) {
    res
      .status(500)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.deleting} ${lang.clients}. ${lang.try_again_later}.`
        )
      );
  }
}


export {
  clientById,
  list,
  create,
  verifyInputs,
  upload,
  update,
  verifyUPdateInputs,
  client,
  updateTheme,
  updateLanguage,
  remove,
  deleteMultiple
};
