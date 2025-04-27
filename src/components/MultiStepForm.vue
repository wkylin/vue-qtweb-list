<script setup>
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ref, onUnmounted, onMounted } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Stepper, StepperDescription, StepperItem, StepperSeparator, StepperTitle } from '@/components/ui/stepper'
import { ExclamationCircleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/solid'
import Carouse from '@/components/Carousel.vue'

import { venuesExchange, sleep } from '@/api'

const formSchema = [
  z.object({
    personNo: z.string({
      required_error: '请输入身份证号',
    })
      .nonempty({ message: '请输入身份证号' })
      .regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/, {
        message: '身份证输入错误'
      })
  }),
]

const stepIndex = ref(1)
const isDialogOpen = ref(false)
const isLoading = ref(false)
const isChecked = ref(false)
const isError = ref(false)

const countdown = ref(5);
let timer = null;

const qtObject = ref(null)

const message = ref('Waiting for Qt backend connection...')
const qtInfo = ref(null)

const expert = ref(null)

const steps = [
  {
    step: 1,
    title: '',
    description: '人证信息核验',
  },
  {
    step: 2,
    title: '',
    description: '评标席位核验',
  },
  {
    step: 3,
    title: '',
    description: '已入会',
  },
  {
    step: 4,
    title: '',
    description: '开始评标',
  },
]

const tradeList = ref([])

