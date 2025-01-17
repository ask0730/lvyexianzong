const jsonwebtoken = require('jsonwebtoken');

// 使用更安全的密钥
const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-should-be-in-env';

class JWT {
    /**
     * 生成JWT token
     * @param {Object} payload - 要编码到token中的数据
     * @param {string} expiresIn - token的有效期
     * @returns {string} JWT token
     */
    static generate(payload, expiresIn = '1d') {
        try {
            return jsonwebtoken.sign(payload, SECRET_KEY, { 
                expiresIn,
                algorithm: 'HS256'
            });
        } catch (error) {
            console.error('Token生成错误:', error);
            throw new Error('Token生成失败');
        }
    }

    /**
     * 验证JWT token
     * @param {string} token - 要验证的token
     * @returns {Object|null} 解码后的payload或null（如果验证失败）
     */
    static verify(token) {
        try {
            return jsonwebtoken.verify(token, SECRET_KEY);
        } catch (error) {
            console.error('Token验证错误:', error);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token已过期');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('无效的Token');
            }
            throw error;
        }
    }

    /**
     * 解码JWT token（不验证签名）
     * @param {string} token - 要解码的token
     * @returns {Object|null} 解码后的payload或null
     */
    static decode(token) {
        try {
            return jsonwebtoken.decode(token);
        } catch (error) {
            console.error('Token解码错误:', error);
            return null;
        }
    }
}

module.exports = JWT;
