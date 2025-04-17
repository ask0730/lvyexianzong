const axios = require('axios');

const proxy = {
    host: '119.28.51.117',
    port: 8080
};

axios.get('https://www.baidu.com/', {  // 可以替换为其他简单可访问的网址
    proxy: proxy
})
.then(response => {
    console.log('代理测试成功，响应状态码:', response.status);
})
.catch(error => {
    console.log('代理测试失败:', error.message);
});