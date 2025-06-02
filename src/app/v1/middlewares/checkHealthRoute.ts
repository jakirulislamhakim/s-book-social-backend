import { Request, Response } from 'express';

export const checkHealthRoute = async (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'Server is healthy !',
  });
};
