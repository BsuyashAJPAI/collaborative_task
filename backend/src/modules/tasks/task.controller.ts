// src/modules/tasks/task.controller.ts
import { Request, Response } from "express";
import { TaskService } from "./task.service";
import { CreateTaskDto, UpdateTaskDto } from "./task.dto";

export class TaskController {
    static async createTask(req: Request, res: Response) {
        try {
            const data = CreateTaskDto.parse(req.body);
            const creatorId = (req as any).user.id;
            const task = await TaskService.createTask(data, creatorId);
            res.status(201).json(task);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    static async getTasks(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const tasks = await TaskService.getTasksForUser(userId);
            res.json(tasks);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    static async updateTask(req: Request, res: Response) {
        try {
            const data = UpdateTaskDto.parse(req.body);
            const taskId = req.params.id;
            const task = await TaskService.updateTask(taskId, data);
            res.json(task);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }

    static async deleteTask(req: Request, res: Response) {
        try {
            const taskId = req.params.id;
            await TaskService.deleteTask(taskId);
            res.json({ message: "Task deleted" });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
}
