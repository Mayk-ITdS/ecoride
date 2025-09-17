import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "Token invalide" });
  }
};
export const isRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role === role) {
      next();
    } else {
      return res.status(403).json({ error: "Accès refusé" });
    }
  };
};
