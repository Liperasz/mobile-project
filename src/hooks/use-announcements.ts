import { useState, useEffect, useCallback } from 'react';
import { Announcement, AnnouncementStatus, sqliteService } from '../services/sqlite-service';

type Filter = 'all' | 'pending' | 'collected';

type Stats = {
    totalKg: number;
    totalDescartes: number;
    totalPoints: number; // Moedas Verdes (10 pts por kg)
    totalCollected: number;
};

type UseAnnouncementsState = {
    announcements: Announcement[];
    loading: boolean;
    error: string | null;
};

type UseAnnouncementsReturn = UseAnnouncementsState & {
    filter: Filter;
    setFilter: (f: Filter) => void;
    filteredAnnouncements: Announcement[];
    stats: Stats;
    addAnnouncement: (data: {
        userId: number;
        userName: string;
        category: string;
        weightKg: number;
        description?: string;
        photoUri?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    }) => Promise<void>;
    updateStatus: (id: number, status: AnnouncementStatus) => Promise<void>;
    deleteAnnouncement: (id: number) => Promise<void>;
    reload: () => Promise<void>;
};

// hook para gerenciar o CRUD de anúncios de resíduos no SQLite
export function useAnnouncements(userId: number | null): UseAnnouncementsReturn {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>('all');

    const loadAnnouncements = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const rows = userId !== null
                ? await sqliteService.getAnnouncementsByUser(userId)
                : await sqliteService.getAllAnnouncements();
            setAnnouncements(rows);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro ao carregar anúncios.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const addAnnouncement = useCallback(
        async (data: {
            userId: number;
            userName: string;
            category: string;
            weightKg: number;
            description?: string;
            photoUri?: string;
            latitude?: number;
            longitude?: number;
            address?: string;
        }): Promise<void> => {
            await sqliteService.addAnnouncement(data);
            await loadAnnouncements();
        },
        [loadAnnouncements]
    );

    const updateStatus = useCallback(
        async (id: number, status: AnnouncementStatus): Promise<void> => {
            // atualização otimista na UI
            setAnnouncements((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status } : a))
            );
            try {
                await sqliteService.updateAnnouncementStatus(id, status);
            } catch (e) {
                // reverte em caso de erro
                await loadAnnouncements();
                setError(e instanceof Error ? e.message : 'Erro ao atualizar.');
            }
        },
        [loadAnnouncements]
    );

    const deleteAnnouncement = useCallback(
        async (id: number): Promise<void> => {
            // atualização otimista na UI
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            try {
                await sqliteService.deleteAnnouncement(id);
            } catch (e) {
                await loadAnnouncements();
                setError(e instanceof Error ? e.message : 'Erro ao remover.');
            }
        },
        [loadAnnouncements]
    );

    const filteredAnnouncements =
        filter === 'pending'
            ? announcements.filter((a) => a.status === 'pending')
            : filter === 'collected'
            ? announcements.filter((a) => a.status === 'collected')
            : announcements;

    const stats: Stats = {
        totalKg: announcements.reduce((sum, a) => sum + a.weight_kg, 0),
        totalDescartes: announcements.length,
        totalPoints: Math.round(announcements.reduce((sum, a) => sum + a.weight_kg, 0) * 10),
        totalCollected: announcements.filter((a) => a.status === 'collected').length,
    };

    return {
        announcements,
        loading,
        error,
        filter,
        setFilter,
        filteredAnnouncements,
        stats,
        addAnnouncement,
        updateStatus,
        deleteAnnouncement,
        reload: loadAnnouncements,
    };
}
