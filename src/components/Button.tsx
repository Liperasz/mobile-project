import React from 'react';
import { Pressable, Text } from 'react-native';


interface ButtonProps {
    label: string;
    onPress: () => void;
}

export default function Button ({
    label,
    onPress,
}: ButtonProps) {

    return (
        <Pressable
            onPress={onPress}
        >
        <Text>
            {label}
        </Text>
        </Pressable>
    );

}