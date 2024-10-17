const { User } = require("../models/user.models");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getAllUser = asyncHandler(async (req, res) => {
  let { page, limit } = req.query;

  // Convert to integers if page and limit are provided, else leave them undefined
  page = page ? parseInt(page) : undefined;
  limit = limit ? parseInt(limit) : undefined;

  const query = { userType: "user" };
  const projection = { password: 0, userType: 0, otp: 0, isProfileComplete: 0 };

  // If page and limit are provided, apply pagination, otherwise return all data
  let getalluser;
  if (page && limit) {
    const skip = (page - 1) * limit;
    getalluser = await User.find(query, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } else {
    getalluser = await User.find(query, projection).sort({ createdAt: -1 });
  }

  const totalUsers = await User.countDocuments(query);
  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        page: page || 1,
        totalPages: limit ? Math.ceil(totalUsers / limit) : 1,
        users: getalluser,
      },
      "Get all users successfully"
    )
  );
});

module.exports = {
  getAllUser,
};
