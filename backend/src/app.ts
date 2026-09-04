import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';
import router from './app/routes';
import path from 'path';
const app: Application = express();
app.set('trust proxy', 1);

const jsonParser = express.json();

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/v1/verify/webhook')) {
    return next();
  }

  return jsonParser(req, res, next);
});
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use('/api/v1', router);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); //this is to serve the uploaded files statically

app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!');
  res.render('index.ejs');
});

//this is the global error handler
app.use(globalErrorHandler);

// not found handler
app.use(notFound);

export default app;
