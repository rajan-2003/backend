const express = require("express");
const router = express.Router();
const userRouter=require("../controllers/user");

router.use("/user",userRouter);

// router.get("/",function(req,res){
//     res.json({mssg:"inside index route in routes folder"})
// })

module.exports = router