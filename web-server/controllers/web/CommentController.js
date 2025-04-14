const CommentModel = require('../../models/CommentModel');
const { verifyToken } = require('../../utils/JWT');

class CommentController {
  // 添加评论
  async addComment(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).send({ code: -1, message: '未登录' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).send({ code: -1, message: '登录已过期' });
      }

      const { newsId, content } = req.body;
      if (!content?.trim()) {
        return res.status(400).send({ code: -1, message: '评论内容不能为空' });
      }

      const comment = await CommentModel.create({
        userId: decoded._id,
        newsId,
        content: content.trim()
      });

      const populatedComment = await CommentModel.findById(comment._id)
        .populate('userId', 'username avatar')
        .lean();

      res.send({
        code: 0,
        message: '评论成功',
        data: populatedComment
      });
    } catch (error) {
      console.error('添加评论失败:', error);
      res.status(500).send({ code: -1, message: '服务器错误' });
    }
  }

  // 获取新闻评论列表
  async getComments(req, res) {
    try {
      const { newsId } = req.params;
      const comments = await CommentModel.find({ newsId })
        .populate('userId', 'username avatar')
        .sort({ createdTime: -1 })
        .lean();

      res.send({
        code: 0,
        data: comments
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      res.status(500).send({ code: -1, message: '服务器错误' });
    }
  }
}

module.exports = new CommentController();
