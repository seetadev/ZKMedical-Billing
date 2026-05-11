import { Request, Response, NextFunction } from "express";

const VALID_KEYS = new Set(
    (process.env.API_KEY_SECRET ?? "").split(",").filter(Boolean)
);

export function apiKeyAuth(
    req: Request, res: Response, next: NextFunction
): void {
    const key = req.headers["x-api-key"] as string;

    if (!key || !VALID_KEYS.has(key)) {
        res.status(401).json({
            error:   "Unauthorised",
            message: "Provide a valid API key in the X-Api-Key header",
        });
        return;
    }
    next();
}
