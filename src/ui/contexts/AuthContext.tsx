import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
            const parsedUser = JSON.parse(sessionUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!window.api || !window.api.login) {
                throw new Error("La función de login no está disponible en la API.");
            }

            const response = await window.api.login({ email, password });

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                sessionStorage.setItem('user', JSON.stringify(response.user)); // Persist session
            } else {
                throw new Error(response.message || "Credenciales incorrectas.");
            }
        } catch (err: any) {
            console.error("Error de login:", err);
            setError(err.message || "Ocurrió un error al iniciar sesión.");
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
            const newUser = { ...user, ...updatedUser };
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
