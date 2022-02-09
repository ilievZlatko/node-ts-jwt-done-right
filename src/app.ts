import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import Controller from './utils/interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';

class App {
  public express: Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.express = express();
    this.port = port;

    this.initializeDatabaseConnection();
    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.express.use(helmet());
    this.express.use(cors());
    this.express.use(morgan('dev'));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.express.use('/api', controller.router);
    });
  }

  private initializeErrorHandling(): void {
    this.express.use(ErrorMiddleware);
  }

  private initializeDatabaseConnection(): void {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
    const connection = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`;
    mongoose.connect(connection);
    console.log('Database connection successful!');
  }

  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App listening on port: ${this.port}`);
    });
  }
}

export default App;
