import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...listener] = args
    return ipcRenderer.off(channel, ...listener)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...data] = args
    ipcRenderer.send(channel, ...data)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...data] = args
    return ipcRenderer.invoke(channel, ...data)
  },
})

contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (credentials: { email: string; password: string }) => ipcRenderer.invoke('login', credentials),

  // Dashboard
  getDashboardData: (period: 'today' | 'week' | 'month' | 'total') => ipcRenderer.invoke('get-dashboard-data', period),

  // Clientes
  getClientes: (asesorId: string) => ipcRenderer.invoke('get-clientes', asesorId),
  addCliente: (cliente: any) => ipcRenderer.invoke('add-cliente', cliente),
  updateCliente: (id: number, updates: any) => ipcRenderer.invoke('update-cliente', id, updates),
  deleteCliente: (id: number) => ipcRenderer.invoke('delete-cliente', id),

  // Agentes
  getAgentes: (asesorId: string) => ipcRenderer.invoke('get-agentes', asesorId),
  addAgente: (agente: any) => ipcRenderer.invoke('add-agente', agente),
  updateAgente: (id: number, updates: any) => ipcRenderer.invoke('update-agente', id, updates),
  deleteAgente: (id: number) => ipcRenderer.invoke('delete-agente', id),

  // Avisos
  getAvisos: (user: { id: string; email: string; }) => ipcRenderer.invoke('get-avisos', user),
  addAviso: (aviso: any) => ipcRenderer.invoke('add-aviso', aviso),
  updateAviso: (id: string, updates: any) => ipcRenderer.invoke('update-aviso', id, updates),
  updateAvisoStatus: (id: string, userId: string, status: 'Visto' | 'Pendiente') => ipcRenderer.invoke('update-aviso-status', id, userId, status),
  deleteAviso: (id: string) => ipcRenderer.invoke('delete-aviso', id),

  // Enlaces
  getEnlaces: (asesorId: string) => ipcRenderer.invoke('get-enlaces', asesorId),
  addEnlace: (enlace: any) => ipcRenderer.invoke('add-enlace', enlace),
  updateEnlace: (id: number, updates: any) => ipcRenderer.invoke('update-enlace', id, updates),
  deleteEnlace: (id: number) => ipcRenderer.invoke('delete-enlace', id),

  // Usuarios
  getUsuarios: () => ipcRenderer.invoke('get-usuarios'),
  addUsuario: (usuario: any) => ipcRenderer.invoke('add-usuario', usuario),
  updateUsuario: (id: number, updates: any) => ipcRenderer.invoke('update-usuario', id, updates),
  deleteUsuario: (id: number) => ipcRenderer.invoke('delete-usuario', id),

  // Profile
  saveAvatar: (filePath: string) => ipcRenderer.invoke('save-avatar', filePath),

  // Backup & Sync
  getAllSyncData: () => ipcRenderer.invoke('get-all-sync-data'),
  importBackupData: (data: any) => ipcRenderer.invoke('import-backup-data', data),
})
