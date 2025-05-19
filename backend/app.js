const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("combined"));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoute = require("./routes/user.route");
const slotRoutes = require("./routes/slot.route");
const booking = require('./routes/booking.route')
app.use("/api/users", userRoute);
app.use('/api/slots',slotRoutes)
app.use('/api/bookings',booking);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Sync DB and start server
const sequelize = require("./config/db.config");

// Sync & start server
sequelize.sync({ alter: true }) // or force: true for dev only
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('DB sync error:', err));
