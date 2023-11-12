import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message === 'INVALID_API_KEY') {
        return res.status(400).send({
            error_code: 'INVALID_API_KEY',
            error_message: 'Your API key is invalid.',
        });
    }

    if (err.message === 'API_VALIDATION_ERROR') {
        return res.status(400).send({
            error_code: 'API_VALIDATION_ERROR',
            error_message: 'Invalid API request.',
        });
    }

    if (err.message === 'CSV_VALIDATION_ERROR') {
        return res.status(400).send({
            error_code: 'CSV_VALIDATION_ERROR',
            error_message: 'Invalid CSV format.',
        });
    }

    return res.status(500).send({
        error_code: 'SERVER_ERROR',
        error_message: 'Something went wrong!',
    });
};