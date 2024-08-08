const dotenv=require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mainRoute = require("./routes/user.js");
const cors=require("cors");
const PORT =  3000;

app.use(cors());
app.use(express.json());

app.use("/api", mainRoute);

app.listen(PORT,()=>{console.log(`Server is runnig on ${PORT}`)})