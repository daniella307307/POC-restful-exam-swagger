const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(morgan("combined"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
const userRoute = require("./routes/user.route");
app.use("/api/users", userRoute);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware (log errors)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`App is running in development environment at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
