const express = require('express');
const router = express.Router();
const SearchController = require('../../controllers/web/SearchController');

// 基础搜索
router.get('/', SearchController.search);

// 高级搜索
router.post('/advanced', SearchController.advancedSearch);

// 获取搜索建议
router.get('/suggestions', SearchController.getSuggestions);

// 获取热门搜索
router.get('/hot', SearchController.getHotSearches);

// 保存搜索记录
router.post('/record', SearchController.saveSearchRecord);

module.exports = router; 