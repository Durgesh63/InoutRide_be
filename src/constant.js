const BD_NAME = "test";
const DB_URI = process.env.DB_URI;

const CORS_ORIGINE = process.env.CORS_ORIGINE;

const PORT = process.env.PORT;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

module.exports = {
  BD_NAME,
  DB_URI,
  CORS_ORIGINE,
  PORT,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  OPTIONS,
  EMAIL,
  PASSWORD,
};
