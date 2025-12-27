<template>
  <el-card class="bar">
    <el-input
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 6 }"
      :id="inputId"
      class="prompt_input"
      :name="inputName"
      v-model="inputValue"
      placeholder="Type your message here..."
      resize="none"
      @input="handleInput"
      @keydown.ctrl.a="$emit('highlight', $event)"
      @keydown.meta.a="$emit('highlight', $event)"
      @copy="$emit('copy', $event)"
      @cut="$emit('copy', $event)"
      @paste="$emit('paste', $event)"
      @mouseup="$emit('mouse-up', $event)"
      @focusin="$emit('focus-in')"
      @focusout="$emit('focus-out', $event)"
    >
    </el-input>
    <el-button
      class="submit-chatbot"
      :disabled="messageSending"
      :loading="messageSending"
      @click="$emit('send-message')"
    >
      <Promotion v-show="!messageSending" style="width:24px; vertical-align:middle; padding:0;" />
    </el-button>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  messageSending: {
    type: Boolean,
    required: true
  },
  inputId: {
    type: String,
    default: 'PromptArea'
  },
  inputName: {
    type: String,
    default: 'PromptArea'
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'input',
  'highlight',
  'copy',
  'paste',
  'mouse-up',
  'focus-in',
  'focus-out',
  'send-message'
]);

// Computed
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
const handleInput = (value) => {
  // Element Plus textarea @input emits the value directly, not an event object
  emit('input', { target: { value } }, value);
};
</script>

<style scoped>
.bar {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  position: absolute;
  bottom: -8px;
  left: -4px;
  right: -4px;
  z-index: 1;
}

.bar >>> .el-textarea__inner {
  width: 100%;
  border: none;
  box-shadow: none;
  border-radius: 12px;
  background: #E9EEF6;
  padding: 16px 12px;
  padding-right: 60px;
  font-size: 1rem;
}

.bar >>> .el-input__wrapper,
.bar >>> .el-input-group__append {
  border-radius: 0;
  font-size: 1rem;
  box-shadow: none;
  background: transparent;
  line-height: 4;
  padding: 4px 8px;
  color: #5F6367;
}

.bar >>> .el-input-group__append {
  background: #1b1b1b;
  color: #ffffff;
  border-radius: 16px;
  padding: 0px 12px 8px 12px;
  vertical-align: middle;
}

.bar >>> .el-input-group__append > span {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.submit-chatbot {
  background: #48566d;
  color: #ffffff;
  vertical-align: middle;
  border-radius: 10px;
  padding: 16px 4px;
  position: absolute;
  bottom: 28px;
  right: 30px;
  z-index: 100;
}

.submit-chatbot >>> .el-icon.is-loading {
  width: 24px;
  height: auto;
  vertical-align: middle;
  padding: 0;
  font-size: 1.1rem;
}
</style>
