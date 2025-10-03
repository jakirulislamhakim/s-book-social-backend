import mongoose from 'mongoose';
import app from './app';
import { Server } from 'http';
import config from './app/v1/config';
import { seedSuperAdminIntoDB } from './app/v1/utils/seedSuperAdminIntoDB';
import { initializeJobs } from 'app/v1/jobs';

let server: Server;

async function startServer() {
  const DB_URL = config.DATABASE_URL;

  try {
    if (!DB_URL) {
      throw new Error('Please set DATABASE_URL in .env file');
    }

    await mongoose.connect(DB_URL);

    // first super admin push if no admin exists
    seedSuperAdminIntoDB();

    initializeJobs();

    server = app.listen(config.PORT, () => {
      console.info(`app is listening on port ${config.PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  if (server) server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
