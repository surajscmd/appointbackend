const express = require("express");
const AppointmentSlot = require("../models/appointmentslot");
const { adminAuth } = require("../auth/auth");
const Analytics = require("../models/analitics");
const analyticsRouter = express.Router();


analyticsRouter.get("/analytics/appointment/info",  adminAuth ,  async (req, res) => {
    try {
        // Get today's date in UTC and normalize time
        // Get today's date and normalize it
        let date = new Date(); // Current date
        date.setHours(2, 0, 0, 0); // Normalize to UTC midnight
        
        const startOfDay = date; // Start of the day in UTC
        const endOfDay = new Date(date.getTime() + 86400000); // End of the date in utc
         
        // console.log(startOfDay);
        // console.log(endOfDay);
        
        // Fetch slots for today
        const slots = await AppointmentSlot.find({
            slotDate: { $gte: startOfDay, $lt: endOfDay }
        });
        const totalAppointments =slots.map((data)=>data.members.length)
        .reduce((acc, curr) => acc + curr, 0);
        const totalSlots = slots.length;
        const slotsinfo = slots.map((slot) => {
            return {
                slotName: slot.slotType,
                slotTime: slot.slotDate,
                totalAppointments: slot.members.length,
                avilableSlots: slot.maxLimit - slot.bookingCount
            };
        });

        res.status(200).json({
            message: "Today's slots retrieved successfully",
            totalSlots: totalSlots,
            totalAppointments: totalAppointments,
            slotsinfo : slotsinfo,
        });
        
    } catch (error) {
        res.status(500).json({ message: "Error fetching slots", error: error.message });
    }
});

analyticsRouter.post("/analytics/update/current",  adminAuth , async (req, res) => {
    try {
        const { currentSlotname, currentToken } = req.body;

        if (!currentSlotname || currentToken === undefined) {
            return res.status(400).json({ message: "Both currentSlotname and currentToken are required" });
        }

        // Ensure only one document exists, update if found, otherwise create one
        const updatedAnalytics = await Analytics.findOneAndUpdate(
            {}, // Empty filter ensures it targets the only document
            { currentSlotname, currentToken }, // Update fields
            { new: true, upsert: true } // Create if not exists
        );

        res.status(200).json({ message: "Analytics updated successfully", data: updatedAnalytics });
    } catch (error) {
        res.status(500).json({ message: "Error updating analytics", error: error.message });
    }
});
analyticsRouter.get("/analytics/current", async (req, res) => {
    try {
      const analyticsData = await Analytics.find(); // Fetch all records
      res.status(200).json({ success: true, data: analyticsData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });


module.exports = analyticsRouter;