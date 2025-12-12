declare global {
  interface Window {
    ipcRenderer: {
      on(channel: string, listener: (event: any, ...args: any[]) => void): void;
      off(channel: string, ...args: any[]): void;
      send(channel: string, ...args: any[]): void;
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
    api: {
      login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; user?: any; message?: string }>;

      getClientes: (asesorId?: string) => Promise<any[]>;
      getClienteById: (id: string) => Promise<any | null>;
      addCliente: (cliente: any) => Promise<any>;
      updateCliente: (id: string, updates: any) => Promise<void>;
      deleteCliente: (id: string) => Promise<void>;

      getAgentes: (asesorId?: string) => Promise<any[]>;
      getAgenteById: (id: string) => Promise<any | null>;
      addAgente: (agente: any) => Promise<any>;
      updateAgente: (id: string, updates: any) => Promise<void>;
      deleteAgente: (id: string) => Promise<void>;

      getAvisos: (user: { id: string; email: string; }) => Promise<any[]>;
      getAvisoById: (id: string) => Promise<any | null>;
      addAviso: (aviso: any) => Promise<any>;
      updateAviso: (id: string, updates: any) => Promise<void>;
      updateAvisoStatus: (id: string, userId: string, status: 'Visto' | 'Pendiente') => Promise<void>;
      deleteAviso: (id: string) => Promise<void>;

      getEnlaces: (asesorId?: string) => Promise<any[]>;
      getEnlaceById: (id: string) => Promise<any | null>;
      addEnlace: (enlace: any) => Promise<any>;
      updateEnlace: (id: string, updates: any) => Promise<void>;
      deleteEnlace: (id: string) => Promise<void>;

      getUsuarios: () => Promise<any[]>;
      getUsuarioById: (id: string) => Promise<any | null>;
      addUsuario: (usuario: any) => Promise<any | null>;
      updateUsuario: (id: string, updates: any) => Promise<void>;
      deleteUsuario: (id: string) => Promise<void>;

      getDashboardData: (period: 'today' | 'week' | 'month' | 'total') => Promise<{ success: boolean; data?: any; message?: string }>;
      getAllSyncData: () => Promise<{ clientes: any[]; agentes: any[]; avisos: any[]; enlaces: any[]; usuarios: any[] }>;
      importBackupData: (data: any) => Promise<{ success: boolean; message: string; stats?: any }>;
      saveAvatar: (filePath: string) => Promise<string | null>;
    };
  }
}

export { };
