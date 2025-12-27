import { ref } from 'vue';

/**
 * Composable for managing localStorage
 * Handles reading and writing user data to localStorage
 */
export function useLocalStorage(userId) {
  let localData = {};

  /**
   * Initialize localStorage data structure
   */
  const initializeLocalData = (ipAddress) => {
    localData = {
      user_id: userId.value,
      ip_address: ipAddress,
      storage_notes: '',
      wordEditingCount: 0,
      wordDeletingCount: 0,
      characterRevisionCount: 0,
      messages: [],
      behaviors: [],
    };
    return localData;
  };

  /**
   * Read data from localStorage
   */
  const readStorage = (textArea, textAreaWordCount, messages) => {
    try {
      if (!localStorage.getItem(userId.value)) {
        return null;
      }

      const raw = localStorage.getItem(userId.value);
      const data = JSON.parse(raw);

      if (!data) {
        return null;
      }

      // Restore text area
      if (data.storage_notes) {
        textArea.value = data.storage_notes;
        const trimmed = textArea.value.trim();
        const words = trimmed.split(/\s+|\n+/);
        textAreaWordCount.value = trimmed ? words.length : 0;
      }

      // Restore messages
      if (data.messages && Array.isArray(data.messages)) {
        messages.value = data.messages;
      }

      localData = data;
      return data;

    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  /**
   * Save data to localStorage
   */
  const saveStorage = (data) => {
    try {
      localStorage.setItem(userId.value, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };

  /**
   * Update specific field in localStorage
   */
  const updateStorageField = (fieldName, value) => {
    try {
      localData[fieldName] = value;
      saveStorage(localData);
      return true;
    } catch (error) {
      console.error(`Error updating field ${fieldName}:`, error);
      return false;
    }
  };

  /**
   * Clear localStorage for current user
   */
  const clearStorage = () => {
    try {
      localStorage.removeItem(userId.value);
      localData = {};
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };

  /**
   * Get current localStorage data
   */
  const getLocalData = () => {
    return localData;
  };

  return {
    // Methods
    initializeLocalData,
    readStorage,
    saveStorage,
    updateStorageField,
    clearStorage,
    getLocalData,
  };
}
