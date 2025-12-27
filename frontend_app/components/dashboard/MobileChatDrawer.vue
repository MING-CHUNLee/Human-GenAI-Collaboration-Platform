<template>
  <!-- Mobile Drawer Button -->
  <el-button class="mobile-drawer" @click="drawerVisible = true">
    <img src="../../static/logo.png" alt="PopAi" style="width: 36px; height: 36px;" />
  </el-button>

  <!-- Mobile Drawer -->
  <el-drawer
    class="inner-drawer"
    @open="$emit('scroll-bottom')"
    v-model="drawerVisible"
    size="80%"
    title="AI Assistant"
  >
    <div class="m-chat-area">
      <el-scrollbar class="scroll-bar" ref="scrollContainer">
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
        input-id="prompt_input"
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
  </el-drawer>
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
  },
  drawer: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'update:drawer',
  'prompt-input',
  'highlight',
  'copy',
  'paste',
  'mouse-up',
  'focus-in',
  'focus-out',
  'send-message',
  'scroll-bottom'
]);

// Refs
const scrollContainer = ref(null);
const chatInputRef = ref(null);

// Computed
const userInput = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const drawerVisible = computed({
  get: () => props.drawer,
  set: (value) => emit('update:drawer', value)
});

// Expose refs
defineExpose({
  scrollContainer,
  chatInputRef
});
</script>

<style scoped>
.mobile-drawer {
  position: fixed;
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  box-shadow: #5F6367 0px 0px 10px 0px;
  padding: 10px;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  transition: all 0.3s;
  -webkit-backface-visibility: hidden;
}

.mobile-drawer > span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.m-chat-area {
  width: 100%;
  height: 100%;
  flex: 2;
  position: relative;
  padding-bottom: 80px !important;
}

.m-chat-area >>> .el-card {
  box-shadow: none;
  border: none;
  margin: 0px;
  unicode-bidi: isolate;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.5rem;
  padding: 0px 0px;
}

.m-chat-area >>> .el-card__body {
  padding: 8px 0px;
}

.m-chat-area .bar .submit-chatbot {
  bottom: 14px;
  right: 12px;
}

.scroll-bar {
  transition: all 0.3s ease-in-out;
}

@media (min-width: 992px) {
  .mobile-drawer {
    display: none;
  }
}
</style>
