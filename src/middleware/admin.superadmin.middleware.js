const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const checkAdminAuthUser = asyncHandler(async function (req, res, next) {
  const { userType } = req.auth;
  if (!["admin", "administrator"].includes(userType)) {
    throw new ApiError(401, "You are not authorized to access this resource");
  }
  next();
});

module.exports = checkAdminAuthUser;
