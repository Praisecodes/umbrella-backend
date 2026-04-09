import 'dotenv/config';
import express, { Request, Response } from 'express';
import { AuthRouter, ClientsRouter, OtpRouter, UserRouter } from './routes';
import AuthMiddleWare from './middlewares/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req: Request, _, next) => {
  const request = {
    path: req.path,
    headers: req.headers,
    ...(!!req.params && ({ params: req.params })),
    ...(!!req.body && ({ payload: { ...req.body } })),
  }
  console.log(JSON.stringify(request, null, 2));
  next();
});

app.get('/', (req: Request, res: Response) => {
  console.log("Hello From Umbrella");
});

app.use('/auth', AuthRouter);
app.use('/otp', OtpRouter);
app.use('/user', UserRouter);
app.use('/clients', AuthMiddleWare, ClientsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
