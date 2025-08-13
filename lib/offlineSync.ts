// lib/offlineSync.ts

import { openDB, IDBPDatabase } from 'idb';

/**
 * Represents an action that needs to be synced to the backend when online.
 * Stored in IndexedDB.
 */
interface OfflineAction {
  id: string; // Unique identifier for the action
  type: string; // Type of action (e.g., 'save_note', 'add_annotation')
  payload: any;
  timestamp: number;
  /**
 * The current status of the action.
 * 'pending': Waiting to be synced.
 * 'syncing': Currently being synced.
 * 'succeeded': Successfully synced and can be removed.
 * 'failed': Failed to sync, will be retried.
 * 'conflict': Sync failed due to a conflict, requires manual resolution.
 */
  status: 'pending' | 'syncing' | 'succeeded' | 'failed' | 'conflict';
}

const DB_NAME = 'medmaster-offline-db';
const STORE_NAME = 'offline-actions';
const DB_VERSION = 1;

// IndexedDB instance
let db: IDBPDatabase | null = null;

/**
 * Initializes the IndexedDB database for storing offline actions.
 * Creates the object store if it doesn't exist.
 */
async function initDB(): Promise<IDBPDatabase> {
  if (db) {
    return db;
  }
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
  return db;
}

/**
 * Enqueues an action to be synced later when the application is online.
 * @param actionType - The type of action (e.g., 'save_note').
 * @param payload - The data associated with the action.
 */
export async function enqueueOfflineAction(actionType: string, payload: any): Promise<void> {
  const database = await initDB();
  const action: OfflineAction = {
    id: self.crypto.randomUUID(),
    type: actionType,
    payload: payload,
    timestamp: Date.now(),
    status: 'pending',
  };
  await database.add(STORE_NAME, action);
  // Trigger sync attempt
  syncPending();
}

let isSyncing = false;
// Counter for exponential backoff retries
let retryCount = 0;

/**
 * Attempts to sync pending offline actions to the backend.
 * Implements exponential backoff for retries on failed sync attempts.
 */
export async function syncPending(): Promise<void> {
  // Prevent multiple sync processes from running concurrently
  if (isSyncing) {
    return;
  }

  isSyncing = true;
  try {
    const database = await initDB();
    const pendingActions = await database.getAllFromIndex(STORE_NAME, null, (cursor) => {
      // Filter for pending or failed actions that aren't in conflict
      if (cursor.value.status === 'pending' || (cursor.value.status === 'failed' && cursor.value.status !== 'conflict')) {
        return cursor.value;
      }
      cursor.continue();
    });

    // If no pending or failed actions, reset state and update status

    if (pendingActions.length === 0) {
      isSyncing = false;
      retryCount = 0;
      // Update UI sync status to indicate synced
      updateSyncStatus('synced');
      return;
    }

    // Update UI sync status to indicate syncing
    updateSyncStatus('syncing');

    for (const action of pendingActions) {
      try {
        // Mark action as syncing to prevent processing it in another sync cycle
        await database.put(STORE_NAME, { ...action, status: 'syncing' });
        // TODO: Implement the actual API call logic based on action.type and action.payload
        // This is a placeholder for your actual synchronization logic.
        // You'll need to map action types to your backend API endpoints.
        console.log(`Attempting to sync action: ${action.type}`, action.payload);

        const response = await fetch('/api/sync', { // Replace with your actual sync endpoint
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(action)
        });

        if (!response.ok) {
            // If the sync failed, update the status to 'failed' or 'conflict' based on the response
            // Handle potential conflicts or other server errors
            const errorData = await response.json();
            if (response.status === 409) { // Example conflict status code
                 console.warn(`Conflict detected for action ${action.id}`);
                 // Mark as conflict - requires user intervention
                 await database.put(STORE_NAME, { ...action, status: 'conflict' });
                 updateSyncStatus('conflict'); // Update UI to indicate conflict
            } else {
                 console.error(`Sync failed for action ${action.id}: ${response.statusText}`);
                 await database.put(STORE_NAME, { ...action, status: 'failed' });
                 // Mark as failed - will be retried with backoff
                 updateSyncStatus('failed'); // Update UI to indicate failure
            }
            continue; // Move to the next action
        }

        // If successful, remove the action from the database
        await database.delete(STORE_NAME, action.id);
        console.log(`Sync succeeded for action ${action.id}`);
        // Update UI status if currently 'syncing' and no other actions are pending/failed
        const remainingActions = await database.count(STORE_NAME);
        if (remainingActions === 0) updateSyncStatus('synced');

      } catch (error) {
        console.error(`Error during sync for action ${action.id}:`, error);
        await database.put(STORE_NAME, { ...action, status: 'failed' });
         updateSyncStatus('failed'); // Update UI to indicate failure
      }
    }

    // If there are still failed actions (not conflicts), schedule a retry
    const remainingFailedActions = await database.getAllFromIndex(STORE_NAME, null, (cursor) => {
        if (cursor.value.status === 'failed') {
             return cursor.value;
        }
         cursor.continue();
    });

    // If there are failed actions that are not conflicts, schedule a retry with exponential backoff
    if (remainingFailedActions.length > 0) {
        retryCount++;
        const delay = Math.min(1000 * (2 ** retryCount), 60000); // Exponential backoff, max 1 minute
        console.log(`Retrying sync in ${delay}ms. Retry count: ${retryCount}`);
        setTimeout(syncPending, delay);
    } else {
        retryCount = 0;
         updateSyncStatus('synced'); // All retriable actions synced
    }


  } catch (error) {
    console.error('Error initializing DB or fetching pending actions:', error);
    // If there's a fundamental error, mark status as failed
     updateSyncStatus('failed'); // Update UI to indicate failure
  } finally {
    // Ensure isSyncing is reset even if errors occur
    isSyncing = false;
  }
}

/**
 * Exposes the current synchronization status.
 * This is a basic implementation; a real app might use a state management library.
 * @returns The current sync status.
 */
// Simple mechanism to expose sync status (replace with a more robust state management solution in a real app)
let currentSyncStatus: 'synced' | 'syncing' | 'failed' | 'conflict' = 'synced';
const syncStatusListeners: ((status: typeof currentSyncStatus) => void)[] = [];

function updateSyncStatus(status: typeof currentSyncStatus) {
    currentSyncStatus = status;
    syncStatusListeners.forEach(listener => listener(currentSyncStatus));
}

/**
 * Gets the current synchronization status.
 */
export function getSyncStatus(): typeof currentSyncStatus {
    return currentSyncStatus;
}

/**
 * Subscribes a listener function to changes in the synchronization status.
 * @param listener - The function to call when the sync status changes.
 * @returns An unsubscribe function.
 */
export function onSyncStatusChange(listener: (status: typeof currentSyncStatus) => void): () => void {
    syncStatusListeners.push(listener);
    // Return unsubscribe function
    return () => {
        const index = syncStatusListeners.indexOf(listener);
        if (index > -1) {
            syncStatusListeners.splice(index, 1);
        }
    };
}

/**
 * Sets up event listeners to trigger sync when the browser comes online.
 */
// Listen for online/offline events to trigger sync
if (typeof window !== 'undefined') {
    window.addEventListener('online', syncPending);
    // Initial sync attempt on load
    initDB().then(() => syncPending());
}