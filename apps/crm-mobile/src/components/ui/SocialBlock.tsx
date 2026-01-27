import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export function SocialBlock() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, styles.fb]} activeOpacity={0.8}>
        <Ionicons name="logo-facebook" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.btn, styles.google]} activeOpacity={0.8}>
        <Ionicons name="logo-google" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.btn, styles.apple]} activeOpacity={0.8}>
        <Ionicons name="logo-apple" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for better UI depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fb: { backgroundColor: '#1877F2' },
  google: { backgroundColor: '#DB4437' },
  apple: { backgroundColor: '#000000' },
});