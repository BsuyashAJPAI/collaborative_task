// src/modules/auth/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        (req as any).user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};