const toggleDialog = () => {
  isDialogOpen.value = !isDialogOpen.value
}

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
    } else if(countdown.value === 1) {
      if(systemAutoUrl) {
        // 打开地址
        stepIndex.value = 2;
        isDialogOpen.value = false;
      } else {
        // 打开列表
        stepIndex.value = 3;
        isDialogOpen.value = false;
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

const onSubmit = (values) => {
  console.log('JSON.stringify(values, null, 2)', JSON.stringify(values, null, 2))
}
const params =ref(null)
const checkedInfo = async (values) => {
  stepIndex.value = 2;
  isDialogOpen.value = true;
  isLoading.value = true;

  params.value = {
    userCode: qtInfo?.value?.userCode || "userCode",
    meetingId: qtInfo?.value?.meetingId || "meetingId",
    host: qtInfo?.value?.serverHost ? `${qtInfo?.value?.serverHost}:${qtInfo?.value?.serverPort}` : ''
  };

  try {
    // const res = await venuesExchange({
    //   userCode: qtInfo?.value?.userCode || "",
    //   meetingId: qtInfo?.value?.meetingId || "",
    //   idCard: values.personNo || ''
    // }, qtInfo?.value?.serverHost ? `${qtInfo?.value?.serverHost}:${qtInfo?.value?.serverPort}` : '');

    const res = {
      success: true,
      code: 0,
      message: "身份验证成功",
      data: {
        expertName:"",
        seatCode:"",
        seatName:"",
        startTine:"",
        endTine:"",
        systemUrls: [
          {
            tradeCenterName:"交易中心",// 交易中心
            systemUrl:"https://www.baidu.com/", // 系统地址
            systemName:"系统名称" // 系统名称
          }
        ],
        systemAutoUrl:"" // 客户端设置为自动打开地址时，对应系统地址
      }
    }

    if (!res.data) {
      await sleep(800);
      toast.error(res.message)
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
    toast.error(err.message || '网络异常，请稍后再试！');
  }
};

const sendToQt = () => {
  clearInterval(timer);
  isDialogOpen.value = false;
  isChecked.value = false;
  isDialogOpen.value = false;
  if(expert.value.systemAutoUrl) {
    // 打开地址
    stepIndex.value = 2;
    if (qtObject.value) {
      const msg = "shutdown server";
      qtObject.value.CallQtFuc(msg); // 调用C++的槽函数
    }
  } else {
    // 打开列表
    stepIndex.value = 3;
  }

}

const handleOpenUrl = (url) => {
  if (qtObject.value) {
    const msg = "shutdown server";
    qtObject.value.CallQtFuc(msg); // 调用C++的槽函数
  }
};

// 初始化 QWebChannel
const initQWebChannel = () => {
  if (typeof QWebChannel !== 'undefined' || !qt || !qt.webChannelTransport) {
    const qWebChannel = new QWebChannel(qt.webChannelTransport, (channel) => {
      // 获取 Qt 后端暴露的对象
      qtObject.value = channel.objects.bidJSObject

      // 监听 Qt 后端发送的消息
      qtObject.value.CallQtFuc.connect((msg) => {
        message.value = `Message from Qt: ${msg}`
        qtInfo.value = msg
      })
    })
  } else {
    console.error('QWebChannel is not defined!')
  }
}
// 组件挂载时初始化 QWebChannel
onMounted(() => {
  try {
    initQWebChannel()
  } catch (error) {
    console.error('Failed to initialize QWebChannel:', error)
  }
})

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<template>
  <section class="my-10">
    <h2>Communicate with Qt Backend</h2>
    <p>{{ message }}</p>
  </section>

  <Form
    v-slot="{ meta, values, validate }"
    as=""
    keep-values
    :validation-schema="stepIndex === 1 && toTypedSchema(formSchema[stepIndex - 1])"
  >
    <Stepper
      v-slot="{ isNextDisabled, isPrevDisabled, nextStep, prevStep }"
      v-model="stepIndex"
      class="flex w-full justify-center items-center"
    >
      <form
        @submit="(e) => {
          e.preventDefault()
          validate()
        }"
      >
        <div class="flex w-[800px] gap-2 items-center justify-center">
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative flex w-full flex-col items-center justify-center"
            :step="step.step"
            :disabled="true"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full group-data-[state=completed]:bg-green-600/80"
            />

            <Button
              :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
              size="icon"
              class="z-10 rounded-full shrink-0"
              :class="[state === 'active' ? 'ring-blue-600/20 ring-4  bg-blue-600/80 hover:bg-blue-600/80' : 'group-data-[state=completed]:bg-green-600/80 group-data-[state=completed]:hover:bg-green-600/80']"
            >
              {{ step.step }}
            </Button>

            <div class="mt-5 flex flex-col items-center text-center">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base text-blue-600/80"
              >
                {{ step.title }}
              </StepperTitle>
              <StepperDescription
                :class="{
                    'sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm group-data-[state=active]:text-blue-600/80 group-data-[state=completed]:text-green-600/80': true
                }"
              >
                {{ step.description }}
              </StepperDescription>
            </div>
          </StepperItem>
        </div>

        <div class="flex flex-col gap-4 mt-4">
          <template v-if="stepIndex === 1">
            <FormField
              v-slot="{ componentField, errors }"
              name="personNo"
            >
              <section class="flex justify-center items-center">
                <div class="text-center text-blue-600/80 my-4 py-2 px-4 border-b-[2px] border-blue-600/80">
                  身份验证
                </div>
              </section>
              <FormItem>
                <div class="flex items-center">
                  <FormLabel class="w-18 text-right">身份证号:</FormLabel>
                  <FormControl>
                    <Input type="text" class="flex-1" v-bind="componentField" />
                  </FormControl>
                </div>
                <div class="flex items-center">
                <FormMessage v-if="errors.length" class="text-red-500 text-sm pl-[78px]">
                  {{ errors[0] }}
                </FormMessage>
                </div>
              </FormItem>
            </FormField>
            <div class="flex items-center justify-center mt-4">
              <div class="flex items-center justify-center gap-3">
                <Button class="w-[200px] cursor-pointer bg-blue-600/80 hover:bg-blue-600/80" :type="meta.valid ? 'button' : 'submit'" @click="meta.valid && checkedInfo(values)">
                  验证
                </Button>
              </div>
            </div>
          </template>

          <section v-if="stepIndex === 3" class="w-[800px] my-10">
            <Carouse :tradeList="tradeList || []"  :openUrl="handleOpenUrl" />
          </section>
        </div>
      </form>
    </Stepper>
  </Form>
  <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black" :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"></div>
    <div class="relative z-10 bg-white rounded-lg shadow-lg p-6 max-w-md w-full p-8">

      <div v-if="isLoading">
        <section class="flex justify-center items-center my-2 "><ArrowPathIcon class="size-8 text-blue-500" /></section>
        <h2 class="text-lg mb-4">核验中</h2>
        <p class="text-gray-700">正在核验专家信息和席位信息</p>
      </div>
      <div v-if="isChecked">
        <section class="flex justify-center items-center my-2"><CheckCircleIcon class="size-10 text-green-500" /></section>
        <h2 class="text-lg mb-4">核验通过</h2>
        <p class="text-gray-700">您的项目评审时间为：{{ expert.startTine  }} - {{ expert.endTine }}</p>
        <Button class="w-[100px] cursor-pointer bg-blue-600/80 hover:bg-blue-600/80 mt-8" type="button" size="sm" @click="sendToQt">
          确定({{ countdown }}s)
        </Button>
      </div>
      <div v-if="isError">
        <section class="flex justify-center items-center my-2"><ExclamationCircleIcon class="size-10 text-yellow-500" /></section>
        <h2 class="text-lg mb-4">席位信息不匹配</h2>
        <p class="text-gray-700">{{ expert.expertName }}专家您好，您的席位为：<span class="text-blue-600">{{ expert.seatName }} {{expert.seatCode}}</span>({{ expert.startTine  }} - {{ expert.endTine }})</p>
        <Button
          class="w-[100px] cursor-pointer bg-gray-600/80 hover:bg-gray-600/80 mt-8"
          type="button"
          size="sm"
          @click="closeError"
        >
          取消({{ countdown }}s)
        </Button>
      </div>
    </div>
  </div>

</template>