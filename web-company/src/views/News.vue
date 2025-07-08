<template>
    <div class="page-container">
        <div class="content">
            <div class="container">
                <el-carousel height="400px" class="news-carousel" :interval="3000" :autoplay="true" indicator-position="outside">
                    <el-carousel-item v-for="item in carouselImages" :key="item">
                        <img :src="item" class="carousel-image" />
                    </el-carousel-item>
                </el-carousel>
                <div class="search">
                    <el-popover placement="bottom" title="检索结果" width="50%" :visible="visible">
                        <template #reference>
                            <el-input v-model="searchText" class="w-50 m-2" placeholder="请输入文章关键字" :prefix-icon="Search" type="search" size="large" @input="visible = true" @blur="visible = false" />
                        </template>

                        <div v-if="searchnewslist.length">
                            <div v-for="data in searchnewslist" :key="data._id" class="search-item" @click="handleChangepage(data._id)">{{ data.title }}</div>
                        </div>
                        <div v-else>
                            <el-empty description="暂无文章" :image-size="50" />
                        </div>
                    </el-popover>
                </div>
                <div class="topnews">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12" :md="6" v-for="item in topNewsList" :key="item._id">
                            <el-card :body-style="{ padding: '0px' }" shadow="hover" @click="handleChangepage(item._id)">
                                <div class="image" :style="{
                    backgroundImage: `url(http://localhost:3000${item.cover})`,
                  }"></div>
                                <div style="padding: 14px">
                                    <span>{{ item.title }}</span>
                                    <div class="bottom">
                                        <time class="time">{{ formatTime(item.editTime) }}</time>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
                <el-tabs style="margin: 20px" v-model="whichTab" class="demo-tabs">
                    <el-tab-pane :key="item.name" v-for="item in tablist" :label="item.label" :name="item.name">
                        <el-row :gutter="20">
                            <el-col :xs="24" :sm="24" :md="18">
                                <div v-for="data in tabnews[item.name]" :key="data._id" style="padding: 10px">
                                    <el-card :body-style="{ padding: '0px' }" shadow="hover" @click="handleChangepage(data._id)" class="news-card">
                                        <div class="tab-image" :style="{
                        backgroundImage: `url(http://localhost:3000${data.cover})`,
                      }"></div>
                                        <div class="news-content">
                                            <span class="news-title">{{ data.title }}</span>
                                            <p style="font-size: 12px; color: #888;">
                                              预计阅读时间：{{ calculateReadTime(data.content) }} 分钟
                                            </p>
                                            <div class="bottom">
                                                <time class="tab-time">{{ formatTime(data.editTime) }}</time>
                                            </div>
                                        </div>
                                    </el-card>
                                </div>
                            </el-col>
                            <el-col :xs="24" :sm="24" :md="6">
                                <el-timeline>
                                    <el-timeline-item v-for="(data, index) in tabnews[item.name]" :key="index" :timestamp="formatTime(data.editTime)">{{ data.title }}</el-timeline-item>
                                </el-timeline>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>

                <el-backtop :visibility-height="100" />
            </div>
        </div>
        <Footer />
    </div>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import API from '@/api'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { formatTime } from '@/utils'
import bg from '@/assets/newsbg.jpg'
import Footer from '@/components/Footer.vue'

const searchText = ref('')
const visible = ref(false)
const newlist: any = ref([])
const whichTab = ref(1)
onMounted(async () => {
    const res = await API.news.list({})
    if (res.code == 0) {
        newlist.value = res.data
    }
})

const searchnewslist: any = computed(() =>
    searchText.value ? newlist.value.filter((item: any) => item.title.includes(searchText.value)) : []
)

const topNewsList: any = computed(() => newlist.value.slice(0, 4))

const tablist = [
    {
        label: '最新动态',
        name: 1,
    },
    {
        label: '典型案例',
        name: 2,
    },
    {
        label: '通知公告',
        name: 3,
    },
]

const tabnews: any = computed(() => _.groupBy(newlist.value, (item) => item.category))
const router = useRouter()
const handleChangepage = (id: number) => {
    router.push(`/news/${id}`)
}

const carouselImages = ref(['/src/assets/news/banner1.jpg', '/src/assets/news/banner2.jpg', '/src/assets/news/banner3.jpg'])

function calculateReadTime(text: string, wordsPerMinute = 200) {
  if (!text) return 1;
  // 去除 HTML 标签
  const plainText = text.replace(/<[^>]+>/g, '');
  const wordCount = plainText.length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.content {
    flex: 1 0 auto;
}

.container {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

.news-header {
    width: 100%;
    height: 400px;
    background-size: cover;
}

.news-carousel {
    width: 100%;
    @media screen and (max-width: 768px) {
        height: 200px !important;
    }
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.search {
    position: absolute;
    top: 300px;
    width: 100%;
    text-align: center;
    .el-input {
        width: 50%;
        @media screen and (max-width: 768px) {
            width: 90%;
        }
    }
    @media screen and (max-width: 768px) {
        top: 150px;
    }
}

.search-item {
    height: 50px;
    line-height: 50px;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
        background: whitesmoke;
        color: red;
    }
    @media screen and (max-width: 768px) {
        font-size: 14px;
        height: 40px;
        line-height: 40px;
    }
}

.topnews {
    margin: 20px;
    .image {
        width: 100%;
        height: 150px;
        background-size: cover;
        transition: transform 0.3s ease;
        &:hover {
            transform: scale(1.05);
        }
    }
    .time {
        font-size: 13px;
        color: gray;
    }
    @media screen and (max-width: 768px) {
        margin: 10px;
    }
}

.news-card {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    @media screen and (max-width: 768px) {
        flex-direction: column;
    }
}

.tab-image {
    width: 150px;
    height: 100px;
    background-size: cover;
    transition: transform 0.3s ease;
    &:hover {
        transform: scale(1.05);
    }
    @media screen and (max-width: 768px) {
        width: 100%;
        height: 150px;
    }
}

.news-content {
    flex: 1;
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.news-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    @media screen and (max-width: 768px) {
        font-size: 14px;
    }
}

.tab-time {
    font-size: 13px;
    color: gray;
}

.el-timeline {
    @media screen and (max-width: 768px) {
        margin-top: 20px;
    }
}
</style>
.el-popover {
  @media screen and (max-width: 768px) {
    width: 90% !important;
    max-width: 90%;
    margin: 0 auto;
  }
}