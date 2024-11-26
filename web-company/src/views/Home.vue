<template>
  <div class="container">
    <el-carousel height="calc(100vh - 60px)">
      <el-carousel-item :key="1">
        <div :style="{ backgroundImage: `url(${img1})` }"></div>
      </el-carousel-item>
      <el-carousel-item :key="2">
        <div :style="{ backgroundImage: `url(${img2})` }"></div>
      </el-carousel-item>
      <el-carousel-item :key="3">
        <div :style="{ backgroundImage: `url(${img3})` }"></div>
      </el-carousel-item>
    </el-carousel>
    <div class="center">互联网+时代</div>
  </div>
</template>

<script setup lang="ts">
import img1 from '@/assets/home1.jpg';
import img2 from '@/assets/home2.jpg';
import img3 from '@/assets/home3.jpg';
</script>

<style scoped lang="scss">
.el-carousel div {
  width: 100%;
  height: 100%;
  background-size: cover;
}

.container {
  position: relative;
}
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100px;
  line-height: 100px;
  font-size: 60px;
  color: white;
  text-align: center;
}
</style>
