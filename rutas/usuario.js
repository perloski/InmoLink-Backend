import { Router } from "express";
import passport from "passport";
import { setAuthCookie, generateToken } from "../servicios/servicioAuth.js";

const router = Router();

const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "") + "/";

// Inicia login redirige a Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google vuelve a esta ruta
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: CLIENT_URL + "login",
  }),
  (req, res) => {
    // Generar token JWT y establecer cookie
    const token = generateToken(req.user);
    setAuthCookie(res, token);
    
    // Redirigir al Frontend con autenticación establecida
    res.redirect(CLIENT_URL + "auth/google/callback");
  }
);

//  Obtener usuario logueado
router.get("/user", (req, res) => {
  if (!req.user) return res.json({ logged: false });

  return res.json({
    logged: true,
    user: req.user,
  });
});

//  Logout
router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect(CLIENT_URL + "login");
});

export default router;
