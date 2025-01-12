<template>
  <el-container class="main-container">
    <SideMenu v-show="!isMobile || !useTool.isCollapsed" />
    <el-container direction="vertical">
      <TopHeader />
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToolStore } from '@/store';
import TopHeader from '@/components/TopHeader.vue';
import SideMenu from '@/components/SideMenu.vue';

const useTool = useToolStore();
const isMobile = ref(false);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  // 在移动端自动收起侧边栏
  if (isMobile.value && !useTool.isCollapsed) {
    useTool.changeCollapsed();
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.main-container {
  min-height: 100vh;

  .el-main {
    padding: 20px;
    background-color: #f0f2f5;
    overflow-x: hidden;
    
    @media screen and (max-width: 768px) {
      padding: 10px;
    }
  }
}

// 移动端样式
@media screen and (max-width: 768px) {
  :deep(.el-aside) {
    position: fixed;
    height: 100vh;
    z-index: 1000;
  }
}
</style>
