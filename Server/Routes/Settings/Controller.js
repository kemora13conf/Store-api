import Permissions from "../../Models/Permissions.js";
import { response } from "../../utils.js";

const permissionsList = async (req, res) => {
  const { lang, currentUser } = req;
//   if (!currentUser.can_edit_settings())
//     return res.status(401).json(response("no_permission", lang.no_permission));

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

export { permissionsList };