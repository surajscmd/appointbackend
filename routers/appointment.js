const express = require("express");
const AppointmentSlot = require("../models/appointmentslot");
const { adminAuth } = require("../auth/auth");
const appointmentRouter = express.Router();

appointmentRouter.post(
  "/appointment/createtype",
  adminAuth,
  async (req, res) => {
    try {
      let { slotType, slotDate, maxLimit } = req.body;
      // console.log(slotDate + "8");

      // ✅ Validate required fields
      if (!slotType || !slotDate || !maxLimit) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // ✅ Ensure maxLimit is a valid number
      maxLimit = Number(maxLimit);
      if (isNaN(maxLimit) || maxLimit <= 0) {
        return res
          .status(400)
          .json({ error: "maxLimit must be a positive number" });
      }

      // ✅ Convert and validate slotDate
      slotDate = new Date(slotDate);
      if (isNaN(slotDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      slotDate.setDate(slotDate.getDate() + 1); // Add one day
      slotDate.setUTCHours(0, 0, 0, 0); // Normalize time
      // console.log(slotDate + "26");

      // ✅ Check if the slot already exists
      const existingSlot = await AppointmentSlot.findOne({
        slotType,
        slotDate,
      });
      if (existingSlot) {
        return res
          .status(400)
          .json({ error: "Appointment slot already exists" });
      }

      // console.log(slotDate);
      // ✅ Create and save the new appointment slot
      const newAppointmentSlot = new AppointmentSlot({
        slotType,
        slotDate,
        maxLimit,
      });
      await newAppointmentSlot.save();

      return res
        .status(201)
        .json({
          message: "Appointment slot created successfully",
          slot: newAppointmentSlot,
        });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error creating appointment slot: " + error.message });
    }
  }
);

appointmentRouter.get("/appointment/:slotDate", adminAuth, async (req, res) => {
  try {
    let { slotDate } = req.params;

    // Convert slotDate to a Date object and normalize it
    let date = new Date(slotDate);
    date.setUTCHours(2, 0, 0, 0); // Set time to midnight UTC

    // Define start and end of the selected day
    const startOfDay = date; // Midnight (00:00:00.000)
    const endOfDay = new Date(date.getTime() + 86400000); // Next day's midnight

    // Debugging logs
    // console.log("Start of Day:", startOfDay.toISOString());
    // console.log("End of Day:", endOfDay.toISOString());

    // Fetch all appointments within that day
    const appointments = await AppointmentSlot.find({
      slotDate: { $gte: startOfDay, $lt: endOfDay },
    }).populate("members", "createdAt phone name email");

    if (!appointments.length) {
      return res
        .status(404)
        .json({ message: "No appointments found for this date" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

module.exports = appointmentRouter;
