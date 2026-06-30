import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// propriedades do loading
type LoadingProps = {
    message?: string;
};

// componente
export function Loading({ message = 'Carregando...' }: LoadingProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#16a34a" />
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
        gap: 12,
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
    },
});
