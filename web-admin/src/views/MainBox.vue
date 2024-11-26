<template>
  <el-container>
    <SideMenu />
    <el-container direction="vertical">
      <TopHeader />
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup lang="ts">
import TopHeader from 'comps/TopHeader.vue';
import SideMenu from 'comps/SideMenu.vue';
</script>
