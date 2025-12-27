# Composables Integration Guide for Dashboard.vue

This guide explains how to integrate the composables into Dashboard.vue to reduce its size from ~1390 lines to ~600-800 lines.

## Current Status

✅ **Completed:**
- Component extraction (7 new components)
- Composables creation (5 composables with 788 lines of code)
- Composables imported into Dashboard.vue

⏳ **Pending:**
- Replace Dashboard.vue logic with composable functions
- Remove redundant code
- Test all functionality

## Integration Strategy

### Step 1: Initialize Composables (20 minutes)

Replace the current variable declarations with composable initializations:

```javascript
// Current code (lines 225-291):
const drawer = ref(false)
const hasFinishTask = ref(false);
const messages = ref([]);
// ... many more declarations

// New code with composables:
const route = useRoute();
const router = useRouter();
const user_id = ref('anonymous');

// Initialize composables
const {
  highlightedText,
  wordEditingCount,
  wordDeletingCount,
  characterRevisionCount,
  sendBehavior,
  handleCopy,
  handlePaste,
  handleHighlight,
  handleMouseUp,
  trackTextInput,
} = useBehaviorTracking(user_id);

const {
  timeSeconds,
  missionTimeStamp,
  startTimer,
  stopTimer,
} = useTaskTimer();

const {
  messages,
  userInput,
  messageSending,
  currentTemp,
  initialMessages,
  sendMessage,
  handlePromptInput,
  sendError,
} = useChatMessages(user_id);

const {
  scenarioText,
  textArea,
  textAreaWordCount,
  hasFinishTask,
  minWords,
  maxWords,
  getTask,
  checkFinishTask: checkFinishTaskAPI,
  checkTaskFinish,
  onSubmitTask: submitTaskComposable,
  handleInput: handleTaskInput,
} = useTaskManagement(user_id);

const {
  initializeLocalData,
  readStorage,
  saveStorage,
  updateStorageField,
  clearStorage,
  getLocalData,
} = useLocalStorage(user_id);

// Keep UI-specific state
const drawer = ref(false);
const mobileDrawer = ref(window.innerWidth < 992);
const open = ref(true);
const attendTour = ref(false);
const textAreaRowRef = ref(8);

// Component refs
const chatInputRef = ref(null);
const scenarioRef = ref(null);
const noteRef = ref(null);
const chatBotRef = ref(null);
const submitTaskRef = ref(null);
const infoRef = ref(null);
const scrollContainer = ref(null);
const textareaRef = ref(null);

// Vuex store
const store = useStore();
const updateSharedVariable = (obj) => {
  store.commit('updateSharedVariable', obj);
};

// Additional state
const ipAddress = ref('');
let focus_leave = new Date().getTime();
let localData = {};
```

### Step 2: Update onMounted Hook (10 minutes)

Replace the current onMounted logic:

```javascript
// New onMounted using composables:
onMounted(async () => {
  focus_leave = new Date().getTime();
  document.addEventListener('keydown', handleHighlight);

  // Initialize user
  user_id.value = route.query[Constants.URL_USER_PARAMS] || 'anonymous';
  updateSharedVariable({ 'user_id': user_id.value });

  // Get IP
  await getIPFromAmazon();

  // Initialize local storage
  localData = initializeLocalData(ipAddress.value);
  const data = readStorage(textArea, textAreaWordCount, messages);

  if (data) {
    localData = data;
    missionTimeStamp.value = localData['missionTimeStamp'] || new Date().getTime();

    if (localData['tour'] === false) {
      open.value = localData['tour'];
      attendTour.value = !localData['tour'];
      startTimer(router);
    }
  } else {
    saveStorage(localData);
  }

  await checkFinishTaskAPI();
  await initialMessages();
  await getTask();
  await updateIp();

  sendBehavior({
    id: Date.now(),
    content: 'User is open the page on' + Date.now().toString(),
    type: 'Initial',
    target_object: 'Page',
    log_time: new Date().toISOString(),
  });

  document.addEventListener('visibilitychange', handleVisibilityChange);
});
```

### Step 3: Update onUnmounted Hook (2 minutes)

```javascript
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('keydown', handleHighlight);
  stopTimer(); // Use composable's stopTimer
});
```

### Step 4: Wrapper Functions (15 minutes)

Create wrapper functions that combine composable logic with local state:

```javascript
// Wrapper for handleInput
const handleInput = (e, value) => {
  localData = getLocalData();
  handleTaskInput(e, value, sendBehavior, trackTextInput, localData);
};

// Wrapper for onSubmitTask
const onSubmitTask = async () => {
  localData = getLocalData();
  await submitTaskComposable(missionTimeStamp, ipAddress, router);
};

// Keep existing scrollToBottom function
async function scrollToBottom() {
  try {
    if (scrollContainer.value) {
      scrollContainer.value.setScrollTop(1e16);
    }
  } catch (error) {
    console.error('Failed to scroll to bottom:', error);
  }
}

// Keep existing getIPFromAmazon
const getIPFromAmazon = async () => {
  await fetch("https://checkip.amazonaws.com/")
    .then(res => res.text())
    .then(data => {
      ipAddress.value = data;
    });
};

// Keep existing updateIp
const updateIp = async () => {
  try {
    let api_url = "/update_ip";
    if (user_id.value !== 'anonymous') {
      api_url = `/update_ip?user_id=${user_id.value}`;
    }
    const { data } = await axios.post(api_url, { ip_address: ipAddress.value });
  } catch (error) {
    console.error('Failed to update IP:', error);
    sendError({ error_message: "Failed to update IP:" + error });
  }
};
```

