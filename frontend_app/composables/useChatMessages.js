import { ref, nextTick } from 'vue';
import axios from 'axios';
import Constants from '../constant/Constants.vue';

/**
 * Composable for managing chat messages
 * Handles message sending, streaming responses, and message storage
 */
export function useChatMessages(userId) {
  const messages = ref([]);
  const userInput = ref('');
  const messageSending = ref(false);
  const currentTemp = ref(Constants.DEFAULTS_TEMP);

  let promptStartTime = 0;
  let promptEndTime = 0;

  /**
   * Initialize messages from backend
   */
  const initialMessages = async () => {
    try {
      const api_url = `${Constants.BACKEND_URL}/messages`;
      const { data } = await axios.get(api_url);

      if (data && Array.isArray(data)) {
        messages.value = data.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text.replace(/\n/g, '<br>'),
        }));
      }
    } catch (error) {
      console.error('Failed to initialize messages:', error);
    }
  };

  /**
   * Store message to backend
   */
  const storeMessage = async (message, role) => {
    try {
      const api_url = `${Constants.BACKEND_URL}/messages`;
      const postData = {
        user_id: userId.value,
        role: role,
        content: message,
      };

      const { data } = await axios.post(api_url, postData);
      return data;
    } catch (error) {
      console.error('Failed to store message:', error);
      throw error;
    }
  };

  /**
   * Send error log to backend
   */
  const sendError = async (error) => {
    try {
      const api_url = `${Constants.BACKEND_URL}/errors`;
      const { data } = await axios.post(api_url, error);
      return data;
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  };

  /**
   * Handle streaming response from OpenAI
   */
  const streamingResponse = async (sendBehavior) => {
    try {
      const api_url = `${Constants.BACKEND_URL}/chat`;
      messageSending.value = true;

      const postData = {
        user_id: userId.value,
        model: Constants.CHAT_GPT_MODEL,
        temperature: currentTemp.value,
        messages: messages.value.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text.replace(/<br>/g, '\n'),
        })),
      };

      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8", { stream: true });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:") && line !== "data: [DONE]") {
            try {
              const jsonData = JSON.parse(line.substring(5).trim());

              if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                const content = jsonData.choices[0].delta.content;
                const lastMessage = messages.value[messages.value.length - 1];

                if (lastMessage && lastMessage.sender === 'assistant') {
                  lastMessage.text += content.replace(/\n/g, '<br>');
                } else {
                  messages.value.push({
                    id: Date.now(),
                    sender: 'assistant',
                    text: content.replace(/\n/g, '<br>'),
                  });
                }
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
            }
          }
        }
      }

      // Store assistant message
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage && lastMessage.sender === 'assistant') {
        await storeMessage(lastMessage.text.replace(/<br>/g, '\n'), 'assistant');
      }

      // Log AI response behavior
      promptEndTime = new Date().getTime();
      sendBehavior({
        id: Date.now(),
        content: `Prompt Time: ${(promptEndTime - promptStartTime) / 1000}s`,
        type: 'AI Response',
        target_object: 'PromptArea',
        log_time: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Streaming error:', error);
      await sendError({
        id: Date.now(),
        content: error.message,
        type: 'Streaming Error',
        log_time: new Date().toISOString(),
      });
    } finally {
      messageSending.value = false;
    }
  };

  /**
   * Send user message
   */
  const sendMessage = async (sendBehavior, scrollToBottom) => {
    if (!userInput.value.trim() || messageSending.value) return;

    try {
      // Add user message
      messages.value.push({
        id: Date.now(),
        sender: 'user',
        text: userInput.value.replace(/\n/g, '<br>'),
      });

      // Store user message
      await storeMessage(userInput.value, 'user');

      // Log behavior
      sendBehavior({
        id: Date.now(),
        content: userInput.value,
        type: 'Prompt Input',
        target_object: 'PromptArea',
        log_time: new Date().toISOString(),
      });

      userInput.value = '';
      promptStartTime = new Date().getTime();

      // Get AI response
      await streamingResponse(sendBehavior);

      // Scroll to bottom
      await nextTick();
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      await sendError({
        id: Date.now(),
        content: error.message,
        type: 'Send Message Error',
        log_time: new Date().toISOString(),
      });
    }
  };

  /**
   * Handle prompt input (track timing)
   */
  const handlePromptInput = (e, value) => {
    const promptInputValue = (e && e.target) ? e.target.value : value;

    if (promptInputValue !== undefined) {
      if (promptStartTime === 0) {
        promptStartTime = new Date().getTime();
      } else {
        promptEndTime = new Date().getTime();
      }
    }
  };

  return {
    // State
    messages,
    userInput,
    messageSending,
    currentTemp,

    // Methods
    initialMessages,
    sendMessage,
    storeMessage,
    streamingResponse,
    handlePromptInput,
    sendError,
  };
}
