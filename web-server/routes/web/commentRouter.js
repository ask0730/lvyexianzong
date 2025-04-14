const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../middleware/AuthMiddleware');
const CommentModel = require('../../models/CommentModel');
const { body, validationResult } = require('express-validator');

// 获取评论列表
router.get('/:newsId', async (req, res) => {
    try {
        const comments = await CommentModel.find({ newsId: req.params.newsId })
            .populate('userId', ['username', 'avatar'])
            .sort({ createdTime: -1 });
        res.send({
            code: 0,
            data: comments
        });
    } catch (error) {
        res.status(500).send({
            code: -1,
            message: '获取评论列表失败'
        });
    }
});

// 添加评论
router.post('/add',
    AuthMiddleware.requireAuth,
    body('newsId').exists().isString().withMessage('newsId 必须是有效的字符串'),
    body('content').exists().isString().withMessage('content 必须是有效的字符串'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { newsId, content } = req.body;
            
            // 验证评论内容不为空
            if (!content?.trim()) {
                return res.status(400).send({
                    code: -1,
                    message: '评论内容不能为空'
                });
            }

            // 验证文章ID
            if (!newsId?.trim()) {
                return res.status(400).send({
                    code: -1,
                    message: '文章ID不能为空'
                });
            }

            const comment = await CommentModel.create({
                newsId,
                content: content.trim(),
                userId: req.user._id,
                createdTime: new Date()
            });

            const populatedComment = await CommentModel.findById(comment._id)
                .populate('userId', ['username', 'avatar']);

            if (!populatedComment) {
                throw new Error('评论创建成功但获取详情失败');
            }

            res.send({
                code: 0,
                data: populatedComment,
                message: '评论成功'
            });
        } catch (error) {
            console.error('添加评论失败:', {
                error: error.message,
                stack: error.stack,
                userId: req.user?._id,
                newsId: req.body?.newsId,
                content: req.body?.content
            });

            res.status(500).send({
                code: -1,
                message: '评论失败：' + (error.message || '服务器内部错误')
            });
        }
    }
);

module.exports = router;