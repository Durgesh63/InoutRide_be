const { OPTIONS, REFRESH_TOKEN_SECRET } = require("../constant");
const { ForgetPassword } = require("../models/forgetPassword.models");
const { RefreshToken } = require("../models/refreshToken.models");
const { User } = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const { checkVaoidEmail, generateOTP, otpTemplate } = require("../utils/utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// @desc Register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { email, password, language, termandConditions } = req.body;
  // check user is valid input
  if (
    [email, password, termandConditions, language].some(
      (field) => field?.trim() === ""
    ) ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // check user is exits
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (isUserExist) {
    throw new ApiError(409, "Another User already associated with this email.");
  }
  const genratedOtp = generateOTP();
  const EmailTemplate = otpTemplate(genratedOtp, language);
  // create user and save
  const user = new User({
    email,
    password,
    otp: genratedOtp,
    language,
    termandConditions,
  });

  const createdUser = await user.save();
  // remove value from user object before sending response
  createdUser.password = undefined;
  createdUser.isActive = undefined;
  createdUser.otp = undefined;

  // send Email
  sendEmail(createdUser.email, EmailTemplate, "OTP for Email Verification");

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

// @desc validate otp
// @access Public
const validateOtp = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  if (
    [email, otp].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  const user = await User.findOne({ email, otp });
  if (user) {
    user.otp = "Verified";
    user.isActive = true;
    await user.save();
    res
      .status(200)
      .json(new ApiResponse(200, "", "User verified Successfully"));
  } else {
    throw new ApiError(401, "User Verficiation failed");
  }
});

// @desc Login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check user is valid input
  if (
    [email, password].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // check user is exits
  const users = await User.findOne({ email: email });

  if (!users) {
    throw new ApiError(400, "Wrong username or password. Please try again");
  }
  // compare given password and hashed password
  const matchPassword = await users.isPasswordCorrect(password);
  if (!matchPassword) {
    throw new ApiError(401, "Wrong username or password. Please try again");
  }

  if (["admin"].includes(req.userType) && users.userType != "admin") {
    throw new ApiError(401, "Wrong username or password. Please try againt");
  }

  if (["user"].includes(req.userType) && users.userType != "user") {
    throw new ApiError(401, "Wrong username or password. Please try again");
  }
  if (!["admin"].includes(req.userType)) {
    if (!users.isActive) {
      const genratedOtp = generateOTP();
      const EmailTemplate = otpTemplate(genratedOtp, users.language || "eng");
      // const users = await User.findOne({ email: email });
      users.otp = genratedOtp;
      await users.save();
      sendEmail(email, EmailTemplate, "OTP for Email Verification");
      return res
        .status(207)
        .send(
          new ApiResponse(
            207,
            { isOtpVerify: false },
            "Please verify the OTP sent to your email."
          )
        );
    }
  }

  users.password = undefined;
  users.otp = undefined;

  // genrate refresh & access_token
  const accessToken = await users.createAccessToken();
  const refreshToken = await users.createRefreshToken();

  if (!accessToken && !refreshToken) {
    throw new ApiError(400, "Something went wrong Please try again.");
  }
  res
    .status(200)
    // .cookie("accessToken", accessToken, OPTIONS)
    // .cookie("refreshToken", refreshToken, OPTIONS)
    .send(
      new ApiResponse(
        200,
        { accessToken, refreshToken, isOtpVerify: true, users },
        "User logged in successfully"
      )
    );
});

// @desc resend otp
// @access Public
const ResendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (
    [email].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(409, "No user will associated with this email.");
  }
  if (isUserExist.isActive) {
    throw new ApiError(400, "User is verify with this email.");
  }
  const genratedOtp = generateOTP();
  const EmailTemplate = otpTemplate(genratedOtp, isUserExist.language);

  isUserExist.otp = genratedOtp;
  await isUserExist.save();
  sendEmail(isUserExist.email, EmailTemplate, "OTP for Email Verification");

  res.status(200).json(new ApiResponse(200, "", "OTP send Successfully"));
});

// @desc genrate access token from  refress token
// @access Public
const genrateAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, REFRESH_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  const refreshTokenInstances = new RefreshToken();
  const isRefreshToken = await refreshTokenInstances.getRefreshToken(
    decodedToken._id
  );
  if (!isRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await User.findById(decodedToken._id);
  const accessToken = await user.createAccessToken();

  if (!accessToken) {
    throw new ApiError(500, "Something went wrong in token generation.");
  }
  res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", token, OPTIONS)
    .send(
      new ApiResponse(
        200,
        { accessToken, refreshToken: token },
        "Access token generated successfully."
      )
    );
});

// @desc logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  const { _id, token_id } = req.auth;
  // revoke the tokens
  const refreshTokenInstances = new RefreshToken();
  await refreshTokenInstances.deleteToken(token_id);
  res
    .status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .send(
      new ApiResponse(200, {}, `Logged out from all devices Successfully.`)
    );
});

