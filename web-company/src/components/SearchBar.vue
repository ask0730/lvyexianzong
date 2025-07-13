<template>
    <div class="search-bar-container">
        <!-- 主搜索框 -->
        <div class="search-input-wrapper">
            <el-input v-model="searchQuery" :placeholder="placeholder" class="search-input" clearable @input="handleSearchInput" @focus="showDropdown = true" @blur="handleBlur" @keyup.enter="handleSearch" @keyup.esc="hideDropdown">
                <template #prefix>
                    <el-icon class="search-icon">
                        <Search />
                    </el-icon>
                </template>
                <template #suffix>
                    <el-button v-if="searchQuery" type="primary" size="small" @click="handleSearch" :loading="loading">搜索</el-button>
                </template>
            </el-input>
        </div>

        <!-- 搜索下拉框 -->
        <div v-show="showDropdown" class="search-dropdown">
            <!-- 搜索历史 -->
            <div v-if="searchHistory.length > 0 && !searchQuery" class="dropdown-section">
                <div class="section-header">
                    <span class="section-title">搜索历史</span>
                    <el-button type="text" size="small" @click="clearHistory">
                        <el-icon>
                            <Delete />
                        </el-icon>清空
                    </el-button>
                </div>
                <div class="history-list">
                    <div v-for="(item, index) in searchHistory" :key="index" class="history-item" @click="selectHistoryItem(item)">
                        <el-icon class="history-icon">
                            <Clock />
                        </el-icon>
                        <span class="history-text">{{ item }}</span>
                        <el-icon class="delete-icon" @click.stop="removeHistoryItem(index)">
                            <Close />
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- 热门搜索 -->
            <div v-if="!searchQuery" class="dropdown-section">
                <div class="section-header">
                    <span class="section-title">热门搜索</span>
                </div>
                <div class="hot-search-list">
                    <el-tag v-for="(item, index) in hotSearches" :key="index" class="hot-search-tag" :type="item.type" @click="selectHotSearch(item.keyword)">{{ item.keyword }}</el-tag>
                </div>
            </div>

            <!-- 搜索建议 -->
            <div v-if="searchQuery && searchSuggestions.length > 0" class="dropdown-section">
                <div class="section-header">
                    <span class="section-title">搜索建议</span>
                </div>
                <div class="suggestion-list">
                    <div v-for="(item, index) in searchSuggestions" :key="index" class="suggestion-item" @click="selectSuggestion(item)">
                        <el-icon class="suggestion-icon">
                            <Search />
                        </el-icon>
                        <span class="suggestion-text">{{ item }}</span>
                    </div>
                </div>
            </div>

            <!-- 高级搜索选项 -->
            <div v-if="showAdvancedOptions" class="dropdown-section">
                <div class="section-header">
                    <span class="section-title">高级搜索</span>
                </div>
                <div class="advanced-options">
                    <el-form :model="advancedForm" label-width="80px" size="small">
                        <el-form-item label="分类">
                            <el-select v-model="advancedForm.category" placeholder="选择分类" clearable>
                                <el-option label="全部" value />
                                <el-option label="最新动态" value="1" />
                                <el-option label="典型案例" value="2" />
                                <el-option label="通知公告" value="3" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="时间范围">
                            <el-date-picker v-model="advancedForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="handleAdvancedSearch">高级搜索</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Clock, Delete, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { debounce } from '@/utils/throttleAndDebounce'

interface Props {
    placeholder?: string
    searchType?: 'news' | 'product' | 'all'
    showAdvanced?: boolean
}

interface AdvancedForm {
    category: string
    dateRange: [string, string] | null
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '搜索...',
    searchType: 'all',
    showAdvanced: true,
})

const emit = defineEmits<{
    search: [query: string, options?: any]
    advancedSearch: [form: AdvancedForm]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)
const loading = ref(false)
const showAdvancedOptions = ref(false)

// 搜索历史
const searchHistory = ref<string[]>([])
const maxHistoryLength = 10

// 热门搜索
const hotSearches = ref([
    { keyword: '有机农产品', type: 'success' },
    { keyword: '绿色食品', type: 'warning' },
    { keyword: '健康生活', type: 'info' },
    { keyword: '农业技术', type: 'danger' },
    { keyword: '乡村振兴', type: '' },
])

// 搜索建议
const searchSuggestions = ref<string[]>([])

// 高级搜索表单
const advancedForm = ref<AdvancedForm>({
    category: '',
    dateRange: null,
})

// 从本地存储加载搜索历史
const loadSearchHistory = () => {
    try {
        const history = localStorage.getItem('searchHistory')
        if (history) {
            searchHistory.value = JSON.parse(history)
        }
    } catch (error) {
        console.error('加载搜索历史失败:', error)
    }
}

// 保存搜索历史到本地存储
const saveSearchHistory = () => {
    try {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
    } catch (error) {
        console.error('保存搜索历史失败:', error)
    }
}

