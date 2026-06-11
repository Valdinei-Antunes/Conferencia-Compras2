import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { addShoppingItem, uploadImage, getCurrentUser } from '../services/firebase';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'AddItem'> };

export default function AddItemScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsedPrice = parseFloat(unitPrice.replace(',', '.')) || 0;
  const parsedQty = parseInt(quantity) || 1;
  const total = parsedPrice * parsedQty;

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe o nome do produto.');
    if (!imageUri) return Alert.alert('Atenção', 'Tire uma foto do produto.');
    if (parsedPrice <= 0) return Alert.alert('Atenção', 'Informe um valor unitário válido.');
    if (parsedQty <= 0) return Alert.alert('Atenção', 'Quantidade inválida.');

    const user = getCurrentUser();
    if (!user) return Alert.alert('Erro', 'Sessão expirada.');

    setLoading(true);
    try {
      const imageUrl = await uploadImage(imageUri, user.uid);
      await addShoppingItem({
        userId: user.uid,
        name: name.trim(),
        imageUrl,
        unitPrice: parsedPrice,
        quantity: parsedQty,
        totalPrice: parsedPrice * parsedQty,
      });
      Alert.alert('Sucesso!', 'Produto adicionado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Adicionar Produto</Text>
        </View>

        {/* Foto */}
        <TouchableOpacity style={styles.imageArea} activeOpacity={0.85}
          onPress={() => navigation.navigate('Camera', { onCapture: (uri) => setImageUri(uri) })}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.productImage} />
              <View style={styles.retakeOverlay}><Text style={styles.retakeText}>🔄 Refazer foto</Text></View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraText}>Fotografar produto</Text>
              <Text style={styles.cameraHint}>Toque para abrir a câmera</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Formulário */}
        <View style={styles.card}>
          <Text style={styles.label}>Nome do produto *</Text>
          <TextInput style={styles.input} placeholder="Ex: Leite Integral 1L"
            placeholderTextColor="#aaa" value={name} onChangeText={setName} maxLength={80} />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Valor unitário (R$) *</Text>
              <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#aaa"
                value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Quantidade *</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(Math.max(1, parsedQty - 1)))}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput style={styles.qtyInput} value={quantity} textAlign="center"
                  onChangeText={(v) => setQuantity(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(String(parsedQty + 1))}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total do item</Text>
            <Text style={styles.totalValue}>{fmt(total)}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveTxt}>✓ Salvar na Lista</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { marginRight: 12 },
  backText: { color: '#1a73e8', fontSize: 16, fontWeight: '600' },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#1a237e' },
  imageArea: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#e8eaf6', height: 220 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraIcon: { fontSize: 52, marginBottom: 8 },
  cameraText: { fontSize: 16, fontWeight: '700', color: '#3949ab' },
  cameraHint: { fontSize: 12, color: '#7986cb', marginTop: 4 },
  retakeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, alignItems: 'center' },
  retakeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#222', backgroundColor: '#fafafa' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fafafa' },
  qtyBtn: { paddingHorizontal: 16, paddingVertical: 11, backgroundColor: '#e8eaf6' },
  qtyBtnText: { fontSize: 20, fontWeight: '700', color: '#3949ab' },
  qtyInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#222', paddingVertical: 11 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 12, padding: 14, marginTop: 16 },
  totalLabel: { fontSize: 14, color: '#388e3c', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#1b5e20' },
  saveBtn: { backgroundColor: '#2e7d32', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
