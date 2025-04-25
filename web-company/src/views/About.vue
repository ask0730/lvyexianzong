<template>
    <div class="page-container">
        <div class="content">
            <div class="about-header">
                <div class="overlay">
                    <h1>关于我们</h1>
                    <p>创新科技，服务未来</p>
                </div>
            </div>

            <div class="about-content">
                <section class="company-intro">
                    <h2>团队简介</h2>
                    <div class="section-content">
                        <!-- <img src="@/assets/about/company.jpg" alt="团队照片"> -->
                        <p>绿野仙踪团队成立于2020年，专注于环保科技创新的高新技术。我们致力于通过技术创新推动环境保护，为建设美丽中国贡献力量。</p>
                    </div>
                </section>

                <section class="company-culture">
                    <h2>企业文化</h2>
                    <div class="culture-grid">
                        <div class="culture-item">
                            <el-icon>
                                <Aim />
                            </el-icon>
                            <h3>愿景</h3>
                            <p>成为环保科技领域的引领者</p>
                        </div>
                        <div class="culture-item">
                            <el-icon>
                                <Trophy />
                            </el-icon>
                            <h3>使命</h3>
                            <p>用科技守护绿水青山</p>
                        </div>
                        <div class="culture-item">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            <h3>价值观</h3>
                            <p>创新、责任、协作、共赢</p>
                        </div>
                    </div>
                </section>

                <section class="company-advantage">
                    <h2>我们的优势</h2>
                    <div class="advantage-list">
                        <div class="advantage-item">
                            <div class="icon-wrapper">
                                <el-icon>
                                    <Monitor />
                                </el-icon>
                            </div>
                            <div class="text-content">
                                <h3>技术创新</h3>
                                <p>拥有多项自主知识产权，持续推动技术创新</p>
                            </div>
                        </div>
                        <div class="advantage-item">
                            <div class="icon-wrapper">
                                <el-icon>
                                    <User />
                                </el-icon>
                            </div>
                            <div class="text-content">
                                <h3>专业团队</h3>
                                <p>汇聚行业精英，打造专业技术团队</p>
                            </div>
                        </div>
                        <div class="advantage-item">
                            <div class="icon-wrapper">
                                <el-icon>
                                    <Service />
                                </el-icon>
                            </div>
                            <div class="text-content">
                                <h3>优质服务</h3>
                                <p>提供全方位的技术支持和售后服务</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="contact-us">
                    <h2>联系我们</h2>
                    <div class="contact-info">
                        <div class="info-item">
                            <el-icon>
                                <Location />
                            </el-icon>
                            <span>地址：天津职业技术师范大学</span>
                        </div>
                        <div class="info-item">
                            <el-icon>
                                <Phone />
                            </el-icon>
                            <span>电话：400-888-8888</span>
                        </div>
                        <div class="info-item">
                            <el-icon>
                                <Message />
                            </el-icon>
                            <span>邮箱：contact@company.com</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { Aim, Trophy, Setting, Monitor, User, Service, Location, Phone, Message } from '@element-plus/icons-vue'
import Footer from '@/components/Footer.vue'
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

.about-header {
    height: 400px;
    background-image: url('@/assets/about/header-bg.jpg');
    background-size: cover;
    background-position: center;
    position: relative;

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;

        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }

        p {
            font-size: 24px;
        }
    }
}

.about-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;

    section {
        margin-bottom: 60px;

        h2 {
            text-align: center;
            font-size: 32px;
            margin-bottom: 40px;
            color: var(--el-color-primary);
        }
    }
}

.company-intro {
    .section-content {
        display: flex;
        gap: 40px;
        align-items: center;

        img {
            width: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        p {
            font-size: 16px;
            line-height: 1.8;
        }
    }
}

.culture-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;

    .culture-item {
        text-align: center;
        padding: 30px;
        background: #f5f7fa;
        border-radius: 8px;
        transition: transform 0.3s ease;

        &:hover {
            transform: translateY(-5px);
        }

        .el-icon {
            font-size: 40px;
            color: var(--el-color-primary);
            margin-bottom: 20px;
        }

        h3 {
            margin-bottom: 15px;
            color: #333;
        }

        p {
            color: #666;
        }
    }
}

.advantage-list {
    .advantage-item {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;

        &:hover {
            transform: translateX(10px);
        }

        .icon-wrapper {
            width: 60px;
            height: 60px;
            background: var(--el-color-primary-light-9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;

            .el-icon {
                font-size: 30px;
                color: var(--el-color-primary);
            }
        }

        .text-content {
            h3 {
                margin-bottom: 8px;
                color: #333;
            }

            p {
                color: #666;
                margin: 0;
            }
        }
    }
}

.contact-info {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;

    .info-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;

        .el-icon {
            color: var(--el-color-primary);
            font-size: 24px;
        }
    }
}

// 响应式设计
@media screen and (max-width: 768px) {
    .about-header {
        height: 300px;

        .overlay {
            h1 {
                font-size: 36px;
            }

            p {
                font-size: 18px;
            }
        }
    }

    .company-intro {
        .section-content {
            flex-direction: column;

            img {
                width: 100%;
            }
        }
    }

    .culture-grid {
        grid-template-columns: 1fr;
    }

    .contact-info {
        flex-direction: column;
        align-items: center;
    }
}
</style> 