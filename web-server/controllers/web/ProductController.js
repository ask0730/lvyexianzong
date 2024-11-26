const ProductService = require('../../services/web/ProductService');

const ProductController = {
  getList: async (req, res) => {
    const result = await ProductService.getList({ _id: req.body._id });
    res.send({
      code: 0,
      data: result,
    });
  },
};

module.exports = ProductController;
