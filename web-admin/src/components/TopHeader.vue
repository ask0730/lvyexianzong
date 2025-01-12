<template>
  <el-header class="header">
    <div class="left">
      <el-icon @click="handleCollapsed" class="menu-icon">
        <Menu />
      </el-icon>
      <span class="title" :class="{ 'mobile-title': isMobile }">
        绿野仙踪管理系统
      </span>
    </div>
    <div class="right">
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-avatar :size="isMobile ? 24 : 30" :src="avatar" />
          <span v-if="!isMobile" class="username">
            {{ useTool.userInfo.username }}
          </span>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleCenter">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>
<script setup lang="ts">
import { useToolStore } from '@/store';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const useTool = useToolStore();
const router = useRouter();
const isMobile = ref(false);

const avatar = computed(() => 
  useTool.userInfo.avatar 
    ? 'http://localhost:3000' + useTool.userInfo.avatar 
    : `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`
);

const handleCollapsed = () => {
  useTool.changeCollapsed();
};

const handleCenter = () => {
  router.push('/center');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
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
.header {
  width: 100%;
  height: 50px;
  line-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f7f9;
  padding: 0 15px;
  background-color: #fff;

  @media screen and (max-width: 768px) {
    padding: 0 10px;
  }
}

.left {
  display: flex;
  align-items: center;
  
  .menu-icon {
    cursor: pointer;
    font-size: 20px;
    margin-right: 15px;
  }
  
  .title {
    font-size: 16px;
    
    &.mobile-title {
      font-size: 14px;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.right {
  .el-dropdown {
    .el-dropdown-link {
      display: flex;
      align-items: center;
      padding: 3px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      cursor: pointer;
      
      .username {
        margin: 0 8px;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .el-dropdown {
      .el-dropdown-link {
        padding: 2px 6px;
      }
    }
  }
}
</style>
