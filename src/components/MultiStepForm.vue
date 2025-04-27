<template>
  <div class="container">
    <h2>Communicate with Qt Backend</h2>
    <p>{{ message }}</p>
    <p>Request Params:{{ params }}</p>
    <section class="steps">
      <el-steps :active="stepIndex - 1" finish-status="success" align-center>
        <el-step
          v-for="step in steps"
          :key="step.step"
          :title="step.title"
          :description="step.description"
        ></el-step>

      </el-steps>
    </section>
    <section class="form-content" v-if="stepIndex === 1">
      <div class="title">身份验证</div>
    </section>
    <el-form
      v-if="stepIndex === 1"
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="120px"
      class="form"
      hide-required-asterisk
    >
      <el-form-item label="身份证号" prop="personNo">
        <el-input v-model="form.personNo" placeholder="请输入身份证号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="isLoading"
          class="button"
        >
          验证
        </el-button>
      </el-form-item>
    </el-form>

    <section v-if="stepIndex === 3" class="section">
      <Carouse :tradeList="tradeList || []"  :openUrl="handleOpenUrl" />
    </section>
    <el-dialog
      v-model="isDialogOpen"
      width="500"
      align-center
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div v-if="isLoading">
        <el-icon :size="30" color="#409eff" class="is-loading"><Loading /></el-icon>
        <h2>核验中</h2>
        <p>正在核验专家信息和席位信息</p>
      </div>
      <div v-if="isChecked">
        <el-icon :size="30" color="#29bd5d"><SuccessFilled /></el-icon>
        <h2>核验通过</h2>
        <p>您的项目评审时间为：{{ expert?.startTime  }} - {{ expert?.sendTime }}</p>
        <el-button
          type="primary"
          @click="sendToQt"
        >
          确定({{ countdown }}s)
        </el-button>
      </div>
      <div v-if="isError">
        <el-icon :size="30" color="#e8aa1a"><WarningFilled /></el-icon>
        <h2>席位信息不匹配</h2>
        <p>{{ expert?.expertName }}专家您好，您的席位为：<span class="span">{{ expert?.seatName }} {{expert?.seatCode}}</span>({{ expert?.startTime  }} - {{ expert?.sendTime }})</p>
        <el-button
          type="primary"
          @click="closeError"
        >
          取消({{ countdown }}s)
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Carouse from '@/components/Carousel.vue'
import { venuesExchange, sleep } from '@/api'


const message = ref('Waiting for Qt backend connection...')


const countdown = ref(5);
let timer = null;

const isDialogOpen = ref(false)
const isLoading = ref(false)
const isChecked = ref(false)
const isError = ref(false)

const qtInfo = ref(null)
let qtObject = null
const expert = ref(null)

const stepIndex = ref(1)

const steps = [
  {
    step: 1,
    title: '人证信息核验',
    description: '',
  },
  {
    step: 2,
    title: '评标席位核验',
    description: '',
  },
  {
    step: 3,
    title: '已入会',
    description: '',
  },
  {
    step: 4,
    title: '开始评标',
    description: '',
  },
]

const tradeList = ref([])

const form = ref({
  personNo: '',
});
const formRef = ref(null);

const rules = {
  personNo: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/, message: '身份证输入错误', trigger: 'blur' },
  ],
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      checkedInfo(form.value);
    } else {
      return false;
    }
  });
};

