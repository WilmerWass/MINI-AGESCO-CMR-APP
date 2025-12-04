declare global {
  interface Window {
    api: {
      getCliente: (asesorId: string) => Promise<any[]>;
      addCliente: (cliente: any) => Promise<number>;
      updateCliente: (id: number, updates: any) => Promise<void>;
      deleteCliente: (id: number) => Promise<void>;

      getAgentes: (asesorId: string) => Promise<any[]>;
      addAgente: (agente: any) => Promise<number>;
      updateAgente: (id: number, updates: any) => Promise<void>;
      deleteAgente: (id: number) => Promise<void>;

      getAvisos: (asesorId: string) => Promise<any[]>;
      addAviso: (aviso: any) => Promise<number>;
      updateAviso: (id: number, updates: any) => Promise<void>;
      deleteAviso: (id: number) => Promise<void>;

      getEnlaces: (asesorId: string) => Promise<any[]>;
      addEnlace: (enlace: any) => Promise<number>;
      updateEnlace: (id: number, updates: any) => Promise<void>;
      deleteEnlace: (id: number) => Promise<void>;

      getUsuarios: () => Promise<any[]>;
      addUsuario: (usuario: any) => Promise<number>;
      updateUsuario: (id: number, updates: any) => Promise<void>;
      deleteUsuario: (id: number) => Promise<void>;
    };
  }
}

export {};
