const { Router } = require("express");
const {
  register,
  login,
  genrateAccessToken,
  logout,
} = require("../controller/user.controllers");
const checkAdminAuthUser = require("../middleware/admin.superadmin.middleware");
const checkAuthUser = require("../middleware/auth.middleware");

const superadminrouter = Router();

superadminrouter.route("/register").post(register);
superadminrouter.route("/login").post(login);
superadminrouter.route("/access-token").post(genrateAccessToken);

// private routes --- auth routes
superadminrouter
  .route("/logout")
  .post(checkAuthUser, checkAdminAuthUser, logout);

module.exports = superadminrouter;
