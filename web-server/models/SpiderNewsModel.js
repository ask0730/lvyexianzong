const mongoose = require('mongoose');

const SpiderNewsSchema = new mongoose.Schema({
    title: String,
    source: String,
    date: String,
    content: String,
    crawlTime: {
        type: Date,
        default: Date.now
    }
});

const SpiderNewsModel = mongoose.model('SpiderNews', SpiderNewsSchema);

module.exports = SpiderNewsModel;