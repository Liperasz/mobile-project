import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface InputProps {
    label: string;
    value: string;
    // função que aviza se o texto foi alterado
    onChangeText: (text: string) => void;
    
    // texto que aparece quando nao tem nada escrito pelo usuario
    placeholder?: string;
    // pontinho na senha
    secureTextEntry?: boolean;
    // qual teclado vai ser aberto
    keyboardType?: 'default' | 'email-address' | 'numeric';
}

export default function Input ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
}: InputProps) {

    return (
        <View>
            <Text>
                {label.toUpperCase()}
            </Text>
            <TextInput
                value = {value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
            />
        </View>
    );
}