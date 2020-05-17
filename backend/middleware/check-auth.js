const jwt = require("jsonwebtoken");

 const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // verify() gives us a decoded token
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    // add new fields to the request object and next() forwards this handled request, so any route tat has this middleware will be able to access this new information
    req.userData = {email: decodedToken.email, userId: decodedToken.userId}
    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};

module.exports = checkAuth;
