const NewsService = require('../../services/web/NewsService');

const NewsController = {
  getList: async (req, res) => {
    const result = await NewsService.getList({ _id: req.body._id });
    res.send({
      code: 0,
      data: result,
    });
  },

  getTopList: async (req, res) => {
    const result = await NewsService.getTopList({ limit: req.body.limit });
    res.send({
      code: 0,
      data: result,
    });
  },
};

module.exports = NewsController;
