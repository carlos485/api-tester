// Session storage utility functions with error handling and type safety

const SESSION_KEYS = {
  SELECTED_PROJECT: 'api-tester-selected-project',
  REQUEST_TABS: 'api-tester-request-tabs',
  ALL_TABS: 'api-tester-all-tabs',
  ACTIVE_TAB_INDEX: 'api-tester-active-tab-index',
  SELECTED_ENDPOINT: 'api-tester-selected-endpoint',
  SELECTED_ENVIRONMENT: 'api-tester-selected-environment',
} as const;

// Generic session storage functions
export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.warn(`Failed to save to sessionStorage (key: ${key}):`, error);
  }
};

export const getSessionItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to load from sessionStorage (key: ${key}):`, error);
    return defaultValue;
  }
};

export const removeSessionItem = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from sessionStorage (key: ${key}):`, error);
  }
};

export const clearAllSessionData = (): void => {
  Object.values(SESSION_KEYS).forEach(key => {
    removeSessionItem(key);
  });
};

// Specific functions for app state
export const saveSelectedProject = (projectId: string): void => {
  setSessionItem(SESSION_KEYS.SELECTED_PROJECT, projectId);
};

export const getSelectedProject = (): string | null => {
  return getSessionItem<string | null>(SESSION_KEYS.SELECTED_PROJECT, null);
};

export const clearSelectedProject = (): void => {
  removeSessionItem(SESSION_KEYS.SELECTED_PROJECT);
};

interface SerializedRequestTab {
  id: string;
  name: string;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    queryParams?: Record<string, string>;
    body: string;
  };
  response: unknown;
  loading: boolean;
}

interface SerializedProjectTab {
  id: string;
  name: string;
  type: 'project';
  projectId: string;
  isTransient?: boolean;
}

interface SerializedMixedRequestTab extends SerializedRequestTab {
  type: 'request';
  endpointId?: string;
  projectId?: string;
  isTransient?: boolean;
}

type SerializedTab = SerializedMixedRequestTab | SerializedProjectTab;

export const saveRequestTabs = (tabs: SerializedRequestTab[]): void => {
  // Serialize tabs but exclude functions and complex objects
  const serializedTabs = tabs.map(tab => ({
    id: tab.id,
    name: tab.name,
    request: tab.request,
    response: tab.response,
    loading: false, // Reset loading state on save
  }));
  setSessionItem(SESSION_KEYS.REQUEST_TABS, serializedTabs);
};

export const getRequestTabs = (): SerializedRequestTab[] => {
  return getSessionItem<SerializedRequestTab[]>(SESSION_KEYS.REQUEST_TABS, []);
};

export const clearRequestTabs = (): void => {
  removeSessionItem(SESSION_KEYS.REQUEST_TABS);
};

// Functions for mixed tabs (request + project)
export const saveAllTabs = (tabs: SerializedTab[]): void => {
  const serializedTabs = tabs.map(tab => {
    if (tab.type === 'project') {
      return {
        id: tab.id,
        name: tab.name,
        type: tab.type,
        projectId: tab.projectId,
        isTransient: tab.isTransient || false,
      };
    } else {
      return {
        id: tab.id,
        name: tab.name,
        type: tab.type,
        request: tab.request,
        response: tab.response,
        loading: false, // Reset loading state on save
        endpointId: tab.endpointId,
        projectId: tab.projectId,
        isTransient: tab.isTransient || false,
      };
    }
  });
  setSessionItem(SESSION_KEYS.ALL_TABS, serializedTabs);
};

export const getAllTabs = (): SerializedTab[] => {
  return getSessionItem<SerializedTab[]>(SESSION_KEYS.ALL_TABS, []);
};

export const clearAllTabs = (): void => {
  removeSessionItem(SESSION_KEYS.ALL_TABS);
};

export const saveActiveTabIndex = (index: number): void => {
  setSessionItem(SESSION_KEYS.ACTIVE_TAB_INDEX, index);
};

export const getActiveTabIndex = (): number => {
  return getSessionItem<number>(SESSION_KEYS.ACTIVE_TAB_INDEX, 0);
};

export const clearActiveTabIndex = (): void => {
  removeSessionItem(SESSION_KEYS.ACTIVE_TAB_INDEX);
};

export const saveSelectedEndpoint = (endpointId: string): void => {
  setSessionItem(SESSION_KEYS.SELECTED_ENDPOINT, endpointId);
};

export const getSelectedEndpoint = (): string | null => {
  return getSessionItem<string | null>(SESSION_KEYS.SELECTED_ENDPOINT, null);
};

export const clearSelectedEndpoint = (): void => {
  removeSessionItem(SESSION_KEYS.SELECTED_ENDPOINT);
};

export const saveSelectedEnvironment = (environmentId: string): void => {
  setSessionItem(SESSION_KEYS.SELECTED_ENVIRONMENT, environmentId);
};

export const getSelectedEnvironment = (): string => {
  return getSessionItem<string>(SESSION_KEYS.SELECTED_ENVIRONMENT, "");
};

export const clearSelectedEnvironment = (): void => {
  removeSessionItem(SESSION_KEYS.SELECTED_ENVIRONMENT);
};

// Utility to check if sessionStorage is available
export const isSessionStorageAvailable = (): boolean => {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, 'test');
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};