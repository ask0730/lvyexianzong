import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import mongoose from 'mongoose';

// 扩展 Request 类型以包含 user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('认证头信息:', {
      authHeader,
      hasToken: !!authHeader
    });

    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    console.log('解码的token信息:', {
      decoded,
      userId: decoded.id
    });
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'token无效'
      });
    }

    const user = await User.findById(decoded.id);
    console.log('查找到的用户信息:', {
      userId: user?._id,
      userExists: !!user
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误详细信息:', {
      error,
      errorMessage: error.message,
      stack: error.stack
    });
    res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
}; 