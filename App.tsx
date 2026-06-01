import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/theme-context';

import AnnounceScreen from './src/screens/announce-screen';
import EcopointsScreen from './src/screens/ecopoints-screen';
import HomeScreen from './src/screens/home-screen';
import LoginScreen from './src/screens/login-screen';
import RegisterScreen from './src/screens/register-screen';

// todas as telas que podem ser chamadas
type Screen = 'login' | 'register' | 'home' | 'ecopoints' | 'announce' | 'profile';

// função com a lógica dos temas
function AppContent() {

    // constante com a tela atual exibida (inicia com a tela de login)
    const [currentScreen, setCurrentScreen] = useState<Screen>('login');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const userToken = await AsyncStorage.getItem('@user_logged');
                if (userToken) {
                    setCurrentScreen('home');
                }
            } catch (e) {
                console.error("Erro ao ler AsyncStorage", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkLoginStatus();
    }, []);
    
    // Pegando as cores do tema para a barra de navegação e o fundo global
    const { colors } = useTheme();

    // verifica se o usuário já fez login (se a tela atual é uma das telas principais)
    const isMainScreen = ['home', 'ecopoints', 'announce', 'profile'].includes(currentScreen);

    // definindo as abas de navegação
    const tabs = [
        { id: 'home', label: 'Início', icon: '🏠' },
        { id: 'ecopoints', label: 'Mapa', icon: '🗺️' },
        { id: 'announce', label: 'Anunciar', icon: '📢' },
        { id: 'profile', label: 'Perfil', icon: '👤' },
    ] as const;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            
            {/* Renderização das Telas */}
            <View style={styles.mainContent}>
                {/* se for a tela de login */}
                {currentScreen === 'login' && (
                    <LoginScreen
                        // ao realizar login, manda para o home
                        onLogin={() => setCurrentScreen('home')}
                        // se clicou para fazer cadastro, manda para register
                        onNavigateToRegister={() => setCurrentScreen('register')}
                    />
                )}
                {/* tela de registro */}
                {currentScreen === 'register' && (
                    // se clicar que já tem conta, volta para login
                    <RegisterScreen onBackToLogin={() => setCurrentScreen('login')} />
                )}

                {/* telas normais de navegação*/}
                {currentScreen === 'home' && <HomeScreen />}
                
                {currentScreen === 'ecopoints' && <EcopointsScreen />}
                
                {currentScreen === 'announce' && <AnnounceScreen />}
                
                {/* ainda não fiz a tela do perfil do usuário */}
                {currentScreen === 'profile' && (
                    <View style={styles.placeholderContainer}>
                        <Text style={[styles.placeholderText, { color: colors.textMuted, marginBottom: 20 }]}>
                            Tela de Perfil em construção...
                        </Text>
                        <Pressable 
                            style={styles.logoutBtn}
                            onPress={async () => {
                                await AsyncStorage.removeItem('@user_logged');
                                setCurrentScreen('login');
                            }}
                        >
                            <Text style={styles.logoutBtnText}>Sair da Conta</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* barra de navegação Inferior */}
            {isMainScreen && (
                <View style={[styles.navBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    {tabs.map((tab) => {
                        const isActive = currentScreen === tab.id;
                        return (
                            <Pressable
                                key={tab.id}
                                onPress={() => setCurrentScreen(tab.id as Screen)}
                                style={styles.navItem}
                            >
                                <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.5 }]}>
                                    {tab.icon}
                                </Text>
                                <Text
                                    style={[
                                        styles.navLabel,
                                        {
                                            color: isActive ? colors.primary : colors.textMuted,
                                            fontWeight: isActive ? '700' : '500'
                                        }
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </SafeAreaView>
    );
}

// Componente App está separado para conseguir mandar o tema para o resto
export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </SafeAreaProvider>

    );
}

// Estilização global e da barra de navegação
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    navBar: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    navLabel: {
        fontSize: 11,
        letterSpacing: 0.3,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    logoutBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
    },
    logoutBtnText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 15,
    }
});