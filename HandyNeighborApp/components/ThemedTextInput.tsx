import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

interface ThemedTextInputProps extends TextInputProps {
  // Add any additional props here
}

export function ThemedTextInput(props: ThemedTextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#999999"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
}); 