const ProductService = require('../../services/admin/ProductService');

const ProductController = {
  add: async (req, res) => {
    const cover = req.file ? `/productuploads/${req.file.filename}` : '';
    const { title, introduction, detail } = req.body;
    //调用 service进行添加
    await ProductService.add({
      title,
      introduction,
      detail,
      cover,
      editTime: new Date(),
    });
    res.send({
      code: 0,
      data: null,
    });
  },
  updateList: async (req, res) => {
    const cover = req.file ? `/productuploads/${req.file.filename}` : '';
    const { title, introduction, detail, _id } = req.body;
    await ProductService.updateList({
      _id,
      title,
      introduction,
      detail,
      cover,
      editTime: new Date(),
    });
    res.send({
      code: 0,
      data: null,
    });
  },
  getList: async (req, res) => {
    console.log(req.body.id, 'req.body.id');
    const result = await ProductService.getList({ _id: req.body._id });
    res.send({
      code: 0,
      data: result,
    });
  },

  delList: async (req, res) => {
    await ProductService.delList({ _id: req.body._id });
    res.send({
      code: 0,
      data: null,
    });
  },
};

module.exports = ProductController;
