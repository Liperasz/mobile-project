import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';
import { sqliteService } from '../services/sqlite-service';
import { AuthStackParamList } from '../navigation/root-navigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// componente
export default function LoginScreen({ navigation }: Props) {

    const { colors } = useTheme();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {

        let isValid = true;
        setGeneralError('');

        if (!email.trim()) {
            setEmailError('Insira seu e-mail');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Insira sua senha');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!isValid) return;

        setIsLoading(true);
        try {
            // busca o usuário no banco SQLite local
            const user = await sqliteService.getUserByEmail(email);

            if (!user) {
                setGeneralError('Usuário não encontrado. Verifique seu e-mail ou crie uma conta.');
                return;
            }

            // faz login salvando a sessão no AuthContext + AsyncStorage
            await login({
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                address: user.address ?? undefined,
            });

            // o RootNavigator detecta o usuário e redireciona automaticamente

        } catch (e) {
            setGeneralError('Erro ao fazer login. Tente novamente.');
            console.error('[Login]', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header da página */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.title, { color: colors.primaryDark }]}>
                    WasteGo
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Conectando cidadãos e cooperativas.
                </Text>
            </View>

            {/* formulário */}
            <View style={styles.form}>
                <Input
                    label="E-mail"
                    value={email}
                    errorMessage={emailError}
                    onChangeText={(text) => { setEmail(text); setEmailError(''); setGeneralError(''); }}
                    keyboardType="email-address"
                    placeholder="exemplo@email.com"
                />
                <Input
                    label="Senha"
                    value={password}
                    errorMessage={passwordError}
                    onChangeText={(text) => { setPassword(text); setPasswordError(''); setGeneralError(''); }}
                    secureTextEntry
                    placeholder="********"
                />

                {/* mensagem de erro geral */}
                {generalError ? (
                    <Text style={styles.errorText}>{generalError}</Text>
                ) : null}
            </View>

            {/* ações */}
            <View style={styles.cta}>
                <Button
                    label={isLoading ? 'Entrando...' : 'Entrar'}
                    onPress={handleLogin}
                />
                <Button
                    label="Criar conta"
                    onPress={() => navigation.navigate('Register')}
                    variant="ghost"
                    style={{ marginTop: 10 }}
                />
            </View>

        </SafeAreaView>
    );
}

// estilização
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 28,
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    form: {
        flex: 1,
        justifyContent: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
        padding: 12,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    cta: {
        paddingBottom: 16,
    },
});