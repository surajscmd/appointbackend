const mongoose = require("mongoose");
var validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email addders:" + value);
        }
      },
    },
    phone: { type: String, required: true, unique: true },
  },
  { timestamps: true } // Adds `createdAt` & `updatedAt`
);

const User = mongoose.model("User", userSchema);
module.exports = User;
