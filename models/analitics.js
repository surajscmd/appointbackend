const mongoose = require("mongoose");
const AnalyticsSchema = new mongoose.Schema(
  {
    currentSlotname: {
      type: String,
      default: "",
      required: true,
      enum: {
        values: ["Morning", "Afternoon", "Evening", "Night", "Special"],
        message: `{VALUE} is incorrect status type`,
      },
    },
    currentToken: {
      type: Number, // Storing token as a number
      default: 0,
      required: true,
    },
  },
  { timestamps: true }
); 
// Adds createdAt & updatedAt
const Analytics = mongoose.model("Analytics", AnalyticsSchema);
module.exports = Analytics;
