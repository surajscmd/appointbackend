const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const adminAuth = async (req,res,next)=>{
try{
const { token } = req.cookies;
if (!token) {
    return res.status(401).send("Please login");
}
const decodedObject = await jwt.verify(token, process.env.JWT_SECRET,);
const { _id } = decodedObject;
// console.log("Logged in user is: " + _id);
const admin = await Admin.findById(_id); 
if (!admin) {
    throw new Error("Admin does not exist");
}
req.admin = admin;
next();
}
catch (error) {
    res.status(400).send("Error retrieving user profile: " + error.message);
}
};

module.exports = {
    adminAuth
}