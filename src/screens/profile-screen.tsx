import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';

// componente
export default function ProfileScreen() {

    const { colors, scheme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const isDark = scheme === 'dark';

    const handleLogout = async () => {
        await logout();
        // o RootNavigator detecta user = null e redireciona automaticamente para Login
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >
            {/* header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>
                    Perfil
                </Text>
            </View>

            {/* avatar e nome */}
            <View style={[styles.avatarSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>
                    {user?.name ?? '—'}
                </Text>
                <View style={[styles.typeBadge, {
                    backgroundColor: user?.type === 'citizen' ? '#dbeafe' : '#dcfce7',
                }]}>
                    <Text style={[styles.typeBadgeText, {
                        color: user?.type === 'citizen' ? '#1e40af' : '#166534',
                    }]}>
                        {user?.type === 'citizen' ? '🏘️ Cidadão' : '🏭 Cooperativa'}
                    </Text>
                </View>
            </View>

            {/* informações da conta */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    INFORMAÇÕES DA CONTA
                </Text>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>E-mail</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email ?? '—'}</Text>
                </View>

                {user?.address ? (
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Endereço</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{user.address}</Text>
                    </View>
                ) : null}
            </View>

            {/* preferências */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    PREFERÊNCIAS
                </Text>

                <Pressable
                    onPress={toggleTheme}
                    style={({ pressed }) => [styles.preferenceRow, { opacity: pressed ? 0.7 : 1 }]}
                >
                    <View style={styles.preferenceLeft}>
                        <Text style={styles.preferenceIcon}>{isDark ? '🌙' : '☀️'}</Text>
                        <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                            Tema {isDark ? 'Escuro' : 'Claro'}
                        </Text>
                    </View>
                    <View style={[styles.toggleTrack, { backgroundColor: isDark ? colors.primary : colors.border }]}>
                        <View style={[styles.toggleThumb, { left: isDark ? 20 : 2 }]} />
                    </View>
                </Pressable>
            </View>

            {/* botão de logout */}
            <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
                <Text style={styles.logoutBtnText}>🚪 Sair da Conta</Text>
            </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

// estilização
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 40 },
    header: {
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    avatarSection: {
        alignItems: 'center',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 36,
        color: '#fff',
        fontWeight: '700',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
    },
    typeBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
    },
    typeBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
    },
    infoRow: {
        gap: 2,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
    },
    preferenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    preferenceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    preferenceIcon: { fontSize: 22 },
    preferenceLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    toggleTrack: {
        width: 46,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        position: 'relative',
    },
    toggleThumb: {
        position: 'absolute',
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    logoutBtn: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#ef4444',
        alignItems: 'center',
    },
    logoutBtnText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 15,
    },
});
