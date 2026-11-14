const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sutemiUI', {
  getState: () => ipcRenderer.invoke('app:get-state'),
  refreshData: () => ipcRenderer.invoke('app:refresh'),
  getLiveStats: () => ipcRenderer.invoke('app:live'),
  connectProfile: (profileId) => ipcRenderer.invoke('app:connect', profileId),
  connectBest: (groupId, candidateIds) => ipcRenderer.invoke('app:connect-best', { groupId, candidateIds }),
  disconnect: () => ipcRenderer.invoke('app:disconnect'),
  setMode: (mode) => ipcRenderer.invoke('app:set-mode', mode),
  importText: (text, groupId, smartFilter = true) => ipcRenderer.invoke('app:import', { text, groupId, smartFilter }),
  readClipboard: () => ipcRenderer.invoke('app:read-clipboard'),
  addBuiltinSource: (sourceId, smartFilter = true) => ipcRenderer.invoke('app:add-builtin', { sourceId, smartFilter }),
  updateAllSubs: () => ipcRenderer.invoke('app:update-subs'),
  testLatency: (groupId, profileIds) => ipcRenderer.invoke('app:test-latency', { groupId, profileIds }),
  testSpeedIp: (groupId, profileIds) => ipcRenderer.invoke('app:test-speed-ip', { groupId, profileIds }),
  cancelLatency: () => ipcRenderer.invoke('app:cancel-latency'),
  checkAiAccess: (withSpeed = false) => ipcRenderer.invoke('app:check-ai', { withSpeed }),
  deleteProfiles: (ids) => ipcRenderer.invoke('app:delete-profiles', ids),
  deleteGroup: (groupId) => ipcRenderer.invoke('app:delete-group', groupId),
  getLogs: () => ipcRenderer.invoke('app:get-logs'),
  restartEngine: () => ipcRenderer.invoke('app:restart-engine'),
  onStateChanged: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('app:state-changed', handler);
    return () => ipcRenderer.removeListener('app:state-changed', handler);
  },
  onLatencyProgress: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('app:latency-progress', handler);
    return () => ipcRenderer.removeListener('app:latency-progress', handler);
  }
});