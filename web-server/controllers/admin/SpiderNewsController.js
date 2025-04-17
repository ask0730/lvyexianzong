const SpiderNewsService = require('../../services/admin/SpiderNewsService');

const SpiderNewsController = {
    getList: async (req, res) => {
        const result = await SpiderNewsService.getList();
        res.send({
            code: 0,
            data: result
        });
    }
};

module.exports = SpiderNewsController;