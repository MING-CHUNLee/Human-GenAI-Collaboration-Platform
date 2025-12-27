<template>
  <el-row :gutter="20" class="brand-area">
    <img src="../../static/logo.png" alt="PopAi" style="width: 40px; height: 40px; margin-right: 10px;" />
    <div class="brand-class">
      Co-here | Your Travel Ideas Workspace
    </div>
    <el-button
      style="margin-left:8px;"
      round
      size="small"
      type="info"
      icon="InfoFilled"
      @click="$emit('open-help')"
    >
      Help
    </el-button>
  </el-row>
</template>

<script setup>
// Emits
defineEmits(['open-help']);
</script>

<style scoped>
.brand-area {
  padding: 0 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.brand-class {
  font-weight: bold;
  font-size: 1.1rem;
  word-wrap: break-word;
  display: inline-block;
}
</style>
