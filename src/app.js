const express = require("express");
var cors = require('cors')
const connectDB = require("../config/database");
const bodyParser = require("body-parser");
const cookieparser = require('cookie-parser');
require("dotenv").config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.42.249:7777"], 
  credentials: true, 
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieparser())

// Routes
const bookingRouter = require("../routers/booking");
const appointmentRouter = require("../routers/appointment");
const authRouter = require("../routers/autharization");
const adminactivityRouter  = require("../routers/adminactivity");
const apointmentactivityRouter  = require("../routers/appoinmentactivity");
const analyticsRouter  = require("../routers/analytics");
app.use("/", bookingRouter);
app.use("/", appointmentRouter);
app.use("/", authRouter);
app.use("/", adminactivityRouter );
app.use("/", apointmentactivityRouter);
app.use("/", analyticsRouter);
// Start Server

connectDB()
  .then(() => {
    console.log("database connected sucessfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("database cannot be connected " + ":" + err);
  });
