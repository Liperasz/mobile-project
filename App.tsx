import { useState } from 'react';
import { ThemeProvider } from './src/context/theme-context';
import HomeScreen from './src/screens/home-screen';
import LoginScreen from './src/screens/login-screen';
import RegisterScreen from './src/screens/register-screen';

// tipo para controlar a tela atual
type Screen = 'login' | 'register' | 'home';

export default function App() {

    // controla qual tela está sendo exibida
    const [currentScreen, setCurrentScreen] = useState<Screen>('login');

    return (
        <ThemeProvider>
            {currentScreen === 'login' && (
                <LoginScreen
                    onLogin={() => setCurrentScreen('home')}
                    onNavigateToRegister={() => setCurrentScreen('register')}
                />
            )}
            {currentScreen === 'register' && (
                <RegisterScreen onBackToLogin={() => setCurrentScreen('login')} />
            )}
            {currentScreen === 'home' && (
                <HomeScreen />
            )}
        </ThemeProvider>
    );
}
