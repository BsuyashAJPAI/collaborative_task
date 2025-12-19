// src/modules/auth/auth.dto.ts
import { z } from "zod";

// User Registration
export const RegisterDto = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

// User Login
export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// TypeScript types inferred automatically
export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
