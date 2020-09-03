import { getRepository } from 'typeorm';
import { parse } from 'date-fns';
import { format } from 'date-fns-tz';

import { pt, enUS } from 'date-fns/locale';
import Tasks from '../models/Tasks';

interface Request {
  id: string;
}

interface Response {
  message: string;
}

interface RequestCreate {
  id: string;
  title: string;
  date_task: string;
  description?: string;
}

class TasksService {
  public async getAllTasks({ id }: Request): Promise<Tasks[]> {
    const tasksRepository = getRepository(Tasks);

    const getTasks = await tasksRepository.find({
      where: { user_id: id, status: true },
    });

    if (!getTasks.length) {
      throw new Error('Não existem tarefas vinculadas a este usuário');
    }

    getTasks.map(tasks => {
      tasks.date_task = format(tasks.date_task, 'dd/MM/yyyy', {
        locale: pt,
      });

      return tasks;
    });

    return getTasks;
  }

  public async createTasks({
    id,
    title,
    date_task,
    description,
  }: RequestCreate): Promise<Tasks> {
    const tasksRepository = getRepository(Tasks);

    const date = parse(date_task, 'dd/MM/yyyy', new Date(), {
      locale: enUS,
    });

    const tasks = tasksRepository.create({
      user_id: id,
      title,
      description,
      date_task: date,
    });

    await tasksRepository.save(tasks);

    return tasks;
  }

  public async deleteTasks({ id }: Request): Promise<Response> {
    const tasksRepository = getRepository(Tasks);

    const findTask = await tasksRepository.findOne({
      where: { id },
    });

    if (!findTask) {
      throw new Error('Tarefa não encotrada');
    }

    await tasksRepository.update(id, { status: false });

    const message = 'Tarefa Deletada Com Sucesso';

    return { message };
  }

  public async updateTasks({
    id,
    title,
    description,
    date_task,
  }: RequestCreate): Promise<Response> {
    const tasksRepository = getRepository(Tasks);

    const findTask = await tasksRepository.findOne({
      where: { id, status: true },
    });

    if (!findTask) {
      throw new Error('Tarefa não encotrada');
    }

    const date = parse(date_task, 'dd/MM/yyyy', new Date(), {
      locale: enUS,
    });

    await tasksRepository.update(id, {
      title,
      description,
      date_task: date,
    });

    const message = 'Tarefa Atualizada Com Sucesso';

    return { message };
  }

  public async listDeleteTasks({ id }: Request): Promise<Tasks[]> {
    const tasksRepository = getRepository(Tasks);

    const findTask = await tasksRepository.find({
      where: { user_id: id, status: false },
    });

    if (!findTask) {
      throw new Error('Não existem tarefas na lixeira');
    }

    findTask.map(tasks => {
      tasks.date_task = format(tasks.date_task, 'dd/MM/yyyy', {
        locale: pt,
      });

      return tasks;
    });

    return findTask;
  }

  public async recoverDeleteTask({ id }: Request): Promise<Response> {
    const tasksRepository = getRepository(Tasks);

    const findTask = await tasksRepository.findOne({
      where: { id, status: false },
    });

    if (!findTask) {
      throw new Error('Tarefa não existente');
    }

    await tasksRepository.update(id, { status: true });

    const message = 'Tarefa Recuperada com sucesso';

    return { message };
  }
}

export default TasksService;
