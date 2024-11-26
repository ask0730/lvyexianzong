<template>
  <div>
    <vue-particles id="tsparticles" @particles-loaded="particlesLoaded" :options="options" />
    <div class="formContainer">
      <h3>企业门户网站管理系统</h3>
      <el-form ref="loginFormRef" :model="loginForm" status-icon :rules="loginRules" label-width="80px" class="loginform">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm()">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import API from '@/api';
import { ElMessage } from 'element-plus';
import { useToolStore } from '@/store';

const useTool = useToolStore();
const options = {
  background: {
    color: {
      value: '#778899',
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'grab',
      },
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40,
      },
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#B0E0E6',
    },
    links: {
      color: '#ffffff',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: 'bounce',
      random: false,
      speed: 6,
      straight: false,
    },
    number: {
      density: {
        enable: true,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
};
const loginForm = reactive({
  username: 'admin',
  password: '123456',
});
const loginFormRef = ref();
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});
const router = useRouter();

const submitForm = () => {
  loginFormRef.value.validate(async valid => {
    if (valid) {
      const res = await API.user.login(loginForm);
      if (res.code === 0) {
        // localStorage.setItem('token', 'token');
        useTool.changeUserInfo(res.data);
        router.push('/index');
      } else {
        ElMessage.error(`${res.msg}`);
      }  
    }
  });
};
</script>

<style lang="scss" scoped>
.formContainer {
  width: 500px;
  height: 300px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba($color: #000000, $alpha: 0.5);
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 5px;

  h3 {
    font-size: 30px;
  }
  .loginform {
    margin-top: 20px;
  }
}

::v-deep .el-form-item__label {
  color: white;
}
</style>
