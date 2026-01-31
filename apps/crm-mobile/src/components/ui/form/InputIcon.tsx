import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet } from 'react-native';

interface Props {
    name: keyof typeof Ionicons.glyphMap;
    isFocused: boolean;
}

export function InputIcon({ name, isFocused }: Props) {
    console.log('Ionicons', Ionicons);


    return (
        <Ionicons
            name={name}
            size={20}
            color={isFocused ? '#F36E27' : '#6B7280'} // Primary vs TextLight
            style={styles.icon}
        />
    );
}

const styles = StyleSheet.create({
    icon: {
        marginRight: 10,
    },
});