import { Request, Response } from 'express';
import { Favorite } from '../models/favorite';
import mongoose from 'mongoose';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?._id;

    // 参数完整性检查
    if (!articleId) {
      return res.status(200).json({
        code: 1,
        message: '文章ID不能为空'
      });
    }

    if (!userId) {
      return res.status(200).json({
        code: 1,
        message: '用户未登录'
      });
    }

    // 参数格式验证
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(200).json({
        code: 1,
        message: '无效的文章ID格式'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({
        code: 1,
        message: '无效的用户ID格式'
      });
    }

    // 检查是否已存在
    const existingFavorite = await Favorite.findOne({
      user: userId,
      article: articleId
    });

    if (existingFavorite) {
      return res.status(200).json({
        code: 1,
        message: '已经收藏过该文章'
      });
    }

    // 创建新收藏
    const favorite = new Favorite({
      user: new mongoose.Types.ObjectId(userId),
      article: new mongoose.Types.ObjectId(articleId)
    });

    await favorite.save();

    return res.status(200).json({
      code: 0,
      message: '收藏成功',
      data: favorite
    });

  } catch (error) {
    console.error('收藏失败:', error);

    if (error.code === 11000) {
      return res.status(200).json({
        code: 1,
        message: '已经收藏过该文章'
      });
    }

    return res.status(200).json({
      code: 1,
      message: '收藏失败，请稍后重试'
    });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const userId = req.user?._id;

    if (!articleId || !userId) {
      return res.status(200).json({
        code: 1,
        message: '缺少必要参数'
      });
    }

    await Favorite.findOneAndDelete({ user: userId, article: articleId });

    res.status(200).json({
      code: 0,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(200).json({
      code: 1,
      message: '取消收藏失败'
    });
  }
};