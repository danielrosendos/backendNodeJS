import { getRepository } from 'typeorm';
import { hash } from 'bcryptjs';

import { request } from 'express';
import User from '../models/User';
import CodeForgotPass from '../models/CodeForgotPass';
import Mail from '../lib/Mail';

interface Request {
  email: string;
}

interface RequestCode {
  code: string;
  password: string;
  confirmPassword: string;
}

interface Response {
  message: string;
}

class ForgotPasswordService {
  public async execute({ email }: Request): Promise<Response> {
    const userRepository = getRepository(User);

    const checkUserExists = await userRepository.findOne({
      where: { email },
    });

    if (!checkUserExists) {
      throw new Error('Email não Encontrado');
    }

    const codeForgotPassRepository = getRepository(CodeForgotPass);

    const codesForUser = await codeForgotPassRepository.find({
      where: { user_id: checkUserExists.id, status: true },
    });

    if (codesForUser) {
      codesForUser.map(codeUser => {
        return codeForgotPassRepository.update(codeUser.id, { status: false });
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const codeForgotPass = codeForgotPassRepository.create({
      user_id: checkUserExists.id,
      code,
    });

    await codeForgotPassRepository.save(codeForgotPass);

    await Mail.sendMail({
      to: `${checkUserExists.name} <${checkUserExists.email}>`,
      subject: 'Código Troca de Senha',
      template: 'codeforgotpass',
      context: {
        user: checkUserExists.name,
        code,
      },
    });

    request.user = {
      id: checkUserExists.id,
    };

    const message = 'Código de Verificação Enviado por e-mail';

    return { message };
  }

  public async changePassword({
    code,
    password,
    confirmPassword,
  }: RequestCode): Promise<Response> {
    if (!request.user) {
      throw new Error('Reenvier o código de Mudança de Senha');
    }

    const { id: user_id } = request.user;

    const codeForgotPassRepository = getRepository(CodeForgotPass);

    const findCodeUser = await codeForgotPassRepository.findOne({
      where: {
        user_id,
        code,
        status: true,
      },
    });

    if (!findCodeUser) {
      throw new Error('Código Inválido');
    }

    if (password !== confirmPassword) {
      throw new Error('Senhas não Conferem');
    }

    const regexValidatePass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!regexValidatePass.test(password)) {
      throw new Error(
        'Senha Deve Conter 1 Letra Minúscula, 1 Maiúscula, 1 Caractere Especial e ao menos 8 Digitos',
      );
    }

    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('Usuário Inválido');
    }

    const hashedPassword = await hash(password, 8);

    userRepository.update(user.id, { password: hashedPassword });

    codeForgotPassRepository.update(findCodeUser.id, { status: false });

    const message = 'Senha Alterada Com Sucesso';

    return { message };
  }
}

export default ForgotPasswordService;
