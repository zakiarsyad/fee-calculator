import express from 'express';

import { apiKeyValidator, errorHandler } from './middlewares';
import routes from './routes';
import { HealthcheckRouter } from './routes/healthcheck';

const app = express();
const port = 3000;

app.use('/healthcheck', HealthcheckRouter);

app.use(apiKeyValidator);
app.use('/', routes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
