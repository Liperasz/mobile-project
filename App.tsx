import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/auth-context';
import { ThemeProvider } from './src/context/theme-context';
import { RootNavigator } from './src/navigation/root-navigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}