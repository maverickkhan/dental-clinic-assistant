import { Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { LoginDto, RegisterDto } from '@dental-clinic/shared';

const authService = new AuthService();

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: RegisterDto = req.body;
  const result = await authService.register(data);

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data: LoginDto = req.body;
  const result = await authService.login(data);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const user = await authService.getCurrentUser(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});
