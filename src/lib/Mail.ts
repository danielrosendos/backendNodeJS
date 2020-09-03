import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
// @ts-ignore
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  transporter: any;
  constructor() {
    const { host, port, secure, auth } = mailConfig;
    this.transporter = nodemailer.createTransport({
      // @ts-ignore
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      }),
    );
  }

  sendMail(message: { to: string; subject: string; template: string; context: { user: string; code: string; }; }) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
