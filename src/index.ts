import dotenv from 'dotenv';
import express from 'express';

import { errorHandler } from './middlewares/error_handler';
import { apiKeyValidator } from './middlewares/api_key_validator';
import routes from './routes';
import { HealthcheckRouter } from './routes/healthcheck';

dotenv.config();

const app = express();
const port = 3000;

app.use('/healthcheck', HealthcheckRouter);

app.use(apiKeyValidator);
app.use('/', routes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
