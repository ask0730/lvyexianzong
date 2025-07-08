<template>
    <div class="gis-container">
      <h2>GIS 地图演示</h2>
      <div id="map" class="map"></div>
      <el-button @click="locateMe" type="primary" style="margin-top: 10px;">定位到我</el-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  
  let map: L.Map
  
  // 示例标记点
  const markers = [
    { lat: 31.2304, lng: 121.4737, popup: '上海' },
    { lat: 39.9042, lng: 116.4074, popup: '北京' },
    { lat: 23.1291, lng: 113.2644, popup: '广州' }
  ]
  
  onMounted(() => {
    map = L.map('map').setView([31.2304, 121.4737], 5)
  
    // 底图切换控件
    const baseLayers = {
      'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }),
      '卫星地图': L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 19,
        attribution: '© Google'
      })
    }
    baseLayers['OpenStreetMap'].addTo(map)
    L.control.layers(baseLayers).addTo(map)
  
    // 比例尺
    L.control.scale().addTo(map)
  
    // 添加多个标记
    markers.forEach(m => {
      L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.popup)
    })
  
    // 点击地图添加标记
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`新标记<br>经度: ${lng.toFixed(5)}<br>纬度: ${lat.toFixed(5)}`)
        .openPopup()
    })
  })
  
  // 定位到用户当前位置
  function locateMe() {
    if (!map) return
    map.locate({ setView: true, maxZoom: 12 })
    map.on('locationfound', (e: any) => {
      L.marker(e.latlng).addTo(map)
        .bindPopup('你在这里').openPopup()
    })
    map.on('locationerror', () => {
      alert('定位失败，请检查浏览器权限')
    })
  }
  </script>
  
  <style scoped>
  .gis-container {
    padding: 20px;
  }
  .map {
    width: 100%;
    height: 500px;
    margin-top: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  </style>