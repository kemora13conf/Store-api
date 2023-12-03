import Permissions from "../../Models/Permissions.js";
import Settings from "../../Models/Settings.js";
import { response } from "../../utils.js";

const permissionsList = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_edit_settings())
    return res.status(401).json(response("no_permission", lang.no_permission));

  try {
    const permissions = await Permissions.find();
    res
      .status(200)
      .json(response("success", lang.data_fetched_successfully, permissions));
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

const general_settings = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_edit_settings())
    return res.status(401).json(response("no_permission", lang.no_permission));

  try {
    const settings = await Settings.findOne({ _id: currentUser.settings._id}).select("theme language currency")
    res
      .status(200)
      .json(response("success", lang.data_fetched_successfully, settings));
  }
  catch (error) {
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
}

function getKey(word, keys, values){
  const index = values.indexOf(word);
  return keys[index];
}
const update_general_settings = async (req, res) => {
  const { lang, currentUser } = req;
  if (!currentUser.can_edit_settings())
    return res.status(401).json(response("no_permission", lang.no_permission));

  try {
    const { theme, language, currency } = req.body;
    const settings = await Settings.findOne({ _id: currentUser.settings._id})
    const langKeys = Object.keys(lang);
    const langValues = Object.values(lang);
    settings.theme = getKey(theme, langKeys, langValues) || "light";
    settings.language = getKey(language, langKeys, langValues)?.charAt(0).toUpperCase() + getKey(language, langKeys, langValues)?.slice(1) || "English";
    settings.currency = currency;
    await settings.save();
    res
      .status(200)
      .json(response("success", lang.data_updated_successfully, settings));
  }
  catch (error) {
    res
      .status(400)
      .json(
        response(
          "error",
          `${lang.something_wrong} ${lang.updating} ${lang.data}!`,
          error
        )
      );
  }
}

export { permissionsList, general_settings, update_general_settings };