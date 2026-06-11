import dotenv from 'dotenv';
dotenv.config();
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // 

// Servicio que crea o valida un usuario con email/password
export const servicioAuth = async ({ email, password }) => {
    let user = await User.findOne({ email });
    const isNewUser = !user;
    
    // Si el usuario no existe, crear uno nuevo
    if (!user) {
        // HASHEAR LA CONTRASEÑA antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user = new User({
            email,
            password: hashedPassword, // Guardar la contraseña hasheada
            name: email.split('@')[0]
        });
        await user.save();
    } else {
        // Si el usuario existe, VERIFICAR la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Contraseña incorrecta");
        }
    }
    
    return { user, isNewUser };
}

export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET no está definida en las variables de entorno.");
    }

    return jwt.sign(
        { id: user._id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

export const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 3600000 // 1 hora
    });
};

export const setAuthResponse = (res, user, isNewUser = false) => {
    const token = generateToken(user);
    setAuthCookie(res, token); 

    return res.json({
        msg: isNewUser ? 'Usuario registrado correctamente' : 'Login exitoso',
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            rol: user.rol
        }
    });
};