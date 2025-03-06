// const mongoose = require("mongoose");
// const AppointmentSlot = require("./models/appointmentSlot"); // Adjust path if needed
// const cron = require("node-cron");

// // Schedule job to run every night at 12:00 AM
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const fiveDaysAgo = new Date();
//     fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

//     // Delete all old records
//     await AppointmentSlot.deleteMany({ slotDate: { $lt: fiveDaysAgo } });
//     console.log("✅ Old appointment slots cleaned up.");
//   } catch (error) {
//     console.error("❌ Error cleaning up old appointment slots:", error);
//   }
// });

// module.exports = cron;
