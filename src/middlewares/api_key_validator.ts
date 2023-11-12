import { NextFunction, Request, Response } from 'express';

import { X_API_KEY } from '../Config';

export const apiKeyValidator = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey || (apiKey && apiKey != X_API_KEY)) {        
        return next(Error('INVALID_API_KEY'))
    }

    next();
};