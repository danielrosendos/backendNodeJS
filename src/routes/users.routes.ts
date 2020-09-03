import { Router } from 'express';

import CreateUserService from '../services/CreateUserService';
import ForgotPasswordService from '../services/ForgotPasswordService';

const usersRouter = Router();

usersRouter.post('/', async (request, response) => {
  try {
    const { name, email, password } = request.body;

    const createUser = new CreateUserService();

    const user = await createUser.execute({ name, email, password });

    delete user.password;

    return response.json({
      message: 'Usuário Criado Com Sucesso',
      data: user,
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

usersRouter.post('/forgotpassword', async (request, response) => {
  try {
    const { email } = request.body;

    const forgotPassword = new ForgotPasswordService();

    const { message } = await forgotPassword.execute({ email });

    return response.json({
      message,
      data: [],
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

usersRouter.put('/forgotpassword/changePassword', async (request, response) => {
  try {
    const { code, password, confirmPassword } = request.body;

    const forgotPassword = new ForgotPasswordService();

    const { message } = await forgotPassword.changePassword({
      code,
      password,
      confirmPassword,
    });

    return response.json({
      message,
      data: [],
    });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

export default usersRouter;
