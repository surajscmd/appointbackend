const mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const adminSchema = new mongoose.Schema({
    Name: {
        type: String,
        required:true,
    },
    emailId: {
        type:String,
        unique: true,
        lowercase:true,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Invalid email addders: "+ value);
            }
        }
    },
    password: {
        type:String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
             throw new Error("Enter the strong password "+ value);
            }
    }},
    role: {
        type: String,
        enum: ["superadmin", "admin", "nonadmin"], // Enforces allowed values
        default: "admin", // Default role
      },  
},{
    timestamps:true,
});

adminSchema.methods.getJWT = async function () {
  const admin = this;
  const token = await jwt.sign({_id : admin._id}, process.env.JWT_SECRET ,{
    expiresIn: "7d"
  });
  return token;
};

adminSchema.methods.validatePassword = async function (passwordInputByuser) {
    const admin = this;
    const passwordHash = admin.password
    const isPasswordValid = await bcrypt.compare(passwordInputByuser, passwordHash);
    return   isPasswordValid
}



const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;