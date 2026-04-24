import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';


interface LoginScreenProps{
    // o que é executado depois do login
    onLogin: () => void;
    // função para ir para a tela de cadastro
    onNavigateToRegister: () => void;
}

export default function LoginScreen( { onLogin, onNavigateToRegister }: LoginScreenProps) {

    // cores dos temas
    const { colors } = useTheme();
    // variaveis de email e senha
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    // função que lida com o login (verificando se os campos estão vazios)
    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Preencha e-mail e senha!!!');
            return;
        }
        onLogin();
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>

            {/* header da página*/}
            <View style={styles.header}>
                {/* imagem da logo do projeto */}
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {/* título */}
                <Text style={[styles.title, {color: colors.primaryDark}]}>
                    WasteGo
                </Text>
                {/* subtítulo */}
                <Text style={[styles.subtitle, {color: colors.textMuted}]}>
                    Conectando cidadãos, empresas, governo e cooperativas.
                </Text>
            </View>

            {/* conteúdo da página */}
            <View style={styles.form}>
                {/* campos de email e senha */}
                <Input
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="exemplo@email.com"
                />
                <Input
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="********"
                />
            </View>

            {/* rodapé / footer */}
            <View style={styles.cta}>
                <Button label="Entrar" onPress={handleLogin}></Button>
                <Button
                    label="Criar conta"
                    onPress={(onNavigateToRegister)}
                    variant='ghost'
                    style={{marginTop: 10}}
                >
                </Button>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 28 },
    header:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    logo:      { width: 80, height: 80 },
    title:     { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
    subtitle:  { fontSize: 14, textAlign: 'center' },
    form:      { flex: 1, justifyContent: 'center' },
    cta:       { paddingBottom: 16 },
});