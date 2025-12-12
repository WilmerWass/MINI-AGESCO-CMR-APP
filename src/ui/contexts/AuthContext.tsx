import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { aplicarDatosRecibidos } from '../../lib/sync_handler';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'asesor';
    status: 'Activo' | 'Inactivo';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
    isAdmin: () => boolean;
    isAsesor: () => boolean;
}

// Respuesta esperada del login desde el preload (Electron API)
interface LoginResponse {
    success: boolean;
    user?: unknown; // validado con type guard
    message?: string;
}

// Type guard para validar la forma del usuario recibido (p. ej., desde sessionStorage o API)
function isUser(value: unknown): value is User {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    const roleOk = v.role === 'admin' || v.role === 'asesor';
    const statusOk = v.status === 'Activo' || v.status === 'Inactivo';
    return (
        typeof v.id === 'string' &&
        typeof v.email === 'string' &&
        typeof v.name === 'string' &&
        roleOk &&
        statusOk &&
        (v.avatar === undefined || typeof v.avatar === 'string')
    );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Check for user session on initial load (optional, simple implementation)
    useEffect(() => {
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
            try {
                const parsed = JSON.parse(sessionUser) as unknown;
                if (isUser(parsed)) {
                    setUser(parsed);
                    setIsAuthenticated(true);
                } else {
                    // Datos inválidos almacenados previamente
                    sessionStorage.removeItem('user');
                }
            } catch {
                // JSON inválido
                sessionStorage.removeItem('user');
            }
        }
    }, []);

    useEffect(() => {
        const handleGetCurrentUser = (_event: any, responseChannel: string) => {
            const sessionUser = sessionStorage.getItem('user');
            let currentUser: User | null = user;

            if (!currentUser && sessionUser) {
                try {
                    const parsed = JSON.parse(sessionUser);
                    if (isUser(parsed)) {
                        currentUser = parsed;
                    }
                } catch {
                    // Invalid JSON, do nothing
                }
            }

            window.ipcRenderer.send(responseChannel, currentUser);
        };

        const handleP2pDataIn = (_event: any, data: any) => {
            console.log('Received p2p data in renderer:', data);
            aplicarDatosRecibidos(data);
        };

        window.ipcRenderer.on('get-current-user-request', handleGetCurrentUser);
        window.ipcRenderer.on('p2p-data-in', handleP2pDataIn);


        return () => {
            window.ipcRenderer.off('get-current-user-request', handleGetCurrentUser);
            window.ipcRenderer.off('p2p-data-in', handleP2pDataIn);
        };
    }, [user]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!window.api || !window.api.login) {
                throw new Error('La función de login no está disponible en la API.');
            }

            const response = (await window.api.login({ email, password })) as LoginResponse;

            if (response.success && response.user && isUser(response.user)) {
                setUser(response.user);
                setIsAuthenticated(true);
                sessionStorage.setItem('user', JSON.stringify(response.user)); // Persist session
            } else {
                throw new Error(response.message || 'Credenciales incorrectas.');
            }
        } catch (err: unknown) {
            console.error('Error de login:', err);
            const message = err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión.';
            setError(message);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('user');
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser: User = { ...user, ...updatedUser };
            setUser(newUser);
            sessionStorage.setItem('user', JSON.stringify(newUser));
        }
    };

    const isAdmin = (): boolean => {
        return user?.role === 'admin';
    };

    const isAsesor = (): boolean => {
        return user?.role === 'asesor';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout, updateUser, isAdmin, isAsesor }}>
            {children}
        </AuthContext.Provider>
    );
};
