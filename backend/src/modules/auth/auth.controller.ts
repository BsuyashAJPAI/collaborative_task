import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./auth.dto";

export class AuthController {
    /**
     * Handles user registration.
     * Validates input using Zod DTO and calls AuthService.
     */
    static async register(req: Request, res: Response) {
        try {
            // 1. Validate the request body
            const data = RegisterDto.parse(req.body);

            // 2. Call service to handle DB logic
            const result = await AuthService.register(data);

            // 3. Return 201 Created
            res.status(201).json({
                message: "User registered successfully",
                user: result.user
            });
        } catch (err: any) {
            // Handle Zod validation errors or Service errors
            const errorMessage = err.errors
                ? err.errors[0].message
                : err.message || "Registration failed";

            res.status(400).json({ error: errorMessage });
        }
    }

    /**
     * Handles user login.
     * Returns token and user object for frontend localStorage.
     */
    static async login(req: Request, res: Response) {
        try {
            // 1. Validate the request body
            const data = LoginDto.parse(req.body);

            // 2. Call service to verify credentials and generate token
            const result = await AuthService.login(data);

            // 3. Return 200 OK with the token and user details
            // result should contain { token: string, user: { id: string, name: string, ... } }
            res.status(200).json(result);
        } catch (err: any) {
            const errorMessage = err.errors
                ? err.errors[0].message
                : err.message || "Invalid email or password";

            res.status(401).json({ error: errorMessage });
        }
    }
}