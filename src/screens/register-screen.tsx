import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';

// depois de criar a conta, volta a tela de login
interface RegisterScreenProps {
    onBackToLogin: () => void;
}

export default function RegisterScreen({ onBackToLogin }: RegisterScreenProps) {

    // pega as telas do esquema de cores
    const { colors } = useTheme();

    // campos de preenchimento
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // verifica se as senhas são diferentes
    const passwordsMatch = password === confirmPassword;
    // constante para mostrar erro caso as senhas estejam diferentes
    const showPasswordError = confirmPassword.length > 0 && !passwordsMatch;

    // função para lidar com o registro
    const handleRegister = () => {

        // se tiver algum campo vazio, pede para preencher os campos
        if (!fullName || !cpf || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        // se as senhas não forem iguais
        if (!passwordsMatch) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        // tudo certo, conta criada
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
            { text: 'OK', onPress: onBackToLogin }
        ]);
    };

    return (

        // precisa do scroll view para rolar a tela por causa da quantidade de informações
        <ScrollView 
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* header da tela */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.title, { color: colors.primaryDark }]}>
                    Criar Conta
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Preencha os dados abaixo
                </Text>
            </View>

            {/* conteúdo da tela */}
            <View style={styles.form}>
                <Input
                    label="Nome Completo"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Digite seu nome"
                />
                <Input
                    label="CPF"
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                    placeholder="000.000.000-00"
                />
                <Input
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholder="exemplo@email.com"
                />
                
                {/* mensagem de erro de senhas diferentes */}
                {showPasswordError && (
                    <Text style={styles.errorText}>As senhas estão diferentes</Text>
                )}
                
                <Input
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="********"
                />
                <Input
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="********"
                />
            </View>

            {/* rodapé /footer da tela*/}
            <View style={styles.cta}>
                <Button label="Cadastrar" onPress={handleRegister} />
                <Button
                    label="Já tenho uma conta"
                    onPress={onBackToLogin}
                    variant="ghost"
                    style={{ marginTop: 10 }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    logo: { width: 80, height: 80 },
    container: { flex: 1 },
    content: { padding: 28, paddingBottom: 50 },
    header: { marginBottom: 32, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginTop: 4 },
    form: { marginBottom: 24 },
    cta: { marginTop: 8 },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'right'
    }
});