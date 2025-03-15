// import express from 'express';
// import mongoose from 'mongoose';
// import { config } from './config';
// import { authMiddleware } from './middleware/auth';
// import { errorHandler } from './middleware/errorHandler';
// import * as authController from './controllers/authController';

// const app = express();
// app.use(express.json());

// app.post('/auth/login', authController.loginWithCredentials);
// app.post('/auth/register', authController.registerWithCredentials);
// app.post('/auth/verify', authController.verifyEmail);
// app.post('/auth/google', authController.loginWithGoogle);
// app.post('/auth/refresh', authController.refreshToken);

// app.get('/protected', authMiddleware, (req: any, res) => {
//   res.json({ message: 'Protected route', userId: req.userId });
// });

// app.use(errorHandler);

// export const startApp = async () => {
//   await mongoose.connect(config.mongoUrl);
//   app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
// };

// export default app;

import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import * as authController from './controllers/authController';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/auth/check-user', authController.checkUser);
app.post('/auth/register-backend', authController.registerWithBackend);
app.post('/auth/login', authController.loginWithCredentials);
app.post('/auth/register', authController.registerWithCredentials);
app.post('/auth/verify', authController.verifyEmail);
app.post('/auth/google', authController.loginWithGoogle);
app.post('/auth/refresh', authController.refreshToken);

app.get('/protected', authMiddleware, (req: any, res) => {
  res.json({ message: 'Protected route', userId: req.userId });
});

app.use(errorHandler);

export const startApp = async () => {
  await mongoose.connect(config.mongoUrl);
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
};

export default app;