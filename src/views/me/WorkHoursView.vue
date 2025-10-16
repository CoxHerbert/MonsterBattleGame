<template>
  <div class="work-hours-page">
    <header class="page-header">
      <RouterLink class="back" :to="{ name: 'home' }">返回</RouterLink>
      <h1>工时查询</h1>
    </header>

    <section class="calendar-card">
      <label class="calendar-label" for="work-hours-date">选择日期</label>
      <input
        id="work-hours-date"
        v-model="selectedDate"
        class="calendar-input"
        type="date"
        :max="today"
        :disabled="isLoading"
      />
    </section>

    <section class="card sign-detail">
      <h2 class="card-title">打卡明细</h2>
      <div class="card-content">
        <div class="field">
          <div class="label">打卡时间：</div>
          <div class="value" :class="{ 'value-zero': !hasPunchCard }">{{ punchCardDisplay }}</div>
        </div>
      </div>
    </section>

    <section class="cards">
      <article class="card" v-for="group in groups" :key="group.label">
        <h2 class="card-title">{{ group.label }}</h2>
        <div class="card-content">
          <div class="field" v-for="col in group.columns" :key="col.prop">
            <div class="label">{{ col.label }}</div>
            <div :class="['value', isZero(pageInfo[col.prop]) && 'value-zero']">
              {{ formatStat(pageInfo[col.prop]) }}
            </div>
          </div>
        </div>
      </article>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <div v-if="isLoading" class="loading">加载中...</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { createEmptyAttendance, fetchDailyAttendance } from '@/utils/attendance.js';

const groups = [
  {
    label: '出勤数据',
    columns: [
      { label: '正常时数', prop: 'normalHours' },
      { label: '出差正常时数', prop: 'travelNormalHours' },
      { label: '有薪请假时数', prop: 'paidLeaveHours' },
      { label: '无薪请假时数', prop: 'unpaidLeaveHours' },
      { label: '休息日休息时数', prop: 'restHours' },
      { label: '节假日休息时数', prop: 'holidayHours' },
      { label: '有薪停工时数', prop: 'paidStopHours' },
      { label: '无薪停工时数', prop: 'unpaidStopHours' },
    ],
  },
  {
    label: '加班数据',
    columns: [
      { label: '刷卡加班时数', prop: 'cardOverHours' },
      { label: '加班申请时数', prop: 'applyOverHours' },
      { label: '平日加班时数', prop: 'normalOverHours' },
      { label: '出差加班时数', prop: 'travelOverHours' },
      { label: '休息日加班时数', prop: 'restOverHours' },
      { label: '节假日加班时数', prop: 'holidayOverHours' },
      { label: '加班转补休时数', prop: 'overToLeaveHours' },
      { label: '假期结算时数', prop: 'leaveSettlementHours' },
    ],
  },
  {
    label: '异常数据',
    columns: [
      { label: '迟到分钟', prop: 'lateMinutes' },
      { label: '迟到次数', prop: 'lateCount' },
      { label: '早退分钟', prop: 'leaveEarlyMinutes' },
      { label: '早退次数', prop: 'leaveEarlyCount' },
      { label: '旷工时数', prop: 'absenteeismHours' },
    ],
  },
  {
    label: '修正考勤数据',
    columns: [
      { label: '修正正班时数', prop: 'correctionNormalHours' },
      { label: '修正平时加班时数', prop: 'correctionNormalOverHours' },
      { label: '修正周末加班时数', prop: 'correctionWeekendOverHours' },
      { label: '修正节假日加班时数', prop: 'correctionHolidayOverHours' },
    ],
  },
];

function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const today = formatDate();
const selectedDate = ref(today);
const pageInfo = reactive(createEmptyAttendance());
const isLoading = ref(false);
const error = ref('');

const hasPunchCard = computed(() => {
  const value = pageInfo.punchCardData;
  return Boolean(value && value !== '--');
});

const punchCardDisplay = computed(() => (hasPunchCard.value ? pageInfo.punchCardData : '暂无打卡记录'));

watch(
  selectedDate,
  (date) => {
    if (!date) return;
    loadAttendance(date);
  },
  { immediate: true }
);

async function loadAttendance(date) {
  isLoading.value = true;
  error.value = '';
  Object.assign(pageInfo, createEmptyAttendance());

  try {
    const data = await fetchDailyAttendance(date);
    Object.assign(pageInfo, data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取工时数据失败';
  } finally {
    isLoading.value = false;
  }
}

function isZero(value) {
  return value === 0 || value === '0' || value === undefined || value === null;
}

function formatStat(value) {
  return isZero(value) ? 0 : value;
}
</script>

<style scoped>
.work-hours-page {
  margin: 0 auto;
  padding: 24px;
  max-width: 780px;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-1, #1f2937);
}

.back {
  color: var(--accent, #3060ed);
  text-decoration: none;
  font-size: 0.95rem;
}

.calendar-card {
  margin-top: 16px;
  padding: 16px 20px;
  background: var(--bg-elev, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calendar-label {
  font-weight: 600;
  color: var(--text-2, #4b5563);
}

.calendar-input {
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border, #d1d5db);
  font-size: 0.95rem;
}

.cards {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  width: 100%;
  background: var(--bg-elev, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 16px;
  box-shadow: var(--shadow, 0 10px 30px rgba(15, 23, 42, 0.08));
}

.card-title {
  margin: 0;
  padding: 18px 24px 0;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-1, #1f2937);
}

.card-content {
  padding: 12px 24px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 10%;
}

.field {
  flex: 0 1 45%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field .label {
  font-size: 0.9rem;
  color: var(--text-3, #6b7280);
}

.field .value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1, #1f2937);
}

.field .value-zero {
  color: var(--text-3, #9ca3af);
  font-weight: 500;
}

.sign-detail .card-content {
  padding-bottom: 12px;
}

.loading {
  margin-top: 16px;
  color: var(--accent, #3060ed);
}

.error {
  margin-top: 16px;
  color: #dc2626;
}

@media (max-width: 600px) {
  .work-hours-page {
    padding: 16px;
  }

  .field {
    flex-basis: 100%;
  }
}
</style>
