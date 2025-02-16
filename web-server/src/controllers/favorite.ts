import { Request, Response } from 'express';
import { Favorite } from '../models/favorite';
import mongoose from 'mongoose';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?._id;

    console.log('收藏请求参数:', {
      articleId,
      userId,
      user: req.user,
      body: req.body
    });

    // 严格的参数验证
    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({
        success: false,
        message: '无效的文章ID'
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    // 检查是否已存在
    const existingFavorite = await Favorite.findOne({
      user: userId,
      article: articleId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过了'
      });
    }

    // 创建新收藏
    const favorite = new Favorite({
      user: new mongoose.Types.ObjectId(userId),
      article: new mongoose.Types.ObjectId(articleId)
    });

    await favorite.save();

    return res.status(201).json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('收藏失败:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过了'
      });
    }

    return res.status(500).json({
      success: false,
      message: '收藏失败，请稍后重试'
    });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?._id;

    if (!articleId || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    await Favorite.findOneAndDelete({ user: userId, article: articleId });

    res.status(200).json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败'
    });
  }
}; 