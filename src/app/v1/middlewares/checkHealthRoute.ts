import { Request, Response } from 'express';

export const checkHealthRoute = async (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'S-Book Social Media Server is healthy !',
  });
};
