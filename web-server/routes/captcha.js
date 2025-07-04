const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');

router.get('/', (req, res) => {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: '#cc9966'
  });
  // 保存验证码到session
  req.session = req.session || {};
  req.session.captcha = captcha.text;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-store');
  res.send(captcha.data);
});

module.exports = router; 