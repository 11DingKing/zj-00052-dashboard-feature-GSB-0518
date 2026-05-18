const STORAGE_KEYS = {
  DASHBOARDS: "dashboard_dashboards",
  THEME: "dashboard_theme",
  DATA_SOURCES: "dashboard_data_sources",
  SHARE_TOKENS: "dashboard_share_tokens",
};

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return defaultValue;
  }
}

export function saveDashboards(data: any): void {
  saveToStorage(STORAGE_KEYS.DASHBOARDS, data);
}

export function loadDashboards(): any {
  return loadFromStorage(STORAGE_KEYS.DASHBOARDS, []);
}

export function saveTheme(isDark: boolean): void {
  saveToStorage(STORAGE_KEYS.THEME, { isDark });
}

export function loadTheme(): boolean {
  const data = loadFromStorage(STORAGE_KEYS.THEME, { isDark: false });
  return data.isDark;
}

export function saveDataSources(data: any): void {
  saveToStorage(STORAGE_KEYS.DATA_SOURCES, data);
}

export function loadDataSources(): any {
  return loadFromStorage(STORAGE_KEYS.DATA_SOURCES, []);
}

export function saveShareTokens(data: any): void {
  saveToStorage(STORAGE_KEYS.SHARE_TOKENS, data);
}

export function loadShareTokens(): any {
  return loadFromStorage(STORAGE_KEYS.SHARE_TOKENS, []);
}