const params =ref(null)
const checkedInfo = async (values) => {
  stepIndex.value = 2;
  isDialogOpen.value = true;
  isLoading.value = true;

  params.value = {
    userCode: qtInfo?.value?.userCode || "userCode",
    meetingId: qtInfo?.value?.meetingId || "meetingId",
    host: qtInfo?.value?.serverHost ? `${qtInfo?.value?.serverHost.indexOf('http') !== '-1' ? qtInfo?.value?.serverHost : 'http://'+qtInfo?.value?.serverHost}:${qtInfo?.value?.serverPort || '80'}` : ''
  };

  try {
    // const res = await venuesExchange({
    //   userCode: qtInfo?.value?.userCode || "",
    //   meetingId: qtInfo?.value?.meetingId || "",
    //   idCard: values.personNo || ''
    // }, qtInfo?.value?.serverHost ? `${qtInfo?.value?.serverHost.indexOf('http') !== '-1' ? qtInfo?.value?.serverHost : 'http://'+qtInfo?.value?.serverHost}:${qtInfo?.value?.serverPort || '80'}` : '');

    const res = {
      success: true,
      code: 0,
      message: "身份验证成功",
      data: {
        expertName:"",
        seatCode:"",
        seatName:"",
        startTime:"2025-01-01 11:00:00",
        sendTime:"2025-01-01 12:00:00",
        endTime:"",
        systemUrls: [
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
          {
            tradeCenterName:"交易中心",
            systemUrl:"https://www.baidu.com/",
            systemName:"系统名称"
          },
        ],
        systemAutoUrl:""
      }
    }

    if (!res.data) {
      await sleep(800);
      ElMessage.error(res.message)
      isDialogOpen.value = false;
      isLoading.value = false;
      stepIndex.value = 1;
    } else {
      expert.value = res.data;
      tradeList.value = res.data.systemUrls;

      if (!res.success && res.code === 1) {
        isLoading.value = false;
        isChecked.value = false;
        isError.value = true;
      } else if (res.success && res.code === 0) {
        isLoading.value = false;
        isChecked.value = true;
        isError.value = false;
        startCountdownFix(res.data.systemAutoUrl)
        return
      }
    }
    startCountdown()
  } catch (err) {
    await sleep(800);
    isLoading.value = false;
    isChecked.value = false;
    isDialogOpen.value = false;
    isError.value = false;
    stepIndex.value = 1;
    ElMessage.error(err.message || '网络异常，请稍后再试！');
  }
};
// 启动倒计时
const startCountdown = () => {
  countdown.value = 5;
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
    } else {
      if (isChecked.value) {
        sendToQt()
      }
      if (isError.value) {
        closeError()
      }
    }
  }, 1000);
};

const startCountdownFix = (systemAutoUrl) => {
  countdown.value = 5;
  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
    } else if (countdown.value === 1) {
      isDialogOpen.value = false;
      if (systemAutoUrl) {
        // 打开地址
        stepIndex.value = 2;
        clearInterval(timer);
        if (qtObject) {
          qtObject.pageClosing(systemAutoUrl);
        }
      } else {
        // 打开列表
        stepIndex.value = 3;
      }
    }
  }, 1000);
};

// 手动关闭错误信息
const closeError = () => {
  clearInterval(timer);
  isError.value = false;
  isDialogOpen.value = false;
  stepIndex.value = 1;
};

// 发送信息到Qt
const sendToQt = () => {
  clearInterval(timer);
  isDialogOpen.value = false;
  isChecked.value = false;
  isDialogOpen.value = false;
  if(expert.value.systemAutoUrl) {
    // 打开地址
    stepIndex.value = 2;
    if (qtObject) {
      qtObject.pageClosing(expert.value.systemAutoUrl);
    }
  } else {
    // 打开列表
    stepIndex.value = 3;
  }
}

const handleOpenUrl = (url) => {
  if (qtObject) {
    qtObject.pageClosing(url);
  }
};

const initQWebChannel = () => {
    const qWebChannel = new QWebChannel(qt.webChannelTransport, (channel) => {
      qtObject = channel.objects.bidJSObject;
      qtObject.CallQtFuc((msg) => {
        message.value = `Message from Qt: ${msg}`;
        qtInfo.value = JSON.parse(msg);
      });
    });
};

onMounted(() => {
  try {
    initQWebChannel();
  } catch (error) {
    console.error('Failed to initialize QWebChannel:', error);
  }
});

onUnmounted(() => {
  clearInterval(timer);
});

</script>
<style scoped>
.steps {
  width: 800px;
  margin: 0 auto 50px;
}
.form {
  width: 700px;
  padding-right: 120px;
  margin: 0 auto;
}

/* 修改步骤条的图标颜色 */
:deep(.is-process .el-step__icon) {
  background-color: #409eff;
  color: #fff;
  border: 2px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 0 10px 0 #409eff;
}


/* 修改步骤条的标题颜色 */
:deep(.is-process.el-step__title) {
  color: #409eff;
  font-size: 18px;
  font-weight: normal;
}

.form-content {
  width: 800px;
  margin: 0 auto 30px;
}

.button {
  width: 100%;
}
.span {
  color: #409eff;
}

.title {
  padding: 10px 30px;
  border-bottom:2px solid #409eff;
  display: inline-block;
  color: #409eff;
}
.section {
  width: 800px;
  margin: 10px auto;
  text-align: center;
}
</style>