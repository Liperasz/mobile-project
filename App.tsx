import { useState } from "react";
import LoginScreen from "./src/screens/login-screen";

export default function App() {

    // define se usuário já está logado
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // se não está logado, vai pra tela de login
    if (!isLoggedIn) {
        return <LoginScreen onLogin={() => setIsLoggedIn(true)}></LoginScreen>;
    }

    return <LoginScreen onLogin={() => setIsLoggedIn(true)}></LoginScreen>;
}