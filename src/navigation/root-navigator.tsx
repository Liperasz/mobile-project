import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';

// telas
import LoginScreen from '../screens/login-screen';
import RegisterScreen from '../screens/register-screen';
import HomeScreen from '../screens/home-screen';
import AnnounceScreen from '../screens/announce-screen';
import EcopointsScreen from '../screens/ecopoints-screen';
import ProfileScreen from '../screens/profile-screen';
import CoopScreen from '../screens/coop-screen';

// tipos de navegação

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type CitizenTabParamList = {
    Home: undefined;
    Ecopoints: undefined;
    Announce: undefined;
    Profile: undefined;
};

export type CoopTabParamList = {
    CoopHome: undefined;
    Profile: undefined;
};

// instâncias dos navegadores

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CitizenTab = createBottomTabNavigator<CitizenTabParamList>();
const CoopTab = createBottomTabNavigator<CoopTabParamList>();
const RootStack = createNativeStackNavigator();

// tabs do cidadão

function CitizenTabs() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <CitizenTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom + 6,
                    paddingTop: 6,
                    height: 64 + insets.bottom,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <CitizenTab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Início',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏠</Text>
                    ),
                }}
            />
            <CitizenTab.Screen
                name="Ecopoints"
                component={EcopointsScreen}
                options={{
                    tabBarLabel: 'Mapa',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🗺️</Text>
                    ),
                }}
            />
            <CitizenTab.Screen
                name="Announce"
                component={AnnounceScreen}
                options={{
                    tabBarLabel: 'Anunciar',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📢</Text>
                    ),
                }}
            />
            <CitizenTab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>
                    ),
                }}
            />
        </CitizenTab.Navigator>
    );
}

// tabs da cooperativa

function CoopTabs() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <CoopTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom + 6,
                    paddingTop: 6,
                    height: 64 + insets.bottom,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <CoopTab.Screen
                name="CoopHome"
                component={CoopScreen}
                options={{
                    tabBarLabel: 'Coletas',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📋</Text>
                    ),
                }}
            />
            <CoopTab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ focused }) => (
                        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>
                    ),
                }}
            />
        </CoopTab.Navigator>
    );
}

// stack de autenticação

function AuthScreens() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

// navegador raiz

export function RootNavigator() {
    const { user, isLoading } = useAuth();
    const { colors } = useTheme();

    // mostra spinner enquanto verifica a sessão salva
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // não logado → stack de autenticação
                <RootStack.Screen name="Auth" component={AuthScreens} />
            ) : user.type === 'citizen' ? (
                // cidadão logado → tabs do cidadão
                <RootStack.Screen name="CitizenMain" component={CitizenTabs} />
            ) : (
                // cooperativa logada → tabs da cooperativa
                <RootStack.Screen name="CoopMain" component={CoopTabs} />
            )}
        </RootStack.Navigator>
    );
}
