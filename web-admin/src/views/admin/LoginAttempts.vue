<template>
    <div class="login-attempts-container">
        <div class="page-header">
            <h2>登录尝试管理</h2>
            <div class="header-actions">
                <el-button type="primary" @click="refreshData">刷新数据</el-button>
                <el-button type="warning" @click="showCleanupDialog">清理过期记录</el-button>
                <el-button type="danger" @click="initMenu">初始化菜单</el-button>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-card class="stat-card">
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.hourly?.success || 0 }}</div>
                            <div class="stat-label">最近1小时成功登录</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stat-card">
                        <div class="stat-content">
                            <div class="stat-number error">{{ stats.hourly?.failed || 0 }}</div>
                            <div class="stat-label">最近1小时失败登录</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stat-card">
                        <div class="stat-content">
                            <div class="stat-number">{{ stats.daily?.success || 0 }}</div>
                            <div class="stat-label">最近24小时成功登录</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card class="stat-card">
                        <div class="stat-content">
                            <div class="stat-number error">{{ stats.daily?.failed || 0 }}</div>
                            <div class="stat-label">最近24小时失败登录</div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="最近登录尝试" name="recent">
                <div class="tab-content">
                    <div class="table-header">
                        <h3>最近登录尝试记录</h3>
                        <el-pagination
                            :current-page="recentPage"
                            :page-size="recentPageSize"
                            :page-sizes="[20, 50, 100]"
                            :total="recentTotal"
                            layout="total, sizes, prev, pager, next"
                            @size-change="handleRecentSizeChange"
                            @current-change="handleRecentPageChange"
                        />
                    </div>
                    <el-table :data="recentAttempts" stripe>
                        <el-table-column prop="username" label="用户名" width="120" />
                        <el-table-column prop="ip" label="IP地址" width="140" />
                        <el-table-column prop="attemptTime" label="尝试时间" width="180">
                            <template #default="scope">{{ formatTime(scope.row.attemptTime) }}</template>
                        </el-table-column>
                        <el-table-column prop="success" label="状态" width="80">
                            <template #default="scope">
                                <el-tag :type="scope.row.success ? 'success' : 'danger'">{{ scope.row.success ? '成功' : '失败' }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="reason" label="原因" />
                        <el-table-column prop="userAgent" label="用户代理" show-overflow-tooltip />
                    </el-table>
                </div>
            </el-tab-pane>

            <el-tab-pane label="被锁定用户" name="locked-users">
                <div class="tab-content">
                    <div class="table-header">
                        <h3>被锁定的用户</h3>
                        <el-button type="primary" @click="refreshLockedUsers">刷新</el-button>
                    </div>
                    <el-table :data="lockedUsers" stripe>
                        <el-table-column prop="_id" label="用户名" width="120" />
                        <el-table-column prop="attempts" label="失败次数" width="100" />
                        <el-table-column prop="lastAttempt" label="最后尝试时间" width="180">
                            <template #default="scope">{{ formatTime(scope.row.lastAttempt) }}</template>
                        </el-table-column>
                        <el-table-column prop="reasons" label="失败原因" show-overflow-tooltip>
                            <template #default="scope">{{ scope.row.reasons.join(', ') }}</template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="success" size="small" @click="unlockUser(scope.row._id)">解锁</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>

            <el-tab-pane label="被锁定IP" name="locked-ips">
                <div class="tab-content">
                    <div class="table-header">
                        <h3>被锁定的IP地址</h3>
                        <el-button type="primary" @click="refreshLockedIPs">刷新</el-button>
                    </div>
                    <el-table :data="lockedIPs" stripe>
                        <el-table-column prop="_id" label="IP地址" width="140" />
                        <el-table-column prop="attempts" label="失败次数" width="100" />
                        <el-table-column prop="lastAttempt" label="最后尝试时间" width="180">
                            <template #default="scope">{{ formatTime(scope.row.lastAttempt) }}</template>
                        </el-table-column>
                        <el-table-column prop="usernames" label="尝试用户" show-overflow-tooltip>
                            <template #default="scope">{{ scope.row.usernames.join(', ') }}</template>
                        </el-table-column>
                        <el-table-column prop="reasons" label="失败原因" show-overflow-tooltip>
                            <template #default="scope">{{ scope.row.reasons.join(', ') }}</template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="success" size="small" @click="unlockIP(scope.row._id)">解锁</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>

            <el-tab-pane label="查询工具" name="query">
                <div class="tab-content">
                    <div class="query-section">
                        <h3>查询特定用户登录尝试</h3>
                        <div class="query-form">
                            <el-input v-model="queryUsername" placeholder="请输入用户名" style="width: 200px; margin-right: 10px;" />
                            <el-button type="primary" @click="queryUserAttempts">查询</el-button>
                        </div>
                        <el-table v-if="userAttempts.length > 0" :data="userAttempts" stripe style="margin-top: 20px;">
                            <el-table-column prop="attemptTime" label="尝试时间" width="180">
                                <template #default="scope">{{ formatTime(scope.row.attemptTime) }}</template>
                            </el-table-column>
                            <el-table-column prop="ip" label="IP地址" width="140" />
                            <el-table-column prop="success" label="状态" width="80">
                                <template #default="scope">
                                    <el-tag :type="scope.row.success ? 'success' : 'danger'">{{ scope.row.success ? '成功' : '失败' }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="reason" label="原因" />
                        </el-table>
                    </div>

                    <div class="query-section" style="margin-top: 40px;">
                        <h3>查询特定IP登录尝试</h3>
                        <div class="query-form">
                            <el-input v-model="queryIP" placeholder="请输入IP地址" style="width: 200px; margin-right: 10px;" />
                            <el-button type="primary" @click="queryIPAttempts">查询</el-button>
                        </div>
                        <el-table v-if="ipAttempts.length > 0" :data="ipAttempts" stripe style="margin-top: 20px;">
                            <el-table-column prop="attemptTime" label="尝试时间" width="180">
                                <template #default="scope">{{ formatTime(scope.row.attemptTime) }}</template>
                            </el-table-column>
                            <el-table-column prop="username" label="用户名" width="120" />
                            <el-table-column prop="success" label="状态" width="80">
                                <template #default="scope">
                                    <el-tag :type="scope.row.success ? 'success' : 'danger'">{{ scope.row.success ? '成功' : '失败' }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="reason" label="原因" />
                        </el-table>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- 清理对话框 -->
        <el-dialog v-model="cleanupDialogVisible" title="清理过期记录" width="400px">
            <div class="cleanup-form">
                <p>清理多少小时前的记录？</p>
                <el-input-number v-model="cleanupHours" :min="1" :max="168" style="width: 200px;" />
                <p style="margin-top: 10px; color: #666;">默认清理24小时前的记录</p>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cleanupDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="cleanupRecords" :loading="cleanupLoading">确认清理</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import API from '@/api'

// 响应式数据
const activeTab = ref('recent')
const stats = ref({})
const recentAttempts = ref([])
const recentPage = ref(1)
const recentPageSize = ref(50)
const recentTotal = ref(0)
const lockedUsers = ref([])
const lockedIPs = ref([])
const userAttempts = ref([])
const ipAttempts = ref([])
const queryUsername = ref('')
const queryIP = ref('')
const cleanupDialogVisible = ref(false)
const cleanupHours = ref(24)
const cleanupLoading = ref(false)

// 获取统计数据
const fetchStats = async () => {
    try {
        console.log('开始获取统计数据...')
        const res = await API.loginAttempts.stats()
        console.log('统计数据响应:', res)
        if (res.code === 0) {
            stats.value = res.data
        } else {
            ElMessage.error(res.msg || '获取统计数据失败')
        }
    } catch (error) {
        console.error('获取统计数据失败:', error)
        ElMessage.error(`获取统计数据失败: ${error.message || error}`)
    }
}

// 获取最近登录尝试
const fetchRecentAttempts = async () => {
    try {
        const res = await API.loginAttempts.recent({
            page: recentPage.value,
            limit: recentPageSize.value,
        })
        if (res.code === 0) {
            recentAttempts.value = res.data.attempts
            recentTotal.value = res.data.total
        }
    } catch (error) {
        console.error('获取最近登录尝试失败:', error)
        ElMessage.error('获取最近登录尝试失败')
    }
}

// 获取被锁定用户
const fetchLockedUsers = async () => {
    try {
        const res = await API.loginAttempts.lockedUsers()
        if (res.code === 0) {
            lockedUsers.value = res.data
        }
    } catch (error) {
        console.error('获取锁定用户失败:', error)
        ElMessage.error('获取锁定用户失败')
    }
}

// 获取被锁定IP
const fetchLockedIPs = async () => {
    try {
        const res = await API.loginAttempts.lockedIPs()
        if (res.code === 0) {
            lockedIPs.value = res.data
        }
    } catch (error) {
        console.error('获取锁定IP失败:', error)
        ElMessage.error('获取锁定IP失败')
    }
}

// 解锁用户
const unlockUser = async (username) => {
    try {
        await ElMessageBox.confirm(`确定要解锁用户 "${username}" 吗？`, '确认解锁', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const res = await API.loginAttempts.unlockUser({ username })
        if (res.code === 0) {
            ElMessage.success('用户解锁成功')
            fetchLockedUsers()
        } else {
            ElMessage.error(res.msg || '解锁失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('解锁用户失败:', error)
            ElMessage.error('解锁用户失败')
        }
    }
}

// 解锁IP
const unlockIP = async (ip) => {
    try {
        await ElMessageBox.confirm(`确定要解锁IP "${ip}" 吗？`, '确认解锁', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const res = await API.loginAttempts.unlockIP({ ip })
        if (res.code === 0) {
            ElMessage.success('IP解锁成功')
            fetchLockedIPs()
        } else {
            ElMessage.error(res.msg || '解锁失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('解锁IP失败:', error)
            ElMessage.error('解锁IP失败')
        }
    }
}

// 查询用户尝试
const queryUserAttempts = async () => {
    if (!queryUsername.value.trim()) {
        ElMessage.warning('请输入用户名')
        return
    }

    try {
        const res = await API.loginAttempts.userAttempts({ username: queryUsername.value })
        if (res.code === 0) {
            userAttempts.value = res.data
        }
    } catch (error) {
        console.error('查询用户尝试失败:', error)
        ElMessage.error('查询用户尝试失败')
    }
}

// 查询IP尝试
const queryIPAttempts = async () => {
    if (!queryIP.value.trim()) {
        ElMessage.warning('请输入IP地址')
        return
    }

    try {
        const res = await API.loginAttempts.ipAttempts({ ip: queryIP.value })
        if (res.code === 0) {
            ipAttempts.value = res.data
        }
    } catch (error) {
        console.error('查询IP尝试失败:', error)
        ElMessage.error('查询IP尝试失败')
    }
}

// 清理记录
const cleanupRecords = async () => {
    cleanupLoading.value = true
    try {
        const res = await API.loginAttempts.cleanup({ hours: cleanupHours.value })
        if (res.code === 0) {
            ElMessage.success(`清理成功，删除了 ${res.data.deletedCount} 条记录`)
            cleanupDialogVisible.value = false
            refreshData()
        } else {
            ElMessage.error(res.msg || '清理失败')
        }
    } catch (error) {
        console.error('清理记录失败:', error)
        ElMessage.error('清理记录失败')
    } finally {
        cleanupLoading.value = false
    }
}

// 显示清理对话框
const showCleanupDialog = () => {
    cleanupDialogVisible.value = true
}

// 刷新数据
const refreshData = () => {
    fetchStats()
    if (activeTab.value === 'recent') {
        fetchRecentAttempts()
    } else if (activeTab.value === 'locked-users') {
        fetchLockedUsers()
    } else if (activeTab.value === 'locked-ips') {
        fetchLockedIPs()
    }
}

// 刷新锁定用户
const refreshLockedUsers = () => {
    fetchLockedUsers()
}

// 刷新锁定IP
const refreshLockedIPs = () => {
    fetchLockedIPs()
}

// 处理标签页切换
const handleTabClick = (tab) => {
    if (tab.props.name === 'locked-users') {
        fetchLockedUsers()
    } else if (tab.props.name === 'locked-ips') {
        fetchLockedIPs()
    }
}

// 处理分页
const handleRecentSizeChange = (size) => {
    recentPageSize.value = size
    recentPage.value = 1
    fetchRecentAttempts()
}

const handleRecentPageChange = (page) => {
    recentPage.value = page
    fetchRecentAttempts()
}

// 格式化时间
const formatTime = (time) => {
    return new Date(time).toLocaleString('zh-CN')
}

// 初始化菜单
const initMenu = async () => {
    try {
        const res = await API.menu.init({})
        if (res.code === 200) {
            ElMessage.success(res.message || '初始化菜单成功')
        } else {
            ElMessage.error(res.message || '初始化菜单失败')
        }
    } catch (error) {
        ElMessage.error('初始化菜单请求失败')
    }
}

// 组件挂载时加载数据
onMounted(() => {
    fetchStats()
    fetchRecentAttempts()
})
</script>

<style lang="scss" scoped>
.login-attempts-container {
    padding: 20px;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            color: #303133;
        }

        .header-actions {
            display: flex;
            gap: 10px;
        }
    }

    .stats-cards {
        margin-bottom: 20px;

        .stat-card {
            .stat-content {
                text-align: center;

                .stat-number {
                    font-size: 24px;
                    font-weight: bold;
                    color: #67c23a;
                    margin-bottom: 5px;

                    &.error {
                        color: #f56c6c;
                    }
                }

                .stat-label {
                    font-size: 14px;
                    color: #606266;
                }
            }
        }
    }

    .tab-content {
        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            h3 {
                margin: 0;
                color: #303133;
            }
        }

        .query-section {
            h3 {
                margin-bottom: 15px;
                color: #303133;
            }

            .query-form {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
        }
    }

    .cleanup-form {
        text-align: center;

        p {
            margin: 10px 0;
        }
    }
}
</style> 