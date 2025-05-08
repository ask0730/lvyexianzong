const bcrypt = require('bcryptjs');

const PasswordEncryption = {
    // 加密密码
    async encrypt(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    },

    // 验证密码
    async verify(password, hash) {
        return bcrypt.compare(password, hash);
    }
};

module.exports = PasswordEncryption;