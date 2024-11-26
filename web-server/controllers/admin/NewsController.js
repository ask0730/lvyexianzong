const NewsService = require('../../services/admin/NewsService');

const NewsController = {
  add: async (req, res) => {
    const cover = req.file ? `/newsuploads/${req.file.filename}` : '';
    const { title, content, category, isPublish } = req.body;
    //调用 service进行添加
    await NewsService.add({
      title,
      content,
      category: Number(category),
      isPublish: Number(isPublish),
      cover,
      editTime: new Date(),
    });
    res.send({
      code: 0,
      data: null,
    });
  },
  updateList: async (req, res) => {
    const cover = req.file ? `/newsuploads/${req.file.filename}` : '';
    const { title, content, category, isPublish, _id } = req.body;
    await NewsService.updateList({
      _id,
      title,
      content,
      category: Number(category),
      isPublish: Number(isPublish),
      cover,
      editTime: new Date(),
    });
    res.send({
      code: 0,
      data: null,
    });
  },
  getList: async (req, res) => {
    const result = await NewsService.getList({ _id: req.body._id });
    res.send({
      code: 0,
      data: result,
    });
  },

  delList: async (req, res) => {
    await NewsService.delList({ _id: req.body._id });
    res.send({
      code: 0,
      data: null,
    });
  },

  publish: async (req, res) => {
    await NewsService.publish({
      ...req.body,
      editTime: new Date(),
    });
    res.send({
      code: 0,
      data: null,
    });
  },
};

module.exports = NewsController;
