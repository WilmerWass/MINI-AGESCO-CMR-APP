declare global {
  interface Window {
    ipcRenderer: {
      on(channel: string, listener: (event: any, ...args: any[]) => void): void;
      off(channel: string, ...args: any[]): void;
      send(channel: string, ...args: any[]): void;
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
    api: {
      login: (credentials: { email: string; password:string }) => Promise<{ success: boolean; user?: any; message?: string }>;
      
      getClientes: (asesorId?: number) => Promise<any[]>;
      getClienteById: (id: number) => Promise<any | null>;
      addCliente: (cliente: any) => Promise<number>;
      updateCliente: (id: number, updates: any) => Promise<void>;
      deleteCliente: (id: number) => Promise<void>;

      getAgentes: (asesorId?: number) => Promise<any[]>;
      getAgenteById: (id: number) => Promise<any | null>;
      addAgente: (agente: any) => Promise<number>;
      updateAgente: (id: number, updates: any) => Promise<void>;
      deleteAgente: (id: number) => Promise<void>;

      getAvisos: (user: { id: number; email: string; }) => Promise<any[]>;
      getAvisoById: (id: number) => Promise<any | null>;
      addAviso: (aviso: any) => Promise<number>;
      updateAviso: (id: number, updates: any) => Promise<void>;
      deleteAviso: (id: number) => Promise<void>;

      getEnlaces: (asesorId?: number) => Promise<any[]>;
      getEnlaceById: (id: number) => Promise<any | null>;
      addEnlace: (enlace: any) => Promise<number>;
      updateEnlace: (id: number, updates: any) => Promise<void>;
      deleteEnlace: (id: number) => Promise<void>;

      getUsuarios: () => Promise<any[]>;
      getUsuarioById: (id: number) => Promise<any | null>;
      addUsuario: (usuario: any) => Promise<{ success: boolean; userId?: number; message?: string }>;
      updateUsuario: (id: number, updates: any) => Promise<void>;
      deleteUsuario: (id: number) => Promise<void>;

      getDashboardData: (period: 'today' | 'week' | 'month' | 'total') => Promise<{ success: boolean; data?: any; message?: string }>;
      saveAvatar: (filePath: string) => Promise<string | null>;
    };
  }
}

export {};
