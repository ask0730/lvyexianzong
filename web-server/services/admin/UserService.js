const UserModel = require('../../models/UserModel');

const UserService = {
  getGenderStats: async () => {
    const stats = await UserModel.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);
    return stats;
  },
  login: async ({ username, password }) => {
    const user = await UserModel.findOne({ username });
    if (!user) return [];
    
    // 直接比较明文密码
    const isMatch = password === user.password;
    return isMatch ? [user] : [];
  },
  upload: async ({ _id, username, introduction, gender, avatar }) => {
    if (avatar) {
      return UserModel.updateOne(
        {
          _id,
        },
        {
          username,
          introduction,
          gender,
          avatar,
        }
      );
    } else {
      return UserModel.updateOne(
        {
          _id,
        },
        {
          username,
          introduction,
          gender,
        }
      );
    }
  },
  add: async ({ username, introduction, gender, avatar, password, role }) => {
    // 直接使用明文密码
    return UserModel.create({
      username,
      introduction,
      gender,
      avatar,
      password: password,
      role,
    });
  },
  getList: async ({ id }) => {
    return id ? UserModel.find({ _id: id }, ['username', 'role', 'introduction', 'password']) : UserModel.find({}, ['username', 'role', 'avatar', 'introduction', 'gender']);
  },
  putList: async body => {
    return UserModel.updateOne({ _id: body._id }, body);
  },
  delList: async ({ _id }) => {
    return UserModel.deleteOne({ _id });
  },
};

module.exports = UserService;
