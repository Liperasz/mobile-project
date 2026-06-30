import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../context/theme-context';

// prefixo padrão para evitar colisão de chaves
const PREFIX = '@wastego:';

export type StoredUser = {
    id: number;
    name: string;
    email: string;
    type: 'citizen' | 'cooperative';
    address?: string | null;
};

const KEYS = {
    currentUser: `${PREFIX}current_user`,
    theme:       `${PREFIX}theme`,
};

export const storageService = {

    // sessão do usuário

    async saveCurrentUser(user: StoredUser): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.currentUser, JSON.stringify(user));
        } catch (e) {
            throw new Error('Erro ao salvar sessão.');
        }
    },

    async getCurrentUser(): Promise<StoredUser | null> {
        try {
            const value = await AsyncStorage.getItem(KEYS.currentUser);
            if (value === null) return null;
            return JSON.parse(value) as StoredUser;
        } catch (e) {
            return null;
        }
    },

    async clearSession(): Promise<void> {
        try {
            await AsyncStorage.removeItem(KEYS.currentUser);
        } catch (e) {
            throw new Error('Erro ao encerrar sessão.');
        }
    },

    // preferência de tema

    async saveTheme(scheme: ColorScheme): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.theme, scheme);
        } catch (e) {
            // falha silenciosa — tema padrão será usado
        }
    },

    async getTheme(): Promise<ColorScheme | null> {
        try {
            const value = await AsyncStorage.getItem(KEYS.theme);
            if (value === 'light' || value === 'dark') return value;
            return null;
        } catch (e) {
            return null;
        }
    },
};
