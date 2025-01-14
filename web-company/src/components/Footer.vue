<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>联系我们</h3>
        <p>电话：400-888-8888</p>
        <p>邮箱：contact@company.com</p>
        <p>地址：北京市朝阳区xxx大厦</p>
      </div>

      <div class="footer-section">
        <h3>关注我们</h3>
        <p>微信公众号：CompanyName</p>
        <p>新浪微博：@CompanyName</p>
      </div>

      <div class="footer-section">
        <h3>快速链接</h3>
        <router-link to="/about">关于我们</router-link>
        <router-link to="/news">新闻中心</router-link>
        <router-link to="/product">产品中心</router-link>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 Company Name. All Rights Reserved. 京ICP备xxxxxxxx号</p>
    </div>
  </footer>
</template>
<script></script>

<style scoped lang="scss">
.footer {
  background-color: #2c3e50;
  color: #ffffff;
  padding: 40px 0 20px;
  width: 100%;
  position: relative;
  z-index: 1;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    padding: 0 20px;

    .footer-section {
      flex: 1;
      margin: 0 20px;

      h3 {
        font-size: 18px;
        margin-bottom: 20px;
        color: #ffffff;
      }

      p {
        margin: 10px 0;
        color: #cccccc;
      }

      a {
        display: block;
        color: #cccccc;
        text-decoration: none;
        margin: 10px 0;

        &:hover {
          color: #ffffff;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    p {
      color: #cccccc;
      font-size: 14px;
    }
  }
}
</style>
