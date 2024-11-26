<template>
  <el-aside :width="useTool.isCollapsed ? '64px' : '220px'">
    <el-menu active-text-color="#ffffff" background-color="#001529" text-color="#bfcbd9" :collapse="useTool.isCollapsed" :collapse-transition="false" :router="true" :default-active="route.fullPath">
      <el-menu-item index="/index">
        <el-icon><home-filled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/center">
        <el-icon>
          <avatar />
        </el-icon>
        <span>个人中心</span>
      </el-menu-item>

      <el-sub-menu index="/user-manage" v-admin>
        <template #title>
          <el-icon>
            <user-filled />
          </el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/user-manage/adduser">添加用户</el-menu-item>
        <el-menu-item index="/user-manage/userlist">用户列表</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="/news-manage">
        <template #title>
          <el-icon>
            <message-box />
          </el-icon>
          <span>新闻管理</span>
        </template>
        <el-menu-item index="/news-manage/addnews">创建新闻</el-menu-item>
        <el-menu-item index="/news-manage/newslist">新闻列表</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="/product-manage">
        <template #title>
          <el-icon>
            <reading />
          </el-icon>
          <span>产品管理</span>
        </template>
        <el-menu-item index="/product-manage/addproduct">添加产品</el-menu-item>
        <el-menu-item index="/product-manage/productlist">产品列表</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>
<script setup lang="ts">
import { useToolStore } from '@/store';
import { useRoute } from 'vue-router';
const useTool = useToolStore();
const route = useRoute();
</script>

<style lang="scss" scoped>
.el-aside {
  height: 100vh;

  .el-menu {
    height: 100vh;
    .el-menu-item.is-active {
      background-color: #1a5276;
      &:hover {
        background-color: #1a5276;
        color: #ffffff;
      }
    }
    .el-menu-item:hover {
      background-color: transparent;
      color: #ffffff;
    }
    :deep(.el-sub-menu) .el-sub-menu__title:hover {
      background-color: transparent !important;
      color: #ffffff;
    }
  }
}
</style>
