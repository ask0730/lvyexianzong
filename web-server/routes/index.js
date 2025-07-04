var express = require('express');
var router = express.Router();
const captchaRouter = require('./captcha');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/captcha', captchaRouter);

module.exports = router;
