const mongoose = require("mongoose");

const forgetPasswordInstance = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "10m",
  },
});

forgetPasswordInstance.methods.deleteOtp = async function (_id) {
  return await this.model("forgetpassword").deleteOne({ _id: _id });
};
forgetPasswordInstance.methods.deleteByUserID = async function (userId) {
  return await this.model("forgetpassword").deleteOne({ userId: userId });
};
forgetPasswordInstance.methods.getOtp = async function (userId) {
  return await this.model("forgetpassword").findOne({ userId: userId });
};
forgetPasswordInstance.methods.verifyOtp = async function (userId, otp) {
  return await this.model("forgetpassword").findOne({
    userId: userId,
    otp: otp,
  });
};
const ForgetPassword = mongoose.model("forgetpassword", forgetPasswordInstance);

module.exports = { ForgetPassword };
