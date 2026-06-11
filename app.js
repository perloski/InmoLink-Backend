import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import { connectDB } from "./config/config.js";
import { configureGoogleOAuth } from "./controladores/google.js";
import authRoutes from "./rutas/authenticacion.js";
import usuarioRoutes from "./rutas/usuario.js";
import propiedadesRoutes from "./rutas/propiedades.js";
import filtrosRoutes from "./rutas/filtros.js";
import reservationRoutes from "./rutas/reservation.routes.js";
import adminRoutes from "./rutas/admin.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

connectDB();
configureGoogleOAuth();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_KEY || "supersecreto",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", usuarioRoutes);
app.use("/api", authRoutes);
app.use("/properties", propiedadesRoutes);
app.use("/filtros", filtrosRoutes);
app.use("/reservation", reservationRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
});
