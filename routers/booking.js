const express = require("express");
const User = require("../models/user");
const AppointmentSlot = require("../models/appointmentslot");
const BookingRouter = express.Router();
BookingRouter.post(
  "/booking/appointment/:slotType/:slotDate",
  async (req, res) => {
    try {
      let { name, email, phone } = req.body;
      let { slotType, slotDate } = req.params;
      // console.log("Received:", slotType, slotDate);
      // ✅ 1. Validate slotDate and convert to Date object
      if (!slotDate || isNaN(Date.parse(slotDate))) {
        return res.status(400).json({ error: "Invalid or missing slotDate" });
      }
      slotDate = new Date(slotDate); // Convert to Date object
      slotDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
      const startOfDay = slotDate.toISOString();
      const endOfDay = new Date(slotDate.getTime() + 86400000).toISOString();
      // console.log("Formatted slotDate:", startOfDay, endOfDay);
      // ✅ 2. Check if appointment slot exists
      const appointmentSlot = await AppointmentSlot.findOne({
        slotType,
        slotDate: { $gte: startOfDay, $lt: endOfDay }, // Query for full day
      });
      if (!appointmentSlot) {
        return res.status(404).json({ error: "Appointment slot not found" });
      }
      // ✅ 3. Check if slot is full
      if (appointmentSlot.bookingCount >= appointmentSlot.maxLimit) {
        return res.status(400).json({ error: "Slot is fully booked" });
      }
      // ✅ 4. Find or create the user (avoid duplicates)
      let user = await User.findOne({ name, email, phone });
      if (!user) {
        user = new User({ name, email, phone });
        await user.save();
      }
      // ✅ 1. Check if user already booked this specific slot
      if (appointmentSlot.members.includes(user._id)) {
        return res
          .status(400)
          .json({ error: "You have already booked this slot" });
      }
      // ✅ 2. Check if user has booked any other slot on the same date
      const existingBooking = await AppointmentSlot.findOne({
        slotDate: {
          $gte: slotDate,
          $lt: new Date(slotDate.getTime() + 86400000), // Same day range
        },
        members: user._id, // User already booked in another slot
      });
      if (existingBooking) {
        return res
          .status(400)
          .json({ error: "You have already booked another slot on this date" });
      }
      // ✅ 6. Add user to the slot and update booking count
      appointmentSlot.members.push(user._id);
      appointmentSlot.bookingCount += 1; // Increase the booking count
      await appointmentSlot.save();

      return res.status(200).json({
        message: "Appointment booked successfully",
        user,
        slot: appointmentSlot,
      });
    } catch (error) {
      return res.status(500).json({ error: "Server error: " + error.message });
    }
  }
);

BookingRouter.get("/booking/appointment/token", async (req, res) => {
    try {
        const { phone, email, slotDate } = req.query;
        
        if (!slotDate || (!phone && !email)) {
            return res.status(400).json({ error: "Please provide slotDate and either phone or email" });
        }

        // Convert slotDate to UTC midnight
        const date = new Date(slotDate);
        date.setUTCHours(0, 0, 0, 0);

        // Find user by phone or email
        const user = await User.findOne({ $or: [{ phone }, { email }] });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the appointment slot
        const appointmentSlot = await AppointmentSlot.findOne({
            slotDate: {
                $gte: date,
                $lt: new Date(date.getTime() + 86400000), // Same day range
            },
            members: user._id, // Check if user is in this slot
        }).populate("members", "phone email name"); // Populate members to determine token number

        if (!appointmentSlot) {
            return res.status(404).json({ error: "No appointment found for this user on this date" });
        }

        // Find the token number (position in the members array)
        const tokenNumber = appointmentSlot.members.findIndex(member => member._id.equals(user._id)) + 1;

        res.status(200).json({
            message: "Token number retrieved successfully",
            user: { name: user.name, phone: user.phone, email: user.email },
            slotDate: appointmentSlot.slotDate,
            slotType: appointmentSlot.slotType,
            tokenNumber
        });

    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
});
BookingRouter.get("/booking/avilable/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Convert date to start of day
    const queryDate = new Date(date);
    queryDate.setUTCHours(2, 0, 0, 0);
    
    const startOfDay = queryDate; // Midnight (00:00:00.000)
    const endOfDay = new Date(queryDate.getTime() + 86400000); // Next day's midnight
    // Find slots for the given date where bookingCount < maxLimit
    const slots = await AppointmentSlot.find({
      slotDate: { $gte: startOfDay, $lt: endOfDay },
      $expr: { $lt: ["$bookingCount", "$maxLimit"] }, // Exclude fully booked slots
    }).select("slotType -_id");

    // Extract unique slot types
    const slotTypes = [...new Set(slots.map(slot => slot.slotType))];

    res.json({ date, availableSlotTypes: slotTypes });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = BookingRouter;
