import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

import TasksService from '../services/TasksService';

const tasksRouter = Router();

tasksRouter.use(ensureAuthenticated);

tasksRouter.get('/', async (request, response) => {
  try {
    const { id } = request.user;

    const tasksService = new TasksService();

    const tasks = await tasksService.getAllTasks({ id });

    return response.json({
      message: 'Tarefas Encontradas',
      data: tasks,
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

tasksRouter.post('/', async (request, response) => {
  try {
    const { id } = request.user;

    const { title, description, date_task } = request.body;

    const tasksService = new TasksService();

    const tasks = await tasksService.createTasks({
      id,
      title,
      date_task,
      description,
    });

    return response.json({
      message: 'Tarefas Encontradas',
      data: tasks,
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

tasksRouter.delete('/', async (request, response) => {
  try {
    const { id } = request.body;

    const tasksService = new TasksService();

    const { message } = await tasksService.deleteTasks({
      id,
    });

    return response.json({
      message,
      data: [],
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

tasksRouter.put('/', async (request, response) => {
  try {
    const { id, title, description, date_task } = request.body;

    const tasksService = new TasksService();

    const { message } = await tasksService.updateTasks({
      id,
      title,
      description,
      date_task,
    });

    return response.json({
      message,
      data: [],
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

tasksRouter.get('/deletetasks', async (request, response) => {
  try {
    const { id } = request.user;

    const tasksService = new TasksService();

    const tasks = await tasksService.listDeleteTasks({
      id,
    });

    return response.json({
      message: '',
      data: tasks,
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

tasksRouter.post('/recoverytasks', async (request, response) => {
  try {
    const { id } = request.body;

    const tasksService = new TasksService();

    const { message } = await tasksService.recoverDeleteTask({
      id,
    });

    return response.json({
      message,
      data: [],
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

export default tasksRouter;
