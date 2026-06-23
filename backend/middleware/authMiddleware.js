const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No authorization header" });
    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid authorization header" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
