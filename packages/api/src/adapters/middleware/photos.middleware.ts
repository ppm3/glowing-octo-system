import { ApiConfig } from '@/domain/entities/config.entity';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction, apiConfig: ApiConfig) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== apiConfig.xApiKey) {
        return res.status(HttpStatusCode.Forbidden).json({ error: 'Invalid API key' });
    }

    next();
};
