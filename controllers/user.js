const express = require("express");
const router = express.Router();
const userModel = require("../model/userModel");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");


// signup
router.post("/signup", async function (req, res) {
  try {
    const { name, email, password } = req.body;

    const newUser = new userModel({
      name,
      email,
      password,
    });

    await newUser.save();

    res.json({ mssg: "user created", newUser });
  } catch (e) {
    return res.status(500).json({
      mssg: "something went wrong , you either entered already used email or password is less than 5 char or name is not filled or some other error",
      error: e,
    });
  }
});


// signin
router.post("/signin", async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(403)
        .json({ mssg: "user with this email does not exist" });
    }

    if (password !== user.password) {
      return res.status(400).json({ mssg: "incorrect password" });
    }
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_SECRET);
    res.json({ mssg: "logged in", token: token });
  } catch (e) {
    return res.status(500).json({ mssg: "Something went wrong", error: e });
  }
});



// validtoken
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);
    const verified = jwt.verify(token, JWT_SECRET);

    if (!verified) return res.json(false);
    const user = await userModel.findById(verified.userId);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (e) {
    res
      .status(500)
      .json({ mssg: "token not valid or some other error ", error: e.message });
  }
});



// update
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Extract userId directly from req.userId
    const { newEmail, newPassword } = req.body;

    if (!newEmail && !newPassword) {
      return res
        .status(400)
        .json({ mssg: "New email and new password fields are empty" });
    }

    // Update email if provided
    if (newEmail) {
      try {
        // Check if the new email is already in use
        const existingUser = await userModel.findOne({ email: newEmail });
        if (existingUser) {
          return res.status(409).json({ mssg: "Email is already in use.updation failed" });
        }
        await userModel.findByIdAndUpdate(userId, { email: newEmail });
      } catch (e) {
        return res.status(409).json({
          mssg: "Email update failed",
          error: e.message,
        });
      }
    }

    // Update password if provided
    if (newPassword) {
      try {
        const user = await userModel.findById(userId);
        if (newPassword === user.password) {
          return res.json({
            mssg: "new password same as previous password.updation successfull",user
          });
        }
        await userModel.findByIdAndUpdate(userId, { password: newPassword });
      } catch (e) {
        return res.status(400).json({
          mssg: "Password update failed",
          error: e.message,
        });
      }
    }

    // Fetch the updated user details
    const updatedUser = await userModel.findById(userId);

    return res.json({ mssg: "Update successful", updatedUser });
  } catch (e) {
    return res.status(500).json({ mssg: "Update failed", error: e.message });
  }
});



// forgot-password
router.post("/forgot-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.userId;

   
    // Ensure newPassword is provided
    if (!newPassword) {
      return res.status(400).json({ mssg: "New password is required" });
    }

    const user = await userModel.findById(userId);
    if (newPassword === user.password) {
      return res.json({
        mssg: "new password same as previous pass, provide diff password",
      });
    }
    // Fetch the existing user

    // Update the user's password
    await userModel.findByIdAndUpdate(userId, { password: newPassword });

    // Fetch the updated user
    const upd = await userModel.findById(userId);

    return res.json({ mssg: "Password has been set successfully", prev, upd });
  } catch (e) {
    return res
      .status(500)
      .json({ mssg: "Something went wrong", error: e.message });
  }
});


// logout
router.post("/logout", authMiddleware, (req, res) => {
  return res.json({ mssg: "user logout sucessfull" });
});


// add favourite
router.post("/add-favourite",authMiddleware,async (req,res)=>{
  try{
    const userId = req.userId;
    const {doctorId} = req.body; 
    const exist = await userModel.findOne( { _id: userId, favorites: doctorId }  );

    if(exist){
      return res.json({mssg:"already added to favourite doctor"})
    }

    await userModel.findByIdAndUpdate( userId, { $addToSet: { favorites: doctorId } } )
    return res.json({mssg:"added to favourite doctor "});
  }
  catch(e){
    return res.json({mssg:"something went wrong",error:e});
  }
})


// remove favourite
router.post("/remove-favourite",authMiddleware,async(req,res)=>{
  try{

    const userId = req.userId;
    const {doctorId} = req.body; 
    const exist = await userModel.findOne( { _id: userId, favorites: doctorId }  );
    if(!exist){
      return res.json({mssg:"this doctor not exits in favourite doctor"})
    }
    await userModel.findByIdAndUpdate(userId,{ $pull: { favorites: doctorId } },{ new: true } )
    return res.json({mssg:"removed from favourite doctor"})
  }
  catch(e){
    return res.json({mssg:"something went wront",error:e});
  }
})


module.exports = router;
