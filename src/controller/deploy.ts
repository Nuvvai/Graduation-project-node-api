import { Request, Response, NextFunction } from 'express';

export const deployProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { projectName } = req.params;
    const user = req.user;

    try {
        

        res.status(200).json({ message: `Project ${projectName} deployed successfully!` });
    } catch (error) {
        next(error);
    }
}