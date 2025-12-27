<template>
  <el-card>
    <div
      class="dialogue"
      :id="`${message.sender}_${message.sender === 'user' ? 'question' : 'feedback'}_block_${message.id}`"
      @mouseup="$emit('mouse-up', $event)"
      @copy="$emit('copy', $event)"
    >
      <el-avatar
        :size="28"
        class="avatar"
        :class="message.sender === 'user' ? 'user-bg' : 'bot-bg'"
        :icon="message.sender === 'user' ? 'UserFilled' : 'ChatLineRound'"
      />
      <div>
        <div
          class="user-title"
          :id="`${message.sender === 'user' ? 'user_question' : 'ai_feedback'}_tag_${message.id}`"
        >
          {{ message.sender === 'user' ? 'You' : 'Chatbot' }}
        </div>
        <div
          :id="`${message.sender === 'user' ? 'user_question' : 'ai_feedback'}_${message.id}`"
          :style="message.sender === 'assistant' ? 'word-wrap: break-word; white-space: pre-wrap; line-height:1.1' : ''"
          v-html="message.text"
        ></div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
// Props
defineProps({
  message: {
    type: Object,
    required: true
  }
});

// Emits
defineEmits(['mouse-up', 'copy']);
</script>

<style scoped>
.dialogue {
  display: flex;
  align-items: start;
  gap: 8px;
}

.avatar {
  flex-shrink: 0;
}

.user-bg {
  background: #48566d;
}

.bot-bg {
  background: #f8b932;
}

.user-title {
  font-weight: 600;
  -webkit-user-select: none;
  user-select: none;
  font-size: 1rem;
  line-height: 1.5em;
  display: block;
}
</style>
