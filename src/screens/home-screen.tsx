import React from 'react';
import {
    FlatList,
    ListRenderItemInfo,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/card';
import { Loading } from '../components/loading';
import { ErrorMessage } from '../components/error-message';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';
import { useAnnouncements } from '../hooks/use-announcements';
import { Announcement } from '../services/sqlite-service';

// ícones por categoria
const CATEGORY_ICONS: Record<string, string> = {
    'Plástico':   '♻️',
    'Vidro':      '🫙',
    'Eletrônico': '💻',
    'Papel':      '📄',
    'Metal':      '🔩',
    'Orgânico':   '🌿',
};

// componente
export default function HomeScreen() {

    const { colors, scheme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const isDark = scheme === 'dark';

    const { filteredAnnouncements, loading, error, stats } = useAnnouncements(user?.id ?? null);

    const renderHistoryItem = ({ item }: ListRenderItemInfo<Announcement>) => (
        <Card>
            <View style={styles.histRow}>
                <Text style={styles.histIcon}>
                    {CATEGORY_ICONS[item.category] ?? '♻️'}
                </Text>
                <View style={styles.histTextContainer}>
                    <Text style={[styles.histTitle, { color: colors.text }]}>
                        {item.category} · {item.weight_kg}kg
                    </Text>
                    <Text style={[styles.histDate, { color: colors.textMuted }]}>
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
                <View style={styles.histRight}>
                    <Text style={[styles.histPts, { color: colors.primary }]}>
                        +{Math.round(item.weight_kg * 10)} MV
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'collected' ? '#dcfce7' : '#fef3c7' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'collected' ? '#166534' : '#92400e' }
                        ]}>
                            {item.status === 'collected' ? 'Coletado' : 'Pendente'}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    if (loading) return <Loading message="Carregando histórico..." />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    WasteGo
                </Text>
                <Pressable
                    onPress={toggleTheme}
                    style={({ pressed }) => [styles.themeBtn, { borderColor: colors.border }, pressed && styles.themeBtnPressed]}
                >
                    <Text style={[styles.themeBtnText, { color: colors.primary }]}>
                        {isDark ? '🌙 Dark' : '☀️ Light'}
                    </Text>
                </Pressable>
            </View>

            <FlatList
                data={filteredAnnouncements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={() => (
                    <>
                        {/* Saudação */}
                        <Text style={[styles.greeting, { color: colors.textMuted }]}>
                            Olá, {user?.name?.split(' ')[0]} 👋
                        </Text>

                        {/* Card de Moedas Verdes */}
                        <View style={[styles.coinsCard, { backgroundColor: colors.primary }]}>
                            <Text style={styles.coinsLabel}>Moedas Verdes</Text>
                            <Text style={styles.coinsValue}>{stats.totalPoints} MV</Text>
                        </View>

                        {/* Estatísticas reais do banco */}
                        <View style={styles.statsRow}>
                            {[
                                [`${stats.totalKg.toFixed(1)} kg`, 'Reciclados'],
                                [`${stats.totalDescartes}`, 'Descartes'],
                                [`${stats.totalCollected}`, 'Coletados'],
                            ].map(([val, lbl]) => (
                                <View
                                    key={lbl}
                                    style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                >
                                    <Text style={[styles.statNum, { color: colors.primary }]}>{val}</Text>
                                    <Text style={[styles.statLbl, { color: colors.textMuted }]}>{lbl}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            Histórico recente
                        </Text>
                    </>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Nenhum anúncio ainda.
                        </Text>
                        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                            Vá para a aba "Anunciar" para registrar seu primeiro descarte!
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

// estilização
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    themeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    themeBtnPressed: { opacity: 0.7 },
    themeBtnText: { fontSize: 13 },
    list: { padding: 16 },
    greeting: {
        fontSize: 14,
        marginBottom: 12,
    },
    coinsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
    },
    coinsLabel: {
        color: 'rgba(255,255,255,.7)',
        fontSize: 13,
        fontWeight: '600',
    },
    coinsValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    stat: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    statNum: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLbl: {
        fontSize: 10,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    histRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    histIcon: { fontSize: 22 },
    histTextContainer: { flex: 1 },
    histTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    histDate: { fontSize: 12 },
    histRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    histPts: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
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