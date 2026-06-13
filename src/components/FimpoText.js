import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function FimpoText({ style, children, ...props }) {
  return (
    <Text style={[styles.defaultFont, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'CustomFont-Main', // Your globally loaded font key
    color: '#FFFFFF',              // Default text color to crisp white for dark mode
  },
});