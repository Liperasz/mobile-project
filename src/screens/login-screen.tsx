import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';


interface LoginScreenProps{
    // o que é executado depois do login
    onLogin: () => void;
}

export default function LoginScreen( { onLogin }: LoginScreenProps) {

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
        <View>

            {/* header da página*/}
            <View>
                {/* imagem da logo do projeto */}
                <Image
                    source={require('../../assets/images/logo.png')}
                    resizeMode="contain"
                    />
                {/* título */}
                <Text>
                    WasteGo
                </Text>
                {/* subtítulo */}
                <Text>
                    Conectando cidadãos, empresas, governo e cooperativas.
                </Text>
            </View>

            {/* conteúdo da página */}
            <View>
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
            <View>
                <Button label="Entrar" onPress={handleLogin}></Button>
                <Button label="Criar conta" onPress={() => {}}></Button>
            </View>

        </View>
    );
}