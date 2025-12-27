import { ref } from 'vue';
import axios from 'axios';
import Constants from '../constant/Constants.vue';

/**
 * Composable for tracking user behavior
 * Handles logging of user interactions like text highlighting, copying, pasting, etc.
 */
export function useBehaviorTracking(userId) {
  const highlightedText = ref('');
  const wordEditingCount = ref(0);
  const wordDeletingCount = ref(0);
  const characterRevisionCount = ref(0);
  let previousCharacterCount = 0;

  /**
   * Send behavior log to backend
   */
  const sendBehavior = async (behavior) => {
    try {
      const api_url = `${Constants.BACKEND_URL}/behaviors`;
      const { data } = await axios.post(api_url, behavior);
      console.log('Behavior logged:', data);
      return data;
    } catch (error) {
      console.error('Failed to log behavior:', error);
      throw error;
    }
  };

  /**
   * Handle text copy event
   */
  const handleCopy = (e) => {
    try {
      const selectedText = window.getSelection().toString();
      const targetElementName = e.target.closest('.dialogue') || e.target.name || e.target.nodeName;

      sendBehavior({
        id: Date.now(),
        content: selectedText,
        type: 'Copy',
        target_object: targetElementName,
        log_time: new Date().toISOString(),
      });

      highlightedText.value = 'Copied Text: ' + selectedText + ' from ' + targetElementName;
    } catch (error) {
      console.error('Error handling copy:', error);
    }
  };

  /**
   * Handle text paste event
   */
  const handlePaste = async (e) => {
    try {
      const pastedText = await e.clipboardData.getData('text');
      const targetElementName = e.target.closest('.dialogue') || e.target.name || e.target.nodeName;

      sendBehavior({
        id: Date.now(),
        content: pastedText,
        type: 'Paste',
        target_object: targetElementName,
        log_time: new Date().toISOString(),
      });

      highlightedText.value = 'Pasted Text: ' + pastedText + ' to ' + targetElementName;
    } catch (error) {
      console.error('Error handling paste:', error);
    }
  };

  /**
   * Handle text highlight event (Ctrl+A / Cmd+A)
   */
  const handleHighlight = (e) => {
    try {
      const selectedText = window.getSelection().toString();

      if (selectedText) {
        const targetElementName = e.target.closest('.dialogue') || e.target.name || e.target.nodeName;

        sendBehavior({
          id: Date.now(),
          content: selectedText,
          type: 'HighlightAll',
          target_object: targetElementName,
          log_time: new Date().toISOString(),
        });

        highlightedText.value = 'Selected Text: ' + selectedText + ' from ' + targetElementName;
      }
    } catch (error) {
      console.error('Error handling highlight:', error);
    }
  };

  /**
   * Handle mouse up event (text selection)
   */
  const handleMouseUp = (e, noteRef) => {
    try {
      let selectedText = '';

      // Check if the event's target is the textarea
      if (noteRef.value && noteRef.value.textareaRef && e.target === noteRef.value.textareaRef.$refs.textarea) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        selectedText = e.target.value.substring(start, end);
      } else {
        // For other elements, use window.getSelection
        selectedText = window.getSelection().toString();
      }

      if (selectedText !== '') {
        const targetElementName = e.target.closest('.dialogue') || e.target.name || e.target.nodeName;

        sendBehavior({
          id: Date.now(),
          content: selectedText,
          type: 'Highlight',
          target_object: targetElementName,
          log_time: new Date().toISOString(),
        });

        highlightedText.value = 'Highlighted Text: ' + selectedText + ' from ' + targetElementName;
      }
    } catch (error) {
      console.error('Error handling mouse up:', error);
    }
  };

  /**
   * Track text input changes (word count, editing, deletion)
   */
  const trackTextInput = (inputValue, textAreaWordCount, localData) => {
    if (inputValue !== undefined) {
      // Track character revisions
      if (previousCharacterCount === inputValue.length - 1 || previousCharacterCount === inputValue.length + 1) {
        characterRevisionCount.value += 1;
        localData['characterRevisionCount'] = characterRevisionCount.value;
      }
      previousCharacterCount = inputValue.length;

      // Calculate word count
      const words = inputValue.trim().split(/\s+|\n+/);
      const previousWordCount = textAreaWordCount.value;
      textAreaWordCount.value = inputValue.trim() ? words.length : 0;

      // Track word editing
      if (previousWordCount === textAreaWordCount.value - 1) {
        wordEditingCount.value += 1;
        localData['wordEditingCount'] = wordEditingCount.value;
      } else if (previousWordCount > textAreaWordCount.value) {
        wordDeletingCount.value += previousWordCount - textAreaWordCount.value;
        localData['wordDeletingCount'] = wordDeletingCount.value;
      }

      return { previousWordCount, textAreaWordCount: textAreaWordCount.value };
    }
    return null;
  };

  return {
    // State
    highlightedText,
    wordEditingCount,
    wordDeletingCount,
    characterRevisionCount,

    // Methods
    sendBehavior,
    handleCopy,
    handlePaste,
    handleHighlight,
    handleMouseUp,
    trackTextInput,
  };
}
