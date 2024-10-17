const { Router } = require("express");
const {
  register,
  login,
  logout,
  genrateAccessToken,
  validateOtp,
  ResendOtp,
  forgetPasswordSendEmail,
  verifyForgetPasswordEmail,
  forgetPassword,
  updateProfile,
  getUserInfo,
  getProfileImage,
  UpdatePassword,
} = require("../controller/user.controllers");
const Upload = require("../middleware/multer.middleware");
const checkAuthUser = require("../middleware/auth.middleware");


const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");


const userrouter = Router();

const setuserType = (req, res, next) => {
  req.userType = "user";
  next();
};

// check url is user
const checkIsUser = asyncHandler(async function (req, res, next) {
  const { userType } = req.auth;
  if (!["user"].includes(userType)) {
    throw new ApiError(401, "You are not authorized to access this resource");
  }
  next();
});

// public routes
// user register -----
userrouter.route("/register").post(register);
userrouter.route("/otp-verify").post(validateOtp);
userrouter.route("/resend-otp").post(ResendOtp);
userrouter.route("/login").post(setuserType, login);
userrouter.route("/image/:imagelink").get(getProfileImage);

// forget password
userrouter.route("/forgetPassword/sendotp").post(forgetPasswordSendEmail);
userrouter.route("/forgetPassword/resendotp").post(forgetPasswordSendEmail);
userrouter.route("/forgetPassword/otp-verify").post(verifyForgetPasswordEmail);
userrouter.route("/createnewPassword").post(forgetPassword);


// user update
userrouter.route("/update").post(checkAuthUser, Upload.any(), updateProfile);
userrouter.route("/getUser").get(checkAuthUser, getUserInfo);

// update password
userrouter
  .route("/updatePassword")
  .put(checkAuthUser, checkIsUser, UpdatePassword);



userrouter.route("/access-token").post(genrateAccessToken);

// private routes --- auth routes
userrouter.route("/logout").post(checkAuthUser, logout);

module.exports = userrouter;


