<template>
  <el-card class="scenario">
    <div class="scenario-scroll">
      <div class="scenario-title">
        Your Task
      </div>
      <div v-html="scenarioText"></div>
    </div>
  </el-card>
</template>

<script setup>
// Props
defineProps({
  scenarioText: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.scenario {
  position: relative;
  box-sizing: border-box;
  flex-grow: 1;
  height: 50%;
  padding: 12px;
  width: 100%;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  overflow: hidden;
  padding: 10px 20px;
  cursor: not-allowed;
}

.scenario >>> .el-card__body {
  overflow: hidden;
  height: 100%;
  padding: 0;
}

.scenario-scroll {
  padding: 0;
  height: 100%;
  overflow-y: scroll;
  padding-bottom: 60px;
}

.scenario::before {
  content: "";
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(rgba(179, 179, 179, 0.001), rgb(255, 255, 255));
  position: absolute;
  z-index: 1;
}

.scenario-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Custom scrollbar */
.scenario::-webkit-scrollbar {
  width: 12px;
  left: -100px;
  z-index: 1000;
}

.scenario::-webkit-scrollbar-track {
  background: #d6dfec;
  border-radius: 8px;
  margin-block: 15px;
}

.scenario::-webkit-scrollbar-thumb {
  position: absolute;
  right: 3px;
  border-radius: 8px;
  border: 4px solid #ffd885;
  background-clip: content-box;
  background-color: rgb(255, 255, 255);
}
</style>
