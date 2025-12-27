// TypeScript type definitions for Dashboard components

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  temp?: number;
}

export interface Task {
  task_name: 'CREATIVE' | 'PRACTICAL';
  message_id: string;
  receipt_handle: string;
  expire_time: number;
}

export interface BehaviorLog {
  id: number;
  content: string;
  type: string;
  target_object: string;
  log_time: string;
}

export interface LocalStorageData {
  user_id?: string;
  storage_notes?: string;
  wordEditingCount?: number;
  wordDeletingCount?: number;
  characterRevisionCount?: number;
  missionTimeStamp?: number;
  tour?: boolean;
  task?: Task;
}
