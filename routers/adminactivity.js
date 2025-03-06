const express = require("express");
const Admin = require("../models/admin");
const { adminAuth } = require("../auth/auth");
const adminactivityRouter = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
adminactivityRouter.get("/administrator", adminAuth, async (req, res) => {
    try {
        const admin = req.admin;
        // Fetch all admins
        const admins = await Admin.find();

        // Check if admins exist
        if (!admins.length) {
            return res.status(404).json({ message: "No admin data found." });
        }
        //check if the user is an admin
        if (admin.role == "nonadmin") {
            return res.status(401).json({ message: "you are Unauthorized" });
        }

        res.status(200).json({ message: "All admin data fetched", data: admins });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

adminactivityRouter.delete("/admin/delete/:id", adminAuth, async (req, res) => {
    try {
        const admin = req.admin; // Authenticated admin (from middleware)
        const id = req.params.id;

        // Ensure only superadmins can delete admins
        if (admin.role !== "superadmin") {
            return res.status(401).json({ message: "You are Unauthorized" });
        }

        // Find and delete the admin
        const admindelete = await Admin.findByIdAndDelete(id);
        if (!admindelete) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: "Admin deleted successfully", deletedAdmin: admindelete });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
});
adminactivityRouter.put("/admin/changepassword", adminAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const admin = req.admin; // Authenticated admin from middleware

        // Validate request body
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new password are required" });
        }

        // Fetch admin from database
        const editadmin = await Admin.findById(admin._id);
        if (!editadmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if old password is correct using instance method
        const isPasswordValid = await editadmin.validatePassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        // Validate new password strength
        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ message: "New password must be strong (uppercase, lowercase, number, special character)" });
        }

        // Hash and save new password
        editadmin.password = await bcrypt.hash(newPassword, 10);
        await editadmin.save();

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
});
adminactivityRouter.put("/admin/edit/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params; // ID of the admin to be edited
        const { Name, emailId, role } = req.body;
        const admin = req.admin; // Authenticated admin from middleware

        // Ensure only superadmins can edit another admin's profile
        if (admin.role !== "superadmin") {
            return res.status(403).json({ message: "You are not authorized to edit profiles" });
        }

        // Fetch the admin to be updated
        const adminToEdit = await Admin.findById(id);
        if (!adminToEdit) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Update fields only if they are provided
        if (Name) adminToEdit.Name = Name;
        if (emailId) {
            if (!validator.isEmail(emailId)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            adminToEdit.emailId = emailId;
        }
        if (role) {
            const allowedRoles = ["superadmin", "admin", "nonadmin"];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }
            adminToEdit.role = role;
        }

        await adminToEdit.save();

        res.status(200).json({ message: "Admin profile updated successfully", updatedAdmin: adminToEdit });

    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});
adminactivityRouter.get("/admin/profile/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params; // ID of the admin to fetch
        const admin = req.admin; // Authenticated admin from middleware

        // Fetch admin from the database
        const adminProfile = await Admin.findById(id).select("-password"); // Exclude password
        if (!adminProfile) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // If the authenticated user is not a superadmin, they can only view their own profile
        if (admin.role !== "superadmin" && admin._id.toString() !== id) {
            return res.status(403).json({ message: "You are not authorized to view this profile" });
        }

        res.status(200).json({ message: "Admin profile fetched successfully", adminProfile });

    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});


module.exports = adminactivityRouter;