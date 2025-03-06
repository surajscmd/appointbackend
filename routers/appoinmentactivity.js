const express = require("express");
const AppointmentSlot = require("../models/appointmentslot");
const { adminAuth } = require("../auth/auth");
const apointmentactivityRouter = express.Router();

apointmentactivityRouter.get("/appointments/everything", adminAuth, async (req, res) => {
  try {
    const { slotType, slotDate } = req.query;
    let filter = {};

    // Filter by slotType if provided
    if (slotType) {
      filter.slotType = slotType;
    }

    // Filter by slotDate if provided

    if (slotDate) {
      
    }
    console.log(filter)
    // Fetch appointments from DB
    const appointments = await AppointmentSlot.find(filter).populate(
      "members",
      "name email phone"
    );

    res.status(200).json({
      message: "Appointments fetched successfully",
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
});

apointmentactivityRouter.delete("/appointments/slot/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const admin = req.admin; // Authenticated admin from middleware

        // Only superadmin can delete a slot
        if (admin.role !== "superadmin") {
            return res.status(403).json({ message: "Unauthorized! Only superadmin can delete slots." });
        }

        // Find and delete the appointment slot
        const deletedSlot = await AppointmentSlot.findByIdAndDelete(id);

        if (!deletedSlot) {
            return res.status(404).json({ message: "Slot not found!" });
        }

        res.status(200).json({ message: "Appointment slot deleted successfully!", deletedSlot });
    } catch (error) {
        res.status(500).json({ message: "Error deleting appointment slot", error: error.message });
    }
});


apointmentactivityRouter.delete("/appointments/:slotId/members/:userId", adminAuth, async (req, res) => {
    try {
        const { slotId, userId } = req.params;
        const admin = req.admin; // Authenticated admin from middleware

        // Only superadmin or admin can remove members
        if (!["superadmin", "admin"].includes(admin.role)) {
            return res.status(403).json({ message: "Unauthorized! Only superadmin or admin can remove members from slots." });
        }

        // Find the appointment slot
        const slot = await AppointmentSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found!" });
        }

        // Check if the member exists in the slot
        const memberIndex = slot.members.findIndex(member => member.toString() === userId);
        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found in this slot!" });
        }

        // Remove the member from the slot
        slot.members.splice(memberIndex, 1);
        slot.bookingCount = slot.members.length; // Update booking count
        await slot.save();

        res.status(200).json({ message: "Member removed successfully from the slot", updatedSlot: slot });
    } catch (error) {
        res.status(500).json({ message: "Error removing member from slot", error: error.message });
    }
});

module.exports = apointmentactivityRouter;
