<template>
  <Navbar />
  <router-view />
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
</script>

<style>
 html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  padding-top: 64px; /* 确保所有页面内容都有足够的顶部间距 */
}
</style>
