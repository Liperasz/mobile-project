import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AlertBox from '../components/alert-box';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';
import { sqliteService, UserType } from '../services/sqlite-service';
import { apiService } from '../services/api-service';
import { AuthStackParamList } from '../navigation/root-navigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {

    const { colors } = useTheme();
    const { login } = useAuth();

    // Tipo de usuário selecionado
    const [userType, setUserType] = useState<UserType>('citizen');

    // Campos do formulário
    const [fullName, setFullName] = useState('');
    const [document, setDocument] = useState(''); // CPF ou CNPJ
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cep, setCep] = useState('');
    const [address, setAddress] = useState('');

    // Erros de validação
    const [fullNameError, setFullNameError] = useState('');
    const [documentError, setDocumentError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [cepError, setCepError] = useState('');

    // Estados de loading
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Busca endereço pelo CEP via API ViaCEP
    const handleCepSearch = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            setCepError('CEP deve ter 8 dígitos.');
            return;
        }
        setIsCepLoading(true);
        setCepError('');
        try {
            const data = await apiService.getAddressByCep(cleanCep);
            const formattedAddress = [
                data.logradouro,
                data.bairro,
                `${data.localidade} - ${data.uf}`,
            ].filter(Boolean).join(', ');
            setAddress(formattedAddress);
        } catch (e) {
            setCepError(e instanceof Error ? e.message : 'Erro ao buscar CEP.');
        } finally {
            setIsCepLoading(false);
        }
    };

    const handleRegister = async () => {
        let isValid = true;

        if (!fullName.trim()) {
            setFullNameError('O nome é obrigatório.');
            isValid = false;
        } else { setFullNameError(''); }

        if (!document.trim()) {
            setDocumentError(userType === 'citizen' ? 'O CPF é obrigatório.' : 'O CNPJ é obrigatório.');
            isValid = false;
        } else { setDocumentError(''); }

        if (!email.trim()) {
            setEmailError('O e-mail é obrigatório.');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Insira um e-mail válido.');
            isValid = false;
        } else { setEmailError(''); }

        if (!password) {
            setPasswordError('A senha é obrigatória.');
            isValid = false;
        } else if (password.length < 4) {
            setPasswordError('A senha deve ter no mínimo 4 caracteres.');
            isValid = false;
        } else { setPasswordError(''); }

        if (!confirmPassword) {
            setConfirmPasswordError('Confirme sua senha.');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('As senhas não coincidem.');
            isValid = false;
        } else { setConfirmPasswordError(''); }

        if (!isValid) return;

        setIsRegistering(true);
        try {
            const userId = await sqliteService.registerUser({
                name: fullName.trim(),
                email: email.trim(),
                type: userType,
                document: document.trim(),
                cep: cep.trim() || undefined,
                address: address || undefined,
            });

            // Faz login automático após cadastro
            await login({
                id: userId,
                name: fullName.trim(),
                email: email.trim(),
                type: userType,
                address: address || undefined,
            });

            setShowSuccessAlert(true);

        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erro ao criar conta.';
            Alert.alert('Erro', msg);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
            {/* Header */}
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

            {/* Alerta de sucesso */}
            {showSuccessAlert ? (
                <AlertBox
                    title="Conta criada!"
                    message={`Bem-vindo ao WasteGo, ${fullName.split(' ')[0]}!`}
                    variant="success"
                    onClose={() => setShowSuccessAlert(false)}
                />
            ) : (
                <>
                    {/* Seleção de tipo de usuário */}
                    <Text style={[styles.label, { color: colors.textMuted }]}>
                        TIPO DE CONTA
                    </Text>
                    <View style={styles.typeRow}>
                        <Pressable
                            style={[
                                styles.typeBtn,
                                {
                                    backgroundColor: userType === 'citizen' ? colors.primary : colors.surface,
                                    borderColor: userType === 'citizen' ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => setUserType('citizen')}
                        >
                            <Text style={styles.typeBtnIcon}>🏘️</Text>
                            <Text style={[styles.typeBtnLabel, { color: userType === 'citizen' ? '#fff' : colors.text }]}>
                                Cidadão
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.typeBtn,
                                {
                                    backgroundColor: userType === 'cooperative' ? colors.primary : colors.surface,
                                    borderColor: userType === 'cooperative' ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => setUserType('cooperative')}
                        >
                            <Text style={styles.typeBtnIcon}>🏭</Text>
                            <Text style={[styles.typeBtnLabel, { color: userType === 'cooperative' ? '#fff' : colors.text }]}>
                                Cooperativa
                            </Text>
                        </Pressable>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <Input
                            label="Nome Completo"
                            value={fullName}
                            onChangeText={(t) => { setFullName(t); setFullNameError(''); }}
                            placeholder="Digite seu nome"
                            errorMessage={fullNameError}
                        />
                        <Input
                            label={userType === 'citizen' ? 'CPF' : 'CNPJ'}
                            value={document}
                            onChangeText={(t) => { setDocument(t); setDocumentError(''); }}
                            keyboardType="numeric"
                            placeholder={userType === 'citizen' ? '000.000.000-00' : '00.000.000/0001-00'}
                            errorMessage={documentError}
                        />
                        <Input
                            label="E-mail"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                            keyboardType="email-address"
                            placeholder="exemplo@email.com"
                            errorMessage={emailError}
                        />
                        <Input
                            label="Senha"
                            value={password}
                            onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                            secureTextEntry
                            placeholder="Mínimo 4 caracteres"
                            errorMessage={passwordError}
                        />
                        <Input
                            label="Confirmar Senha"
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); setConfirmPasswordError(''); }}
                            secureTextEntry
                            placeholder="Repita a senha"
                            errorMessage={confirmPasswordError}
                        />

                        {/* CEP com busca de endereço via ViaCEP */}
                        <Text style={[styles.label, { color: colors.textMuted }]}>
                            CEP (OPCIONAL)
                        </Text>
                        <View style={styles.cepRow}>
                            <View style={styles.cepInput}>
                                <Input
                                    label=""
                                    value={cep}
                                    onChangeText={(t) => { setCep(t); setCepError(''); }}
                                    keyboardType="numeric"
                                    placeholder="00000-000"
                                    errorMessage={cepError}
                                />
                            </View>
                            <Pressable
                                style={[styles.cepBtn, { backgroundColor: colors.primary }]}
                                onPress={handleCepSearch}
                                disabled={isCepLoading}
                            >
                                {isCepLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.cepBtnText}>Buscar</Text>
                                )}
                            </Pressable>
                        </View>

                        {/* Endereço preenchido automaticamente */}
                        {address ? (
                            <View style={[styles.addressBox, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
                                <Text style={[styles.addressIcon]}>📍</Text>
                                <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Ações */}
                    <View style={styles.cta}>
                        <Button
                            label={isRegistering ? 'Cadastrando...' : 'Cadastrar'}
                            onPress={handleRegister}
                        />
                        <Button
                            label="Já tenho uma conta"
                            onPress={() => navigation.navigate('Login')}
                            variant="ghost"
                            style={{ marginTop: 10 }}
                        />
                    </View>
                </>
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 28,
        paddingBottom: 50,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    logo: {
        width: 72,
        height: 72,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 12,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    typeBtn: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1.5,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 6,
    },
    typeBtnIcon: {
        fontSize: 28,
    },
    typeBtnLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    form: {
        marginBottom: 16,
    },
    cepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginTop: -8,
    },
    cepInput: {
        flex: 1,
    },
    cepBtn: {
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
        minWidth: 80,
    },
    cepBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    addressIcon: {
        fontSize: 18,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    cta: {
        marginTop: 8,
    },
});