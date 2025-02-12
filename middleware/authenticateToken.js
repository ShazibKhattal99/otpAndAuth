import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Authorization header
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

export default authenticateToken;
