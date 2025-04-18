const config = {
    url: 'mongodb://127.0.0.1:27017/company-system',
    options: {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000
    }
};

module.exports = config;
