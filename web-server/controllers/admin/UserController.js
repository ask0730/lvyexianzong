const UserService = require('../../services/admin/UserService');
const JWT = require('../../utils/JWT');

const UserController = {
  login: async (req, res) => {
    const result = await UserService.login(req.body);
    if (result.length === 0) {
      res.send({
        code: 1,
        msg: '用户名密码不匹配',
      });
    } else {
      //生成token
      const token = JWT.generate(
        {
          _id: result[0]._id,
          username: result[0].username,
        },
        '1d'
      );
      res.header('Authorization', token);

      res.send({
        code: 0,
        ActionType: 'OK',
        data: {
          username: result[0].username,
          gender: result[0].gender ? result[0].gender : 0, //性别 ,0,1,2
          introduction: result[0].introduction, //简介
          avatar: result[0].avatar,
          role: result[0].role,
        },
      });
    }
  },
  upload: async (req, res) => {
    const { username, introduction, gender } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const avatar = req.file ? `/avataruploads/${req.file.filename}` : '';
    var payload = JWT.verify(token);
    //调用service 模块更新 数据
    await UserService.upload({
      _id: payload._id,
      username,
      introduction,
      gender: Number(gender),
      avatar,
    });
    if (avatar) {
      res.send({
        code: 0,
        data: {
          username,
          introduction,
          gender: Number(gender),
          avatar,
        },
      });
    } else {
      res.send({
        code: 0,
        data: {
          username,
          introduction,
          gender: Number(gender),
        },
      });
    }
  },
  add: async (req, res) => {
    const { username, password, role, introduction, gender } = req.body;
    const avatar = req.file ? `/avataruploads/${req.file.filename}` : '';
    await UserService.add({
      username,
      introduction,
      gender: Number(gender),
      avatar,
      role: Number(role),
      password,
    });
    res.send({
      code: 0,
      data: null,
    });
  },
  getList: async (req, res) => {
    const result = await UserService.getList(req.body);
    res.send({
      code: 0,
      data: result,
    });
  },
  putList: async (req, res) => {
    const result = await UserService.putList(req.body);
    res.send({
      code: 0,
    });
  },
  delList: async (req, res) => {
    const result = await UserService.delList(req.body);
    res.send({
      code: 0,
    });
  },
};

module.exports = UserController;
