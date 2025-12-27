# Composables Documentation

This directory contains reusable composition functions (composables) for the Dashboard component.

## Overview

Composables extract business logic from Vue components, making code more modular, testable, and reusable.

## Available Composables

### 1. `useBehaviorTracking.js`

**Purpose**: Track and log user interactions for analytics

**Exports**:
- **State**:
  - `highlightedText` - Currently highlighted text
  - `wordEditingCount` - Number of word edits
  - `wordDeletingCount` - Number of words deleted
  - `characterRevisionCount` - Character revision count

- **Methods**:
  - `sendBehavior(behavior)` - Send behavior log to backend
  - `handleCopy(e)` - Handle text copy events
  - `handlePaste(e)` - Handle text paste events
  - `handleHighlight(e)` - Handle Ctrl+A/Cmd+A selection
  - `handleMouseUp(e, noteRef)` - Handle text selection via mouse
  - `trackTextInput(inputValue, textAreaWordCount, localData)` - Track text input changes

**Usage**:
```javascript
const {
  highlightedText,
  handleCopy,
  sendBehavior
} = useBehaviorTracking(userId);
```

---

### 2. `useTaskTimer.js`

**Purpose**: Manage countdown timer for task completion

**Exports**:
- **State**:
  - `timeSeconds` - Formatted time remaining (e.g., "10m:00s")
  - `missionTimeStamp` - Task start timestamp

- **Methods**:
  - `startTimer(router)` - Start countdown timer
  - `stopTimer()` - Stop timer
  - `resetTimer()` - Reset timer to initial state
  - `getElapsedTime()` - Get elapsed time in seconds

**Usage**:
```javascript
const {
  timeSeconds,
  startTimer,
  getElapsedTime
} = useTaskTimer();

startTimer(router);
```

---

### 3. `useChatMessages.js`

**Purpose**: Manage chat messages and AI interactions

**Exports**:
- **State**:
  - `messages` - Array of chat messages
  - `userInput` - Current user input text
  - `messageSending` - Loading state for AI responses
  - `currentTemp` - AI temperature setting

- **Methods**:
  - `initialMessages()` - Load messages from backend
  - `sendMessage(sendBehavior, scrollToBottom)` - Send user message and get AI response
  - `storeMessage(message, role)` - Save message to backend
  - `streamingResponse(sendBehavior)` - Handle streaming AI response
  - `handlePromptInput(e, value)` - Track prompt input timing
  - `sendError(error)` - Log error to backend

**Usage**:
```javascript
const {
  messages,
  userInput,
  sendMessage,
  initialMessages
} = useChatMessages(userId);

await initialMessages();
```

---

### 4. `useTaskManagement.js`

**Purpose**: Handle task retrieval, validation, and submission

**Exports**:
- **State**:
  - `scenarioText` - Current task description
  - `textArea` - User's answer text
  - `textAreaWordCount` - Word count of answer
  - `hasFinishTask` - Whether user has finished
  - `minWords` - Minimum word requirement
  - `maxWords` - Maximum word requirement

- **Methods**:
  - `getTask()` - Fetch random task from backend
  - `checkFinishTask()` - Check if user has completed task
  - `checkTaskFinish()` - Validate task completion (word count)
  - `onSubmitTask(missionTimeStamp, ipAddress, router)` - Submit task
  - `handleInput(e, value, sendBehavior, trackTextInput, localData)` - Handle text area input

**Usage**:
```javascript
const {
  scenarioText,
  textArea,
  getTask,
  onSubmitTask
} = useTaskManagement(userId);

await getTask();
```

---

### 5. `useLocalStorage.js`

**Purpose**: Manage localStorage operations for persisting user data

**Exports**:
- **Methods**:
  - `initializeLocalData(ipAddress)` - Initialize data structure
  - `readStorage(textArea, textAreaWordCount, messages)` - Read from localStorage
  - `saveStorage(data)` - Save to localStorage
  - `updateStorageField(fieldName, value)` - Update specific field
  - `clearStorage()` - Clear user's localStorage
  - `getLocalData()` - Get current localStorage data

**Usage**:
```javascript
const {
  readStorage,
  saveStorage,
  updateStorageField
} = useLocalStorage(userId);

readStorage(textArea, textAreaWordCount, messages);
```

---

## Integration Example

Here's how to use multiple composables together in Dashboard.vue:

```javascript
import { useBehaviorTracking } from '../composables/useBehaviorTracking';
import { useTaskTimer } from '../composables/useTaskTimer';
import { useChatMessages } from '../composables/useChatMessages';
import { useTaskManagement } from '../composables/useTaskManagement';
import { useLocalStorage } from '../composables/useLocalStorage';

export default {
  setup() {
    const user_id = ref('user123');

    // Initialize composables
    const behaviorTracking = useBehaviorTracking(user_id);
    const taskTimer = useTaskTimer();
    const chatMessages = useChatMessages(user_id);
    const taskManagement = useTaskManagement(user_id);
    const localStorage = useLocalStorage(user_id);

    // Use composable methods
    onMounted(async () => {
      await taskManagement.getTask();
      await chatMessages.initialMessages();
      taskTimer.startTimer(router);
      localStorage.readStorage(
        taskManagement.textArea,
        taskManagement.textAreaWordCount,
        chatMessages.messages
      );
    });

    return {
      // Expose only what's needed in template
      ...behaviorTracking,
      ...taskTimer,
      ...chatMessages,
      ...taskManagement,
    };
  }
};
```

---

## Benefits

1. **Separation of Concerns**: Each composable handles a specific domain
2. **Reusability**: Logic can be shared across multiple components
3. **Testability**: Easier to unit test isolated functions
4. **Maintainability**: Smaller, focused files are easier to understand
5. **Type Safety**: Can be easily converted to TypeScript with proper types

---

## File Structure

```
frontend_app/
├── composables/
│   ├── useBehaviorTracking.js   # User interaction tracking
│   ├── useTaskTimer.js           # Countdown timer logic
│   ├── useChatMessages.js        # Chat and AI interactions
│   ├── useTaskManagement.js      # Task CRUD operations
│   ├── useLocalStorage.js        # localStorage persistence
│   └── README.md                 # This file
└── pages/
    └── Dashboard.vue             # Main dashboard (uses composables)
```

---

## Next Steps

To integrate these composables into Dashboard.vue:

1. Import the needed composables
2. Call them in the `setup()` function
3. Replace existing logic with composable methods
4. Remove redundant code from Dashboard.vue
5. Test all functionality to ensure nothing breaks

This refactoring will reduce Dashboard.vue from ~1390 lines to approximately 600-800 lines while maintaining all functionality.
