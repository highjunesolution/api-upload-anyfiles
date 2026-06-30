// Step 1 Import package
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Step 4 Use Middleware
const cors = require("cors");
const {
  morganLogger,
  morganConsole,
} = require("./src/middlewares/morgan.middleware");

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morganConsole);
app.use(morganLogger);

// Step 3 Routing
const fs = require("fs");
fs.readdirSync("./src/routes").map((item) => {
  app.use("/api/", require(`./src/routes/${item}`));
});
// Step 2 Start server
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
