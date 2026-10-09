import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
    statusCode?: number;
    code?:       string;
}

export function errorHandler(
    err: ApiError, req: Request, res: Response, _next: NextFunction
): void {
    const status  = err.statusCode ?? 500;
    const message = err.message    ?? "Internal server error";

    console.error(`[${req.method}] ${req.path} → ${status}: ${message}`);

    res.status(status).json({
        error:     message,
        code:      err.code ?? "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
        path:      req.path,
    });
}
