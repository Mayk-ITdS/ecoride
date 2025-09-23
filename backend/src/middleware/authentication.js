import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Auth header reçu:", authHeader);
  console.log("Token extrait:", token);
  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expiré" });
    }
    return res.status(403).json({ error: "Token invalide" });
  }
};
export const isRole =
  (...allowed) =>
  (req, res, next) => {
    const roles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];
    if (roles.some((r) => allowed.includes(r))) return next();
    return res.status(403).json({ error: "Accès refusé" });
  };

export default { verifyToken, isRole };
