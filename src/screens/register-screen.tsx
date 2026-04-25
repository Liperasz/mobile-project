import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AlertBox from '../components/alert-box';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';

// propriedades da tela de registro
type RegisterScreenProps = {
    onBackToLogin: () => void;
};

export default function RegisterScreen({ onBackToLogin }: RegisterScreenProps) {

    // pega as telas do esquema de cores
    const { colors } = useTheme();

    // campos de preenchimento
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // campos de erros
    const [fullNameError, setFullNameError] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // constannte para mostrar o alerta de sucesso
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // lida com o cadastro
    const handleRegister = () => {

        // verificação se os campos são válidos (nesse caso apenas preenchimento)
        let isValid = true;

        if (!fullName.trim()) {
            setFullNameError('O nome é obrigatório.');
            isValid = false;
        } else { setFullNameError(''); }

        if (!cpf.trim()) {
            setCpfError('O CPF é obrigatório.');
            isValid = false;
        } else { setCpfError(''); }

        if (!email.trim()) {
            setEmailError('O e-mail é obrigatório.');
            isValid = false;
        } else { setEmailError(''); }

        if (!password) {
            setPasswordError('A senha é obrigatória.');
            isValid = false;
        } else { setPasswordError(''); }

        if (!confirmPassword) {
            setConfirmPasswordError('Confirme sua senha.');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('As senhas não coincidem.');
            isValid = false;
        } else { setConfirmPasswordError(''); }

        if (isValid) {
            setShowSuccessAlert(true)
        }
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

            {/* Se deu sucesso, aparece o alerta e não o formulário + botões */}
            {showSuccessAlert ? (
                
                <AlertBox 
                    title="Sucesso"
                    message="Conta criada com sucesso!"
                    variant="success"
                    onClose={onBackToLogin} 
                />
                
            ) : (
                <>
                    {/* conteúdo da tela (oculto se o alerta de sucesso aparecer) */}
                    <View style={styles.form}>
                        <Input
                            label="Nome Completo"
                            value={fullName}
                            onChangeText={(text) => { setFullName(text); setFullNameError(''); }}
                            placeholder="Digite seu nome"
                            errorMessage={fullNameError}
                        />
                        <Input
                            label="CPF"
                            value={cpf}
                            onChangeText={(text) => { setCpf(text); setCpfError(''); }}
                            keyboardType="numeric"
                            placeholder="000.000.000-00"
                            errorMessage={cpfError}
                        />
                        <Input
                            label="E-mail"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setEmailError(''); }}
                            keyboardType="email-address"
                            placeholder="exemplo@email.com"
                            errorMessage={emailError}
                        />
                        <Input
                            label="Senha"
                            value={password}
                            onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
                            secureTextEntry
                            placeholder="********"
                            errorMessage={passwordError}
                        />
                        <Input
                            label="Confirmar Senha"
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setConfirmPasswordError(''); }}
                            secureTextEntry
                            placeholder="********"
                            errorMessage={confirmPasswordError}
                        />
                    </View>

                    {/* rodapé /footer da tela (oculto se o alerta de sucesso aparecer) */}
                    <View style={styles.cta}>
                        <Button label="Cadastrar" onPress={handleRegister} />
                        <Button
                            label="Já tenho uma conta"
                            onPress={onBackToLogin}
                            variant="ghost"
                            style={{ marginTop: 10 }}
                        />
                    </View>
                </>
            )}
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 80,
        height: 80,
        marginBottom: 8
    },
    container: {
        flex: 1
    },
    content: {
        padding: 28,
        paddingBottom: 50
    },
    header: {
        marginBottom: 32,
        alignItems: 'center'
    },
    title: { 
        fontSize: 28, 
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14
    },
    form: {
        marginBottom: 24
    },
    cta: {
        marginTop: 8
    },
});