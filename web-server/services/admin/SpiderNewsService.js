const SpiderNewsModel = require('../../models/SpiderNewsModel');

const SpiderNewsService = {
    getList: async () => {
        return SpiderNewsModel.find({}).sort({ crawlTime: -1 });
    }
};

module.exports = SpiderNewsService;