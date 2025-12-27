import { ref } from 'vue';
import axios from 'axios';
import Constants from '../constant/Constants.vue';

/**
 * Composable for managing tasks
 * Handles task retrieval, submission, and validation
 */
export function useTaskManagement(userId) {
  const scenarioText = ref('');
  const textArea = ref('');
  const textAreaWordCount = ref(0);
  const hasFinishTask = ref(false);
  const minWords = Constants.ACCEPTABLE_MIN_WORDS;
  const maxWords = Constants.ACCEPTABLE_MAX_WORDS;

  /**
   * Get random task from backend
   */
  const getTask = async () => {
    try {
      const api_url = `${Constants.BACKEND_URL}/random-task`;
      const { data } = await axios.get(api_url);

      if (data && data.scenario) {
        scenarioText.value = data.scenario.replace(/\n/g, '<br>');
        return data;
      } else {
        // Fallback scenario if API fails
        scenarioText.value = Constants.DEFAULT_SCENARIO.replace(/\n/g, '<br>');
        return { scenario: Constants.DEFAULT_SCENARIO };
      }
    } catch (error) {
      console.error('Failed to get task:', error);
      // Fallback to default scenario
      scenarioText.value = Constants.DEFAULT_SCENARIO.replace(/\n/g, '<br>');
      return { scenario: Constants.DEFAULT_SCENARIO };
    }
  };

  /**
   * Check if user has finished the task
   */
  const checkFinishTask = async () => {
    try {
      const api_url = `${Constants.BACKEND_URL}/users/${userId.value}/finish-task`;
      const { data } = await axios.get(api_url);
      hasFinishTask.value = data.finish_task || false;
      return data;
    } catch (error) {
      console.error('Failed to check finish task:', error);
      return { finish_task: false };
    }
  };

  /**
   * Validate if task can be finished
   */
  const checkTaskFinish = () => {
    if (textAreaWordCount.value >= minWords && textAreaWordCount.value <= maxWords) {
      return true;
    } else {
      alert(`Please make sure your answer is between ${minWords} and ${maxWords} words.`);
      return false;
    }
  };

  /**
   * Submit task
   */
  const onSubmitTask = async (missionTimeStamp, ipAddress, router) => {
    try {
      const api_url = `${Constants.BACKEND_URL}/users/${userId.value}/tasks`;
      const missionTime = Math.floor((new Date().getTime() - missionTimeStamp.value) / 1000);

      const postData = {
        user_id: userId.value,
        scenario: scenarioText.value.replace(/<br>/g, '\n'),
        response: textArea.value,
        ip_address: ipAddress.value,
        mission_time: missionTime,
      };

      const { data } = await axios.post(api_url, postData);

      if (data && data.success) {
        alert('Task submitted successfully! Redirecting to finish page...');
        router.push({ path: '/finish' });
      } else {
        alert('Failed to submit task. Please try again.');
      }

      return data;
    } catch (error) {
      console.error('Failed to submit task:', error);
      alert('An error occurred while submitting the task. Please try again.');
      throw error;
    }
  };

  /**
   * Handle input changes in text area
   */
  const handleInput = (e, value, sendBehavior, trackTextInput, localData) => {
    const inputValue = (e && e.target) ? e.target.value : value;

    if (inputValue !== undefined) {
      const trackingResult = trackTextInput(inputValue, textAreaWordCount, localData);

      if (trackingResult) {
        const { previousWordCount, textAreaWordCount: newWordCount } = trackingResult;

        // Update text area value
        textArea.value = inputValue;
        localData['storage_notes'] = inputValue;

        // Send behavior log for word changes
        if (previousWordCount !== newWordCount) {
          sendBehavior({
            id: Date.now(),
            content: inputValue,
            type: 'Word Add/Remove',
            target_object: 'NoteArea',
            log_time: new Date().toISOString(),
          });

          // Update finish task status
          if (newWordCount < minWords || newWordCount > maxWords) {
            hasFinishTask.value = false;
          }
        }

        // Save to localStorage
        localStorage.setItem(userId.value, JSON.stringify(localData));
      }
    }
  };

  return {
    // State
    scenarioText,
    textArea,
    textAreaWordCount,
    hasFinishTask,
    minWords,
    maxWords,

    // Methods
    getTask,
    checkFinishTask,
    checkTaskFinish,
    onSubmitTask,
    handleInput,
  };
}
