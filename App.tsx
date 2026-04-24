import React from "react";

import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.card}>
                <Text style={styles.title}>🚀 Projeto Rodando!</Text>
                <Text style={styles.subtitle}>Hello World do React Native</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    card: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: '#666',
    },

});