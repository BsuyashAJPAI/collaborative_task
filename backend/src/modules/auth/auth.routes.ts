// src/modules/auth/auth.routes.ts
import express from "express";
import { AuthController } from "./auth.controller"; // Import the class

const router = express.Router();

// Map the routes to the controller methods
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/taskform", AuthController.login);
export default router;