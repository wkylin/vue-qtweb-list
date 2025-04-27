<template>
  <div class="relative w-full max-w-6xl mx-auto">
    <div class="flex justify-end mb-4">
      <Select
        v-model="selectedFilter"
        @update:model-value="filterData"
        class="w-[240px]"
      >
        <SelectTrigger>
          <SelectValue placeholder="请选择分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          <SelectItem v-for="filter in filters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Carousel 主体 -->
    <div class="relative flex items-center justify-between">
      <!-- 左右切换按钮 -->
      <Button
        variant="outline"
        size="icon"
        class="bg-gray-800 text-white hover:bg-gray-700"
        @click="prevPage"
        :disabled="currentPage === 0"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </Button>

      <!-- 数据展示区域 -->
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
              <div class="bg-gray-100 p-4 rounded-md text-center shadow-md mx-auto">
                {{ item.name }} - {{ item.category }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        class="bg-gray-800 text-white hover:bg-gray-700"
        @click="nextPage"
        :disabled="currentPage === totalPages - 1"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </Button>
    </div>

    <!-- 分页指示器 -->
    <div class="flex justify-center mt-4 space-x-2">
      <button
        v-for="(dot, index) in totalPages"
        :key="index"
        class="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-300"
        :class="{ 'bg-blue-500': currentPage === index }"
        @click="goToPage(index)"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

// 原始数据
const mockData = Array.from({ length: 30 }, (_, i) => ({
  name: `Item ${i + 1}`,
  category: ['A','B','C'][i % 3]
}));

const data = ref([...mockData]);
const selectedFilter = ref('all');
const filters = [
  { label: '分类 A', value: 'A' },
  { label: '分类 B', value: 'B' },
  { label: '分类 C', value: 'C' },
];

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
.w-1\/3 {
  width: 33.333%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

button.w-3.h-3.rounded-full {
  transition: all 0.3s ease-in-out;
}

button.bg-blue-500 {
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}
</style>