// 添加搜索历史
const addToHistory = (query: string) => {
    if (!query.trim()) return

    // 移除重复项
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
        searchHistory.value.splice(index, 1)
    }

    // 添加到开头
    searchHistory.value.unshift(query)

    // 限制历史记录数量
    if (searchHistory.value.length > maxHistoryLength) {
        searchHistory.value = searchHistory.value.slice(0, maxHistoryLength)
    }

    saveSearchHistory()
}

// 清空搜索历史
const clearHistory = () => {
    searchHistory.value = []
    saveSearchHistory()
    ElMessage.success('搜索历史已清空')
}

// 移除单个历史记录
const removeHistoryItem = (index: number) => {
    searchHistory.value.splice(index, 1)
    saveSearchHistory()
}

// 选择历史记录
const selectHistoryItem = (item: string) => {
    searchQuery.value = item
    handleSearch()
}

// 选择热门搜索
const selectHotSearch = (keyword: string) => {
    searchQuery.value = keyword
    handleSearch()
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
    searchQuery.value = suggestion
    handleSearch()
}

// 处理搜索输入
const handleSearchInput = debounce(() => {
    if (searchQuery.value.trim()) {
        generateSuggestions()
    } else {
        searchSuggestions.value = []
    }
}, 300)

// 生成搜索建议
const generateSuggestions = () => {
    const query = searchQuery.value.toLowerCase()
    const suggestions = []

    // 基于热门搜索生成建议
    hotSearches.value.forEach((item) => {
        if (item.keyword.toLowerCase().includes(query)) {
            suggestions.push(item.keyword)
        }
    })

    // 基于搜索历史生成建议
    searchHistory.value.forEach((item) => {
        if (item.toLowerCase().includes(query) && !suggestions.includes(item)) {
            suggestions.push(item)
        }
    })

    // 添加一些通用建议
    const commonSuggestions = [`${query}相关`, `${query}推荐`, `${query}最新`, `${query}热门`]

    suggestions.push(...commonSuggestions)

    searchSuggestions.value = suggestions.slice(0, 5)
}

// 处理搜索
const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        ElMessage.warning('请输入搜索内容')
        return
    }

    loading.value = true

    // 添加到搜索历史
    addToHistory(searchQuery.value)

    // 隐藏下拉框
    hideDropdown()

    // 触发搜索事件
    emit('search', searchQuery.value)

    setTimeout(() => {
        loading.value = false
    }, 500)
}

// 处理高级搜索
const handleAdvancedSearch = () => {
    if (!searchQuery.value.trim()) {
        ElMessage.warning('请输入搜索内容')
        return
    }

    addToHistory(searchQuery.value)
    hideDropdown()
    emit('advancedSearch', advancedForm.value)
}

// 处理失焦
const handleBlur = () => {
    setTimeout(() => {
        hideDropdown()
    }, 200)
}

// 隐藏下拉框
const hideDropdown = () => {
    showDropdown.value = false
    showAdvancedOptions.value = false
}

// 切换高级搜索选项
const toggleAdvancedOptions = () => {
    showAdvancedOptions.value = !showAdvancedOptions.value
}

// 点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.search-bar-container')) {
        hideDropdown()
    }
}

onMounted(() => {
    loadSearchHistory()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
    searchQuery,
    handleSearch,
    clearHistory,
})
</script>

<style scoped lang="scss">
.search-bar-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.search-input-wrapper {
    position: relative;
}

.search-input {
    :deep(.el-input__wrapper) {
        border-radius: 25px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        }

        &.is-focus {
            box-shadow: 0 0 0 2px var(--el-color-primary) inset;
        }
    }

    :deep(.el-input__prefix) {
        color: var(--el-text-color-secondary);
    }

    :deep(.el-input__suffix) {
        margin-right: 8px;
    }
}

.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    margin-top: 4px;
}

.dropdown-section {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-title {
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-size: 14px;
}

.history-list,
.suggestion-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.history-item,
.suggestion-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #f5f7fa;
    }
}

.history-icon,
.suggestion-icon {
    margin-right: 8px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
}

.history-text,
.suggestion-text {
    flex: 1;
    color: var(--el-text-color-primary);
}

.delete-icon {
    color: var(--el-text-color-secondary);
    cursor: pointer;
    font-size: 12px;

    &:hover {
        color: var(--el-color-danger);
    }
}

.hot-search-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.hot-search-tag {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

.advanced-options {
    :deep(.el-form-item) {
        margin-bottom: 12px;
    }

    :deep(.el-form-item__label) {
        font-size: 12px;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .search-bar-container {
        max-width: 100%;
    }

    .search-dropdown {
        max-height: 300px;
    }

    .hot-search-list {
        gap: 6px;
    }

    .hot-search-tag {
        font-size: 12px;
        padding: 4px 8px;
    }
}
</style> 