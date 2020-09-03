import { Router } from 'express';

import AuthenticateUserService from '../services/AuthenticateUserService';

const sessionsRouter = Router();

sessionsRouter.post('/', async (request, response) => {
  try {
    const { email, password } = request.body;

    const authenticateUser = new AuthenticateUserService();

    const { message, token } = await authenticateUser.execute({
      email,
      password,
    });

    return response.json({ message, data: token });
  } catch (err) {
    return response.status(400).json({ message: err.message, data: [] });
  }
});

export default sessionsRouter;
