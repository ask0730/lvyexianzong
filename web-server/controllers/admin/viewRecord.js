const ViewRecordModel = require('../../models/ViewRecordModel');
const NewsModel = require('../../models/NewsModel');

// 获取文章浏览量排行
exports.getViewStatistics = async (req, res) => {
    try {
        // 聚合查询获取文章浏览量统计
        const viewStats = await ViewRecordModel.aggregate([
            {
                $group: {
                    _id: '$articleId',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // 获取文章标题
        const articleIds = viewStats.map(stat => stat._id);
        const articles = await NewsModel.find({ _id: { $in: articleIds } }, 'title');

        // 构建文章标题和浏览量数组
        const titles = [];
        const counts = [];
        viewStats.forEach(stat => {
            const article = articles.find(a => a._id.toString() === stat._id.toString());
            if (article) {
                titles.push(article.title);
                counts.push(stat.count);
            }
        });

        res.json({
            code: 0,
            data: { titles, counts }
        });
    } catch (error) {
        console.error('获取浏览量统计失败:', error);
        res.json({
            code: 1,
            msg: '获取浏览量统计失败'
        });
    }
};

// 获取24小时浏览量分布
exports.getHourlyViewDistribution = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 聚合查询获取每小时的浏览量
        const hourlyStats = await ViewRecordModel.aggregate([
            {
                $match: {
                    viewTime: { $gte: oneDayAgo, $lte: now }
                }
            },
            {
                $group: {
                    _id: { $hour: '$viewTime' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // 构建24小时的数据数组
        const hours = [];
        const counts = new Array(24).fill(0);
        for (let i = 0; i < 24; i++) {
            hours.push(i.toString().padStart(2, '0') + ':00');
            const stat = hourlyStats.find(s => s._id === i);
            if (stat) {
                counts[i] = stat.count;
            }
        }

        res.json({
            code: 0,
            data: { hours, counts }
        });
    } catch (error) {
        console.error('获取24小时浏览量分布失败:', error);
        res.json({
            code: 1,
            msg: '获取24小时浏览量分布失败'
        });
    }
};