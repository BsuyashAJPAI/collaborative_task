// src/modules/tasks/task.routes.ts
import { Router } from "express";
import { TaskController } from "./task.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();

router.use(authMiddleware); // protect all routes

router.post("/", TaskController.createTask);
router.get("/", TaskController.getTasks);
router.patch("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
