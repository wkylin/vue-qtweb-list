<template>
  <div class="car-container">
    <div class="car-content">
      <span
        class="rounded-full"
        @click="prevPage"
        :disabled="currentPage === 0"
      >
        <el-icon :size="40" class="h-5 w-5 p-2 border rounded-full" :class="currentPage === 0 ? 'cursor-disabled' : 'text-blue-600'"><ArrowLeft /></el-icon>
      </span>

      <div class="flex-grow overflow-hidden relative mx-4">
        <div
          class="flex transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${currentPage * 100}%)` }"
        >
          <div
            v-for="(page, pageIndex) in paginatedData"
            :key="pageIndex"
            class="min-w-full flex flex-wrap justify-center"
          >
            <div
              v-for="(item, itemIndex) in page"
              :key="itemIndex"
              class="w-1/3 p-2"
            >
              <div class="cus-bg border border-sky-500 p-4 rounded-md text-center shadow-md mx-auto" @click="handleClick(item.systemUrl)">
                <!-- {{ item.name }} - {{ item.category }} -->
                <div class="text-sky-500 text-xl mb-2">{{ item.tradeCenterName }}</div>
                <div class="text-gray-500">{{ item.systemName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span
        class="rounded-full"
        @click="nextPage"
        :disabled="currentPage === totalPages - 1 || data.length === 0"
      >
        <el-icon :size="40" class="h-5 w-5 p-2 border rounded-full" :class="currentPage === totalPages - 1 ? 'cursor-disabled': 'cursor-pointer text-blue-600'"><ArrowRight /></el-icon>
      </span>
    </div>

    <!-- 分页指示器 -->
    <div class="flex justify-center mt-4 space-x-2">
      <span
        v-for="(dot, index) in totalPages"
        :key="index"
        class="w-2 h-2 rounded-full ring ring-blue-600/80 hover:bg-blue-600/80 transition-colors duration-300"
        :class="{
          'bg-blue-600/80': currentPage === index,
          'bg-white': currentPage !== index,
        }"
        @click="goToPage(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  tradeList: {
    type: Array,
    required: true
  },
  openUrl: {
    type: Function,
    required: true
  }
});

const data = ref([...props.tradeList]);

const handleClick = (trade) => {
  props.openUrl(trade);
};

// 原始数据
// const mockData = Array.from({ length: 30 }, (_, i) => ({
//   name: `Item ${i + 1}`,
//   category: ['A','B','C'][i % 3]
// }));

// const data = ref([...mockData]);
// const selectedFilter = ref('all');
// const filters = [
//   { label: '分类 A', value: 'A' },
//   { label: '分类 B', value: 'B' },
//   { label: '分类 C', value: 'C' },
// ];

// 过滤逻辑
const filteredData = ref([...data.value]);

const filterData = () => {
  if (selectedFilter.value === 'all') {
    filteredData.value = [...data.value];
  } else {
    filteredData.value = data.value.filter(item => item.category === selectedFilter.value);
  }

  // 重置分页
  currentPage.value = 0;
};

// 清除处理
const handleClear = () => {
  selectedFilter.value = 'all';
  filterData();
};

// 分页配置
const itemsPerPage = 6;
const currentPage = ref(0);

const paginatedData = computed(() => {
  const pages = [];
  for (let i = 0; i < filteredData.value.length; i += itemsPerPage) {
    pages.push(filteredData.value.slice(i, i + itemsPerPage));
  }
  return pages;
});

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage)
);

// 分页控制
const prevPage = () => currentPage.value = Math.max(0, currentPage.value - 1);
const nextPage = () => currentPage.value = Math.min(totalPages.value - 1, currentPage.value + 1);
const goToPage = (index) => currentPage.value = index;
</script>

<style scoped>
.car-container {
  position: relative;
  width: 100%;
  margin: 60px auto 10px;
}
.car-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.w-1\/3 {
  width: 31.333%;
}

.h-5{
  height: 20px;
}
.w-5 {
  width: 20px;
}
.h-2{
  height: 6px;
}
.w-2 {
  width: 6px;
}
.text-blue-600\/80 {
  color: rgba(37, 99, 235, 0.8);
}
.text-blue-600 {
  color: #2563eb;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.rounded-full {
  border-radius: 9999px;
}

button.w-2.h-2.rounded-full {
  transition: all 0.3s ease-in-out;
}

button.bg-blue-600\/80 {
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.cus-bg {
  background-image: url(@/assets/trade.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
/* Flexbox 布局相关 */
.flex-grow {
  flex-grow: 1;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

/* 宽高相关 */
.w-full {
  width: 100%;
}

.min-w-full {
  min-width: 100%;
}

.h-8 {
  height: 2rem;
}

.w-8 {
  width: 2rem;
}

/* 内边距和外边距 */
.p-2 {
  padding: 5px;
}

.p-4 {
  padding: 10px;
}

.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

/* 边框和圆角 */
.border {
  border: 1px solid #a6a8ab;
}

.border-sky-500 {
  border-color: #0ea5e9; /* Tailwind 的 sky-500 颜色 */
}

.rounded-md {
  border-radius: 0.375rem;
}

/* 阴影 */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
}

/* 背景颜色 */
.bg-white {
  background-color: #ffffff;
}

.bg-blue-600\/80 {
  background-color: rgba(37, 99, 235, 0.8); /* Tailwind 的 blue-600/80 颜色 */
}

.hover\:bg-blue-600\/80:hover {
  background-color: rgba(37, 99, 235, 0.8); /* Tailwind 的 blue-600/80 颜色 */
}

/* 文本样式 */
.text-center {
  text-align: center;
}

.text-sky-500 {
  color: #0ea5e9; /* Tailwind 的 sky-500 颜色 */
}

.text-gray-500 {
  color: #6b7280; /* Tailwind 的 gray-500 颜色 */
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}


/* 环形边框 */
.ring {
  box-shadow: 0 0 0 2px currentColor;
}

.ring-blue-600\/80 {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.8); /* Tailwind 的 blue-600/80 颜色 */
}

/* 溢出隐藏 */
.overflow-hidden {
  overflow: hidden;
}

/* 相对定位 */
.relative {
  position: relative;
}

/* 动画效果 */
.transition-transform {
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}

.duration-300 {
  transition-duration: 0.3s;
}

.ease-in-out {
  transition-timing-function: ease-in-out;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}

.cursor-disabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.5;
}
.cursor-pointer {
  cursor: pointer;
}
</style>