// @desc forget password send email
// @access Public
const forgetPasswordSendEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (
    [email].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(409, "User not associated with this email.");
  }

  // forget password
  const forgetPasswordIns = new ForgetPassword();
  await forgetPasswordIns.deleteByUserID(isUserExist._id);

  // genrate otp
  const genratedOtps = generateOTP();
  const forgetPasswordInstance = new ForgetPassword({
    otp: genratedOtps,
    userId: isUserExist._id,
  });
  const EmailTemplate = `We received a request to reset your password. \n

Your one-time password (OTP) for resetting your password is: ${genratedOtps} \n

This OTP will expire in 10 minutes, so please use it promptly to reset your password. \n

If you did not request this password reset, please ignore this email. \n`;
  await forgetPasswordInstance.save();
  sendEmail(email, EmailTemplate, "Password Reset");

  res
    .status(200)
    .json(new ApiResponse(200, "", "Forget password email send Successfully"));
});

// @desc user verify
// @access Public
const verifyForgetPasswordEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (
    [email, otp].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // user is exist
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(409, "User not associated with this email.");
  }

  // is otp match
  const forgetPasswordIns = new ForgetPassword();
  const isOtp = await forgetPasswordIns.verifyOtp(isUserExist._id, otp);
  if (!isOtp) {
    throw new ApiError(400, "Invalid Otp.");
  }

  res.status(200).json(new ApiResponse(200, "", "User verified Successfully"));
});

// @desc forget password
// @access Public
const forgetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (
    [email, password].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // user is exist
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(409, "User not associated with this email.");
  }

  // check otp
  const forgetPasswordIns = new ForgetPassword();
  const isOtp = await forgetPasswordIns.getOtp(isUserExist._id);
  if (!isOtp) {
    throw new ApiError(400, "Otp is expired.");
  }

  // user password
  const user = await User.findOneAndUpdate(
    {
      email: email,
    },
    { password: await bcrypt.hash(password, 10) },
    { new: true }
  );
  if (!user) {
    throw new ApiError(400, "getting error in update user");
  }
  await forgetPasswordIns.deleteByUserID(isUserExist._id);

  res
    .status(200)
    .json(new ApiResponse(200, user, "Password updated successfully."));
});

//@desc update current logged in user
//@access Private
const updateProfile = asyncHandler(async (req, res) => {
  const userID = req.auth?._id;
  if (!userID) {
    throw new ApiError(400, "userID not find");
  }

  const {
    firstname,
    lastname,
    dob,
    gender,
    maritalStatus,
    country,
    contactDetails,
  } = req.body;
  if (
    [
      firstname,
      lastname,
      dob,
      gender,
      maritalStatus,
      country,
      contactDetails,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  let updateData;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const userDetails = await User.findById(userID);
    if (userDetails.profileImg) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "temp",
        userDetails.profileImg
      );
      fs.unlink(filePath, (err, res) => {
        if (err) {
          return;
        }
      });
    }
    updateData = {
      ...req.body,
      contactDetails: JSON.parse(contactDetails),
      profileImg: req.files[0].filename,
      isProfileComplete: true,
    };
  } else {
    updateData = {
      ...req.body,
      contactDetails: JSON.parse(contactDetails),
    };
  }
  const user = await User.findByIdAndUpdate(userID, updateData, { new: true });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  res.status(200).json(new ApiResponse(200, user, "USer Update Successfully"));
});

//@desc Returning current logged in user
//@access Private
const getUserInfo = asyncHandler(async (req, res) => {
  const userID = req.auth?._id;
  if (!userID) {
    throw new ApiError(400, "userID not find");
  }

  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(409, "user not found.");
  }

  res.status(200).json(new ApiResponse(200, user, "USer Update Successfully"));
});

const getProfileImage = asyncHandler(async (req, res) => {
  const filename = req?.params?.imagelink;
  const filePath = path.join(__dirname, "..", "..", "public", "temp", filename);
  const fileExtension = path.extname(filename).toLowerCase();

  let contentType = "image/jpeg";
  if (fileExtension === ".png") {
    contentType = "image/png";
  } else if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
    contentType = "image/jpeg";
  } else if (fileExtension === ".gif") {
    contentType = "image/gif";
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", 'inline; filename="' + filename + '"');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("An error occurred while sending the file.");
    }
  });
});

// update Password
//@access Private
const UpdatePassword = asyncHandler(async (req, res) => {
  const userID = req.auth?._id;
  if (!userID) {
    throw new ApiError(400, "userID not find");
  }

  const { currentPassword = "", newPassword = "" } = req.body;

  if (!(currentPassword && newPassword)) {
    throw new ApiError(400, "All field are requred.");
  }

  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(403, "user not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect current Password.");
  }

  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, "", "User Password Update Successfully"));
});

module.exports = {
  register,
  login,
  updateProfile,
  logout,
  genrateAccessToken,
  forgetPasswordSendEmail,
  validateOtp,
  verifyForgetPasswordEmail,
  forgetPassword,
  ResendOtp,
  getUserInfo,
  getProfileImage,
  UpdatePassword,
};
