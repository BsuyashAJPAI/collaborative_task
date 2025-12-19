// src/modules/auth/auth.service.ts
import { prisma } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput, LoginInput } from "./auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export class AuthService {
    static async register(data: RegisterInput) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: { ...data, password: hashedPassword },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

        // Remove password before returning
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    static async login(data: LoginInput) {
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(data.password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

        // Remove password before returning
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}