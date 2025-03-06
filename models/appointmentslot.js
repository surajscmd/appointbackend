const mongoose = require("mongoose");

const appointmentSlotSchema = new mongoose.Schema(
  {
    slotType: {
      type: String,
      required: true,
      enum: {
        values: ["Morning", "Afternoon", "Evening", "Night", "Special"],
        message: `{VALUE} is incorrect status type`,
      },
    },
    slotDate: {
      type: Date,
      required: true,
      set: (date) => new Date(date.setHours(0, 0, 0, 0)),
    }, // Stores appointment date & time
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the slot
    bookingCount: { type: Number, default: 0 }, // Track bookings
    maxLimit: { type: Number, default: 30 }, // Max limit per slot
  },
  { timestamps: true } // Automatically adds `createdAt` & `updatedAt`
);

/** 📌 Pre-save Middleware to Sort Members & Update Booking Count */
appointmentSlotSchema.pre("save", async function (next) {
  try {
    const appointmentSlot = this;
    if (appointmentSlot.members.length > 0) {
      // Populate members to get their createdAt field
      await appointmentSlot.populate(
        "members",
        "createdAt , phone , name ,email"
      );

      // Sort members by createdAt (earliest first)
      appointmentSlot.members.sort((a, b) => a.createdAt - b.createdAt);
    }

    // Check if members array length exceeds maxLimit
    if (this.members.length > this.maxLimit) {
      return next(new Error(`Cannot add more than ${this.maxLimit} members`));
    }
    // Update booking count based on members array length
    appointmentSlot.bookingCount = appointmentSlot.members.length;
    next(); // Continue saving
  } catch (error) {
    next(error); // Pass errors to Mongoose
  }
});
appointmentSlotSchema.index({ slotType: 1, slotDate: 1 });
const AppointmentSlot = mongoose.model(
  "AppointmentSlot",
  appointmentSlotSchema
);
module.exports = AppointmentSlot;
