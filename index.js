require("dotenv").config();
const { app } = require("./src/app.js");
const { PORT } = require("./src/constant.js");
const { bdConnect } = require("./src/db/db.connection.js");

bdConnect()
  .then(() => {
    // use auth---

    app.listen(PORT || 8080, () => {
      console.log(`Server is running at PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    throw error;
  });