### Step 5: Remove Redundant Code (20 minutes)

Delete the following sections that are now handled by composables:

1. **Lines ~550-567**: `sendBehavior` function (now from useBehaviorTracking)
2. **Lines ~857-901**: `handleInput` function (replaced by wrapper)
3. **Lines ~974-1002**: `handleCopy`, `handlePaste` functions (now from useBehaviorTracking)
4. **Lines ~1005-1064**: `handleHighlight`, `handleMouseUp` functions (now from useBehaviorTracking)
5. **Lines ~420-449**: Timer functions (now from useTaskTimer)
6. **Lines ~499-523**: `initialMessages` function (now from useChatMessages)
7. **Lines ~525-548**: `sendMessage` function (now from useChatMessages)
8. **Lines ~688-798**: `streamingResponse` function (now from useChatMessages)
9. **Lines ~602-639**: `getTask` function (now from useTaskManagement)
10. **Lines ~641-669**: `onSubmitTask` function (replaced by wrapper)

### Step 6: Update Return Statement (5 minutes)

The return statement remains mostly the same, but now references composable values:

```javascript
return {
  // From composables
  messages,              // useChatMessages
  userInput,             // useChatMessages
  messageSending,        // useChatMessages
  currentTemp,           // useChatMessages
  timeSeconds,           // useTaskTimer
  scenarioText,          // useTaskManagement
  textArea,              // useTaskManagement
  textAreaWordCount,     // useTaskManagement
  hasFinishTask,         // useTaskManagement
  minWords,              // useTaskManagement
  maxWords,              // useTaskManagement
  highlightedText,       // useBehaviorTracking

  // Wrapper functions
  handleInput,
  onSubmitTask,
  sendMessage,
  handlePromptInput,
  checkTaskFinish,

  // Composable functions
  handleHighlight,       // useBehaviorTracking
  handleCopy,            // useBehaviorTracking
  handlePaste,           // useBehaviorTracking
  handleMouseUp,         // useBehaviorTracking

  // UI state
  drawer,
  mobileDrawer,
  open,
  attendTour,
  textAreaRowRef,

  // Component refs
  scenarioRef,
  noteRef,
  chatBotRef,
  submitTaskRef,
  chatInputRef,
  infoRef,
  scrollContainer,
  textareaRef,

  // Other functions
  tourFinished,
  handleCopiedButton,
  clearTextArea,
  startFocusTime,
  endFocusTime,
  scrollToBottom,
  isLastChatbotMessage,
  resentMessage,

  // Constants
  MAX_TEMP,
  MIN_TEMP,
};
```

## Expected Results

### Before Integration:
- **Dashboard.vue**: ~1390 lines
- **Total LOC**: ~2600 lines (including components)

### After Integration:
- **Dashboard.vue**: ~600-800 lines (43% reduction)
- **Total LOC**: ~2200 lines (cleaner architecture)

## Testing Checklist

After integration, test these critical features:

- [ ] User can see the task scenario
- [ ] User can type in the answer area
- [ ] Word count updates correctly
- [ ] Timer counts down properly
- [ ] Chat messages send and receive
- [ ] AI responses stream correctly
- [ ] Copy/paste behavior tracking works
- [ ] Text highlighting is tracked
- [ ] LocalStorage saves and restores data
- [ ] Task submission works
- [ ] Mobile drawer functions correctly
- [ ] Tour guide displays properly

## Risks and Mitigation

### High Risk Areas:
1. **Behavior tracking**: Critical for analytics
   - Mitigation: Test thoroughly with console logs

2. **LocalStorage**: Data persistence
   - Mitigation: Check browser DevTools > Application > LocalStorage

3. **Timer**: Must not break on refresh
   - Mitigation: Verify missionTimeStamp persistence

### Rollback Plan:
If integration causes issues:
```bash
git checkout HEAD~1 frontend_app/pages/Dashboard.vue
```

## Time Estimate

- Total integration time: ~1.5-2 hours
- Testing time: ~1 hour
- Total: ~2.5-3 hours for complete integration

## Benefits

1. **Maintainability**: Logic organized by domain
2. **Testability**: Composables can be unit tested
3. **Reusability**: Can use composables in other components
4. **Readability**: Cleaner Dashboard.vue
5. **Separation of Concerns**: UI vs Logic clearly separated

## Next Steps

When ready to integrate:

1. Create a new branch: `git checkout -b feature/composables-integration`
2. Follow steps 1-6 above
3. Test thoroughly using the checklist
4. Commit: `git commit -m "refactor: integrate composables into Dashboard.vue"`
5. Merge when confident: `git checkout main && git merge feature/composables-integration`
