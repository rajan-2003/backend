const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(403).json({ mssg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ mssg: "invalid token" ,errro:err});
  }
};

module.exports = authMiddleware;
