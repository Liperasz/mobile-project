import { useState } from "react";
import { ThemeProvider } from "./src/context/theme-context";
import LoginScreen from "./src/screens/login-screen";
import RegisterScreen from "./src/screens/register-screen";

// inicia o app
export default function App() {

    // constante para ver se está logado
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // constante para alterar entre tela de login e tela de cadastro
    const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

    // se o usuário já está logado
    if (isLoggedIn) {
        // futura página home
        return (
            <ThemeProvider>
                <LoginScreen
                    onLogin={() => setIsLoggedIn(true)}
                    onNavigateToRegister={() => setCurrentScreen('register')}></LoginScreen>
            </ThemeProvider>
        );
    }

    // navegação entre tela de login e tela de cadastro
    return (
        <ThemeProvider>
            {currentScreen === 'login' ? (
                <LoginScreen 
                    onLogin={() => setIsLoggedIn(true)} 
                    onNavigateToRegister={() => setCurrentScreen('register')} 
                />
            ) : (
                <RegisterScreen onBackToLogin={() => setCurrentScreen('login')} />
            )}
        </ThemeProvider>
    );

}