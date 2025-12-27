<template>
  <div class="chat-area cloudy-glass invisible">
    <div style="padding:5px 4px">
      <el-popover
        placement="top-start"
        title="AI Assistant"
        :width="400"
        trigger="hover"
        content="AI Assistant is a chatbot powered by GPT-4o. It can help you with various tasks. especially for text-related tasks."
      >
        <template #reference>
          <el-text size="large" tag="b" class="chat-title">
            AI Assistant
            <el-tag size="small" type='info' effect="dark" round>Powered by ChatGPT</el-tag>
          </el-text>
        </template>
      </el-popover>
    </div>

    <el-scrollbar max-height="100%" height="100%" ref="scrollContainer">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @mouse-up="$emit('mouse-up', $event)"
        @copy="$emit('copy', $event)"
      />
    </el-scrollbar>

    <ChatInput
      ref="chatInputRef"
      v-model="userInput"
      :message-sending="messageSending"
      input-id="PromptArea"
      input-name="PromptArea"
      @input="$emit('prompt-input', $event, $event.target.value)"
      @highlight="$emit('highlight', $event)"
      @copy="$emit('copy', $event)"
      @paste="$emit('paste', $event)"
      @mouse-up="$emit('mouse-up', $event)"
      @focus-in="$emit('focus-in')"
      @focus-out="$emit('focus-out', $event)"
      @send-message="$emit('send-message')"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

// Props
const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  },
  messageSending: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'prompt-input',
  'highlight',
  'copy',
  'paste',
  'mouse-up',
  'focus-in',
  'focus-out',
  'send-message'
]);

// Refs
const scrollContainer = ref(null);
const chatInputRef = ref(null);

// Computed
const userInput = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Expose refs
defineExpose({
  scrollContainer,
  chatInputRef
});
</script>

<style scoped>
.chat-area {
  margin: 10px;
  height: calc(100vh - 120px);
  max-height: calc(100vh - 120px);
  position: relative;
  padding-bottom: 150px !important;
}

.cloudy-glass {
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 4px 2px 0 rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 10px 0;
}

.chat-area >>> .el-card {
  background: #ffffff;
  box-shadow: none;
  border: none;
  border-radius: 10px;
  margin: 8px 4px;
  unicode-bidi: isolate;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.5rem;
}

.chat-area >>> .bar.el-card {
  box-shadow: rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
}

@media (max-width: 992px) {
  .invisible {
    display: none !important;
  }
}
</style>
