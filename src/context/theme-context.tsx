import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storage-service';

// Definindo os esquemas de cores
export type ColorScheme = 'light' | 'dark';

// Definindo os tipos de cores
export type ThemeColors = {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    border: string;
};

// Estrutura que o contexto vai entregar
interface ThemeContextType {
    scheme: ColorScheme;
    colors: ThemeColors;
    toggleTheme: () => void;
}

// Cores utilizadas em cada tema
const LIGHT_COLORS: ThemeColors = {
    background:   '#f8faf8',
    surface:      '#ffffff',
    text:         '#1a2e1a',
    textMuted:    '#6b7280',
    primary:      '#16a34a',
    primaryDark:  '#166534',
    primaryLight: '#dcfce7',
    border:       '#d1fae5',
};

const DARK_COLORS: ThemeColors = {
    background:   '#0f1a0f',
    surface:      '#1a2e1a',
    text:         '#e8f5e8',
    textMuted:    '#9ca3af',
    primary:      '#4ade80',
    primaryDark:  '#15803d',
    primaryLight: '#14532d',
    border:       '#14532d',
};

// Criando contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export function ThemeProvider({ children }: { children: ReactNode }) {

    // Define o esquema de cores, tendo o light como padrão
    const [scheme, setScheme] = useState<ColorScheme>('light');

    // Carrega a preferência de tema salva no AsyncStorage
    useEffect(() => {
        storageService.getTheme().then((savedTheme) => {
            if (savedTheme) setScheme(savedTheme);
        });
    }, []);

    // Função que troca o tema e persiste a preferência
    const toggleTheme = () => {
        setScheme((prev) => {
            const next: ColorScheme = prev === 'light' ? 'dark' : 'light';
            storageService.saveTheme(next); // persiste no AsyncStorage
            return next;
        });
    };

    // Seleciona as cores
    const colors = scheme === 'light' ? LIGHT_COLORS : DARK_COLORS;

    // Valores enviados
    const value: ThemeContextType = {
        scheme,
        colors,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

// Verificação de erro
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }

    return context;
};