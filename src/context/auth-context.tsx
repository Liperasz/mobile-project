import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { storageService, StoredUser } from '../services/storage-service';

// estrutura que o contexto vai entregar

export type AuthUser = StoredUser;

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (user: AuthUser) => Promise<void>;
    logout: () => Promise<void>;
}

// criando contexto

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// provider

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restaura a sessão ao iniciar o app
    useEffect(() => {
        storageService.getCurrentUser().then((storedUser) => {
            setUser(storedUser);
            setIsLoading(false);
        });
    }, []);

    // Salva o usuário no contexto e no AsyncStorage
    const login = useCallback(async (authUser: AuthUser): Promise<void> => {
        await storageService.saveCurrentUser(authUser);
        setUser(authUser);
    }, []);

    // Remove a sessão do contexto e do AsyncStorage
    const logout = useCallback(async (): Promise<void> => {
        await storageService.clearSession();
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// verificação de erro

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
};
