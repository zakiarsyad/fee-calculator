import { NextFunction, Request, Response } from 'express';

export const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey || (apiKey && apiKey != process.env.X_API_KEY)) {
        next(Error('INVALID_API_KEY')) 
    }

    next();
};