const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const { adminAuth } = require("../auth/auth");
const authRouter = express.Router();

authRouter.post("/signup", adminAuth, async (req, res) =>{
    try {
        if (req.admin.role !== "superadmin") {
            return res.status(403).json({ message: "Only superadmins can create new admins" });
        }
    validateSignUpData(req);
    const {Name , emailId, role, password} = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new Admin({
        Name,
        emailId, 
        role,
        password:passwordHash,
    })
    
       const savedadmin = await admin.save();
    //    const token = await savedadmin.getJWT()
    //    res.cookie("token", token, {
    //        expires: new Date(Date.now()+ 8 * 3600000)
    //    });
    const { password: _, ...adminWithoutPassword } = savedadmin.toObject();

        res.json({message : "User Added succesfully", data: adminWithoutPassword});
    }
    catch (error) {
        res.status(400).send("Error saving the admin: " + error.message)
    }  
})

authRouter.post("/Login", async(req, res)=>{
    try {
        const {emailId, password} = req.body;
        const admin = await Admin.findOne({ emailId : emailId})
        if (!admin){
            throw new Error("EmailId id not present in DB");
        }
        const isPasswordValid = await admin.validatePassword(password);
        if (isPasswordValid) {
            const token = await admin.getJWT()
            res.cookie("token", token, {
                expires: new Date(Date.now()+ 8 * 3600000)
            });
            const { password: _, ...adminWithoutPassword } = admin.toObject();
            res.send(adminWithoutPassword)
        } else {
            throw new Error("Password is not correct");
        }
    }catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

authRouter.post("/Logout", async(req, res)=>{
  
    res.cookie("token", null , {
       expires: new Date(Date.now()),
    })
    res.send("logout succesfull");
})
authRouter.get("/admin/view", adminAuth , async(req, res) => {
    try {   
        const admin = req.admin 
        res.status(200).json({ message: "admin profile retrieved successfully", admin });
    } catch (error) {
        res.status(400).send("Error retrieving user profile: " + error.message);
    }
});
module.exports = authRouter;