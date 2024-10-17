const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { CORS_ORIGINE } = require("./constant");
const errorHandler = require("./middleware/errorHandler.middleware");
const app = express();

/**
 * CORS
 */
// const corsOptions = {
//   origin: (origin, callback) => {
//     callback(null, true);
//   },
//   // credentials: true,
//   // optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

app.use(cors());

/**
 * Requset body  parsing middleware should be above any other middleware that needs to access the request body.
 */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // support encoded bodies

/**
 * Serve static  files from the `public` folder.
 */
app.use(express.static("public"));

/**
 * cookie parser
 */
app.use(cookieParser());

// Crone Jobs
// const reminderEmail = require("./cronjob/ReminderEmail");
// reminderEmail();

/**
 * Routes Import
 */
const userrouter = require("./Routes/user.routes");
const superadminrouter = require("./Routes/superadmin.routes");
const adminrouter = require("./Routes/admin.routes");

/**
 * Routes definations in the application
 */

app.use("/api/v1/users", userrouter);
app.use("/api/v1/admin", adminrouter);
app.use("/api/v1/superadmin", superadminrouter);

app.use("/", (req, res) => {
  res.status(200).send(`<h1> Woo! Hoo! </h1>`);
});

app.use("*", (req, res) => {
  res.status(404).end({
    message: "404 Not Found!",
  });
});

app.use(errorHandler);

module.exports = { app };
