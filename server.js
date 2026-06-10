// Step 1 Import package
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 3000;

// Step 4 Use Middleware
const cors = require("cors");
const morgan = require("morgan");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
morgan.token("server-time", () => {
  return new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Bangkok",
  });
});

app.use(
  morgan(":server-time :remote-addr :method :url :status :response-time ms"),
);
app.use(
  cors({
    origin: "*",
  }),
);

// Step 3 Routing
const fs = require("fs");
fs.readdirSync("./src/routes").map((item) => {
  app.use("/api/", require(`./src/routes/${item}`));
});
// Step 2 Start server
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`),
);
