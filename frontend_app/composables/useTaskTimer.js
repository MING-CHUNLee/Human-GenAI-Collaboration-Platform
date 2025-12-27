import { ref, onUnmounted } from 'vue';
import Constants from '../constant/Constants.vue';

/**
 * Composable for managing task timer
 * Handles countdown timer for task completion
 */
export function useTaskTimer() {
  const TIME_GAP = Constants.TIME_GAP;
  const MISSION_TIME = Constants.MISSION_TIME;
  const MISSION_EXPIRE_TIME = Constants.MISSION_EXPIRE_TIME;

  const timeSeconds = ref("10m:00s");
  const missionTimeStamp = ref(new Date().getTime());
  let timeId = null;

  /**
   * Start the countdown timer
   */
  const startTimer = (router) => {
    clearInterval(timeId);

    timeId = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = Math.floor((currentTime - missionTimeStamp.value) / 1000);
      const remainingTime = MISSION_TIME - elapsedTime;

      if (remainingTime <= 0) {
        timeSeconds.value = "00m:00s";
        clearInterval(timeId);

        // Check if mission has expired
        if (elapsedTime > MISSION_EXPIRE_TIME) {
          router.push({ path: '/missing' });
        }
        return;
      }

      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      timeSeconds.value = `${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;
    }, TIME_GAP);
  };

  /**
   * Stop the timer
   */
  const stopTimer = () => {
    if (timeId) {
      clearInterval(timeId);
      timeId = null;
    }
  };

  /**
   * Reset timer to initial state
   */
  const resetTimer = () => {
    stopTimer();
    missionTimeStamp.value = new Date().getTime();
    timeSeconds.value = "10m:00s";
  };

  /**
   * Get elapsed time in seconds
   */
  const getElapsedTime = () => {
    return Math.floor((new Date().getTime() - missionTimeStamp.value) / 1000);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopTimer();
  });

  return {
    // State
    timeSeconds,
    missionTimeStamp,

    // Methods
    startTimer,
    stopTimer,
    resetTimer,
    getElapsedTime,
  };
}
