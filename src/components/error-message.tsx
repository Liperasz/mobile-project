import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// propriedades do erro
type ErrorMessageProps = {
    message: string;
};

// componente
export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

// estilização
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 12,
    },
    icon: {
        fontSize: 36,
    },
    message: {
        fontSize: 15,
        color: '#ef4444',
        fontWeight: '600',
        textAlign: 'center',
    },
});
