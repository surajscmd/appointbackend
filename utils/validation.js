const validator = require("validator");

const validateSignUpData = (req) => {
    const { Name, emailId, role, password } = req.body;
    
    if (!Name) {
        throw new Error("Name is not valid");
    }
    if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    }
    if (!role) {
        throw new Error("Role is required!");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password!");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailID", "photoUrl", "password", "gender", "about", "skills", "age"];
    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));
    return isEditAllowed;
 }
 

module.exports = {
  validateSignUpData,
  validateEditProfileData 
}