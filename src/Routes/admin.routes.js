const { Router } = require("express");
const {
  genrateAccessToken,
  logout,
  login,
  UpdatePassword,
} = require("../controller/user.controllers");
const checkAuthUser = require("../middleware/auth.middleware");
const checkAdminAuthUser = require("../middleware/admin.superadmin.middleware");
const { getAllUser } = require("../controller/admin.controllers");


const adminrouter = Router();

const userType = (req, res, next) => {
  req.userType = "admin";
  next();
};

adminrouter.route("/login").post(userType, login);
adminrouter.route("/access-token").post(genrateAccessToken);

adminrouter
  .route("/getallUser")
  .get(checkAuthUser, checkAdminAuthUser, getAllUser);


adminrouter
  .route("/updatePassword")
  .put(checkAuthUser, checkAdminAuthUser, UpdatePassword);

// private routes --- auth routes
adminrouter.route("/logout").post(checkAuthUser, checkAdminAuthUser, logout);

module.exports = adminrouter;
