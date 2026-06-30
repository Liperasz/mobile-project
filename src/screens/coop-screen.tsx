import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ListRenderItemInfo,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/theme-context';
import { useAnnouncements } from '../hooks/use-announcements';
import { Loading } from '../components/loading';
import { ErrorMessage } from '../components/error-message';
import { Announcement } from '../services/sqlite-service';

type FilterTab = { key: 'all' | 'pending' | 'collected'; label: string };

const FILTER_TABS: FilterTab[] = [
    { key: 'all',       label: 'Todos' },
    { key: 'pending',   label: 'Pendentes' },
    { key: 'collected', label: 'Coletados' },
];

const CATEGORY_ICONS: Record<string, string> = {
    'Plástico':   '♻️',
    'Vidro':      '🫙',
    'Eletrônico': '💻',
    'Papel':      '📄',
    'Metal':      '🔩',
    'Orgânico':   '🌿',
};

export default function CoopScreen() {

    const { colors } = useTheme();

    // null = busca todos os anúncios (visão da cooperativa)
    const {
        loading,
        error,
        filter,
        setFilter,
        filteredAnnouncements,
        stats,
        updateStatus,
        reload,
    } = useAnnouncements(null);

    const handleConfirmCollect = (item: Announcement) => {
        Alert.alert(
            'Confirmar Coleta',
            `Marcar o anúncio de ${item.category} (${item.weight_kg}kg) de ${item.user_name} como coletado?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'default',
                    onPress: () => updateStatus(item.id, 'collected'),
                },
            ]
        );
    };

    const handleRevertCollect = (item: Announcement) => {
        Alert.alert(
            'Reverter Status',
            `Marcar este anúncio como pendente novamente?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reverter',
                    style: 'destructive',
                    onPress: () => updateStatus(item.id, 'pending'),
                },
            ]
        );
    };

    const renderCard = ({ item }: ListRenderItemInfo<Announcement>) => {
        const isPending = item.status === 'pending';
        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                {/* Linha principal: ícone + info */}
                <View style={styles.cardHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: colors.primaryLight }]}>
                        <Text style={styles.categoryIconText}>
                            {CATEGORY_ICONS[item.category] ?? '♻️'}
                        </Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                            {item.category} · {item.weight_kg} kg
                        </Text>
                        <Text style={[styles.cardUser, { color: colors.textMuted }]}>
                            👤 {item.user_name}
                        </Text>
                        <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                            {new Date(item.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'short', year: 'numeric',
                            })}
                        </Text>
                    </View>
                    <View style={[styles.statusPill, {
                        backgroundColor: isPending ? '#fef3c7' : '#dcfce7',
                    }]}>
                        <Text style={[styles.statusPillText, {
                            color: isPending ? '#92400e' : '#166534',
                        }]}>
                            {isPending ? '⏳' : '✅'}
                        </Text>
                    </View>
                </View>

                {/* Endereço GPS */}
                {item.address ? (
                    <View style={[styles.addressRow, { borderTopColor: colors.border }]}>
                        <Text style={[styles.addressText, { color: colors.textMuted }]}>
                            📍 {item.address}
                        </Text>
                    </View>
                ) : null}

                {/* Descrição */}
                {item.description ? (
                    <Text style={[styles.description, { color: colors.textMuted }]}>
                        "{item.description}"
                    </Text>
                ) : null}

                {/* Foto thumbnail */}
                {item.photo_uri ? (
                    <Image source={{ uri: item.photo_uri }} style={styles.thumbnail} resizeMode="cover" />
                ) : null}

                {/* Botão de ação */}
                <Pressable
                    onPress={() => isPending ? handleConfirmCollect(item) : handleRevertCollect(item)}
                    style={({ pressed }) => [
                        styles.actionBtn,
                        {
                            backgroundColor: isPending ? colors.primary : 'transparent',
                            borderColor: isPending ? colors.primary : colors.border,
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    <Text style={[styles.actionBtnText, {
                        color: isPending ? '#fff' : colors.textMuted,
                    }]}>
                        {isPending ? '✅ Confirmar Coleta' : '↩️ Reverter para Pendente'}
                    </Text>
                </Pressable>
            </View>
        );
    };

    if (loading) return <Loading message="Carregando anúncios..." />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header com estatísticas */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <Text style={styles.headerTitle}>Coletas Disponíveis</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.totalDescartes}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#fef3c7' }]}>
                            {stats.totalDescartes - stats.totalCollected}
                        </Text>
                        <Text style={styles.statLabel}>Pendentes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#dcfce7' }]}>
                            {stats.totalCollected}
                        </Text>
                        <Text style={styles.statLabel}>Coletados</Text>
                    </View>
                </View>
            </View>

            {/* Abas de filtro */}
            <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {FILTER_TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        style={[styles.tab, filter === tab.key && [styles.tabActive, { borderBottomColor: colors.primary }]]}
                        onPress={() => setFilter(tab.key as any)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: filter === tab.key ? colors.primary : colors.textMuted },
                        ]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Lista de anúncios */}
            <FlatList
                data={filteredAnnouncements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCard}
                contentContainerStyle={styles.listContent}
                onRefresh={reload}
                refreshing={loading}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            {filter === 'pending'
                                ? 'Nenhum anúncio pendente.'
                                : filter === 'collected'
                                    ? 'Nenhuma coleta confirmada ainda.'
                                    : 'Nenhum anúncio disponível.'}
                        </Text>
                        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                            Aguarde cidadãos publicarem anúncios de resíduos.
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        gap: 14,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: { alignItems: 'center', gap: 2 },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {},
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        gap: 12,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconText: { fontSize: 22 },
    cardInfo: { flex: 1, gap: 2 },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    cardUser: { fontSize: 13 },
    cardDate: { fontSize: 11 },
    statusPill: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusPillText: { fontSize: 16 },
    addressRow: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 8,
    },
    addressText: { fontSize: 12 },
    description: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    thumbnail: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        backgroundColor: '#eee',
    },
    actionBtn: {
        borderRadius: 10,
        borderWidth: 1.5,
        padding: 12,
        alignItems: 'center',
    },
    actionBtnText: {
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyIcon: { fontSize: 40 },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyHint: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
});
