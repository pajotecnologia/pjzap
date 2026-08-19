import { Request, Response } from "express";

export const index = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
        version: "21:07 - v7.0.28"
    });
};
