import React from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../components/card';
import { useTheme } from '../context/theme-context';

// informações do histórico
type HistoryItem = {
    id: string;
    cat: string;
    kg: number;
    pts: number;
    date: string;
    icon: string;
};

// dados inventados
const MOCK_HISTORY: HistoryItem[] = [
    { id: 'h1', cat: 'Plástico',   kg: 3.2, pts: 32, date: '22 jul 2025', icon: '♻' },
    { id: 'h2', cat: 'Vidro',      kg: 1.8, pts: 18, date: '18 jul 2025', icon: '🫙' },
    { id: 'h3', cat: 'Eletrônico', kg: 0.9, pts: 45, date: '15 jul 2025', icon: '💻' },
    { id: 'h4', cat: 'Papel',      kg: 5.0, pts: 20, date: '10 jul 2025', icon: '📄' },
];

export default function HomeScreen() {

    // cores e toogle do sistema (para fazer a mudança do tema claro para o escuro)
    const { colors, scheme, toggleTheme } = useTheme();
    const isDark = scheme === 'dark';

    // item da flatlist — está isolado para maior performance
    const renderHistoryItem = ({ item }: ListRenderItemInfo<HistoryItem>) => (
        <Card>
            <View style={styles.histRow}>
                <Text style={styles.histIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.histTitle, { color: colors.text }]}>
                        {item.cat} · {item.kg}kg
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        {item.date}
                    </Text>
                </View>
                <Text style={[styles.histPts, { color: colors.primary }]}>
                    +{item.pts} MV
                </Text>
            </View>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header com alteração de tema */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    WasteGo
                </Text>
                {/* botão para alternar tema */}
                <Pressable
                    onPress={toggleTheme}
                    style={({ pressed }) => [styles.themeBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                    <Text style={{ color: colors.primary, fontSize: 13 }}>
                        {isDark ? '🌙 Dark' : '☀ Light'}
                    </Text>
                </Pressable>
            </View>

            {/* conteúdo da tela */}
            <FlatList
                data={MOCK_HISTORY}
                keyExtractor={item => item.id}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={() => (
                    <>
                        {/* card das moedas verde */}
                        <View style={[styles.coinsCard, { backgroundColor: colors.primary }]}>
                            <Text style={styles.coinsLabel}>Moedas Verdes</Text>
                            <Text style={styles.coinsValue}>1.240 MV</Text>
                        </View>

                        {/* estatisticas genéricas */}
                        <View style={styles.statsRow}>
                            {[
                                ['47.3 kg', 'Reciclados'],
                                ['12',      'Descartes'],
                                ['5',       'Cooperativas'],
                            ].map(([val, lbl]) => (
                                <View
                                    key={lbl}
                                    style={[
                                        styles.stat,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.statNum, { color: colors.primary }]}>
                                        {val}
                                    </Text>
                                    <Text style={[styles.statLbl, { color: colors.textMuted }]}>
                                        {lbl}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                            Histórico recente
                        </Text>
                    </>
                )}
            />
        </View>
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
        borderBottomWidth: 1
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: '700'
    },
    themeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1
    },
    list: { padding: 16 },
    coinsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 12
    },
    coinsLabel: { 
        color: 'rgba(255,255,255,.7)',
        fontSize: 13,
        fontWeight: '600'
    },
    coinsValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
        marginTop: 4
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16
    },
    stat: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1
    },
    statNum: {
        fontSize: 18,
        fontWeight: '700'
    },
    statLbl: {
        fontSize: 10,
        marginTop: 2,
        textTransform: 'uppercase'
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8
    },
    histRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    histIcon: { fontSize: 22 },
    histTitle: {
        fontSize: 14,
        fontWeight: '500'
    },
    histPts: {
        fontSize: 14,
        fontWeight: '700'
    },
});
