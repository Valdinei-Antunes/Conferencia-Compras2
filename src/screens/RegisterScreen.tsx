import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { signUp } from '../services/firebase';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim()) return Alert.alert('Atenção', 'Informe o e-mail.');
    if (password.length < 6) return Alert.alert('Atenção', 'Senha deve ter ao menos 6 caracteres.');
    if (password !== confirm) return Alert.alert('Atenção', 'As senhas não coincidem.');

    setLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch (error: any) {
  console.log('ERRO CADASTRO:', JSON.stringify(error), error.code, error.message);
  const msg =
    error.code === 'auth/email-already-in-use' ? 'E-mail já cadastrado.' :
    'Erro ao criar conta.';
  Alert.alert('Erro', msg);
} finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.title}>Criar Conta</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput style={styles.input} placeholder="seu@email.com" placeholderTextColor="#aaa"
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Senha</Text>
          <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#aaa"
            value={password} onChangeText={setPassword} secureTextEntry />
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput style={styles.input} placeholder="Repita a senha" placeholderTextColor="#aaa"
            value={confirm} onChangeText={setConfirm} secureTextEntry />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Já tem conta? <Text style={styles.linkBold}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a237e' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 15, color: '#222', backgroundColor: '#fafafa' },
  button: { backgroundColor: '#1a73e8', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#90b8f8' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 14, color: '#666' },
  linkBold: { color: '#1a73e8', fontWeight: '700' },
});
