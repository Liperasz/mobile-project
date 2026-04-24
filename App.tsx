import { useState } from "react";
import { ThemeProvider } from "./src/context/theme-context";
import LoginScreen from "./src/screens/login-screen";

// inicia o app
export default function App() {

    // constante para ver se está logado
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <ThemeProvider>
            {!isLoggedIn ? (
                <LoginScreen onLogin={() => setIsLoggedIn(true)} />
            ) : (
                /* Aqui você colocaria sua tela de Home/Principal futuramente */
                <LoginScreen onLogin={() => setIsLoggedIn(true)} />
            )}
        </ThemeProvider>
    );
}