<template>
  <el-card class="note">
    <el-scrollbar always height="100%">
      <div class="scenario-title">
        Your Answer
        <el-text size="small" tag="i"> Enter the your ideas for Part 1 and Part 2 below </el-text>
      </div>
      <el-input
        ref="textareaRef"
        name="NoteArea"
        v-model="modelValue"
        type="textarea"
        placeholder="Please AVOID leaving this window for the duration of this task – using external tools might reduce your final reward."
        :autosize="{ minRows: textAreaRows, maxRows: textAreaRows }"
        @input="handleInput"
        @keydown.ctrl.a="handleHighlight"
        @keydown.meta.a="handleHighlight"
        @copy="handleCopy"
        @cut="handleCopy"
        @paste="handlePaste"
        @mouseup="handleMouseUp"
        @focusin="$emit('focus-in')"
        @focusout="$emit('focus-out', $event)"
      />
      <div class="note_panel">
        <div class="text-area_info">
          <div>
            <el-icon size="small"><Finished /></el-icon>
            Word count: {{ wordCount }} ( {{ minWords }}-{{ maxWords }} max )
          </div>
          <div>
            <el-icon size="small"><Timer /></el-icon>Try to finish in:&nbsp; <span v-html="timeSeconds"></span>
          </div>
          <div class="notice">
            <el-text size="small">* Please <b>AVOID</b> leaving this window for the duration of this task – using external tools might reduce your final reward.</el-text>
          </div>
        </div>
        <el-form label-width="auto" class="submit_block">
          <el-form-item label="I have finished">
            <el-switch v-model="hasFinished" :before-change="checkTaskFinish" />
          </el-form-item>
          <el-form-item>
            <el-button type="info" :disabled="!hasFinished" round @click="$emit('submit-task')">Submit</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    required: true
  },
  minWords: {
    type: Number,
    required: true
  },
  maxWords: {
    type: Number,
    required: true
  },
  timeSeconds: {
    type: String,
    required: true
  },
  textAreaRows: {
    type: Number,
    required: true
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
  'submit-task',
  'check-finish'
]);

// Refs
const textareaRef = ref(null);
const hasFinished = ref(false);

// Computed
const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
const handleInput = (value) => {
  // Element Plus textarea @input emits the value directly, not an event object
  emit('input', { target: { value } }, value);
};

const handleHighlight = (event) => {
  emit('highlight', event);
};

const handleCopy = (event) => {
  emit('copy', event);
};

const handlePaste = (event) => {
  emit('paste', event);
};

const handleMouseUp = (event) => {
  emit('mouse-up', event);
};

const checkTaskFinish = () => {
  return emit('check-finish');
};

// Expose refs for parent component
defineExpose({
  textareaRef
});
</script>

<style scoped>
.note {
  position: relative;
  box-sizing: border-box;
  flex-grow: 1;
  height: 50%;
  padding: 12px;
  width: 100%;
  overflow-y: scroll;
}

.note >>> .el-textarea {
  height: 100%;
}

.note .notice .el-text {
  display: inline;
}

.note >>> .el-textarea__inner {
  border-radius: 10px;
  border: none;
  background: #E9EEF6;
  padding: 10px;
  resize: none;
  display: block;
  height: 100%;
  min-height: 100% !important;
}

.scenario-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.note_panel {
  width: 100%;
  display: flex;
  margin-top: 8px;
  justify-content: space-between;
}

.text-area_info {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  justify-items: start;
  text-align: left;
}

.text-area_info > div {
  font-size: 0.8rem;
  display: block;
  line-height: 1.6;
  color: #353535;
  margin: 0;
  display: flex;
  align-items: center;
}

.submit_block {
  min-width: 160px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.submit_block >>> .el-form-item {
  margin: 0;
  margin-bottom: 6px;
}
</style>
