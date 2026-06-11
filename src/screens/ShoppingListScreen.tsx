import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  Alert, ActivityIndicator, TextInput, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ShoppingItem } from '../types';
import { getUserItems, updateItemQuantity, deleteShoppingItem, signOut, getCurrentUser } from '../services/firebase';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ShoppingList'> };

export default function ShoppingListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub = getUserItems(user.uid, (fetched) => {
      setItems(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const grandTotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleDelete = (item: ShoppingItem) => {
    Alert.alert('Remover produto', `Deseja remover "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteShoppingItem(item.id) },
    ]);
  };

  const saveEdit = async (item: ShoppingItem) => {
    const qty = parseInt(editQty);
    if (!qty || qty <= 0) return Alert.alert('Atenção', 'Quantidade inválida.');
    await updateItemQuantity(item.id, qty, item.unitPrice);
    setEditingId(null);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemUnit}>Unitário: {fmt(item.unitPrice)}</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Qtd:</Text>
            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput style={styles.qtyEditInput} value={editQty} autoFocus selectTextOnFocus
                  onChangeText={(v) => setEditQty(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveEdit(item)}>
                  <Text style={styles.saveBtnTxt}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditingId(null)}>
                  <Text style={styles.cancelEditTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.qtyDisplay} onPress={() => { setEditingId(item.id); setEditQty(String(item.quantity)); }}>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Text style={styles.editHint}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.itemTotalRow}>
            <Text style={styles.itemTotalLbl}>Total:</Text>
            <Text style={styles.itemTotal}>{fmt(item.totalPrice)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnTxt}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛒 Minha Lista</Text>
          <Text style={styles.headerSub}>{items.length} produto(s)</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 && (
        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.totalBannerLbl}>Total da compra</Text>
            <Text style={styles.totalBannerSub}>{items.length} itens</Text>
          </View>
          <Text style={styles.totalBannerVal}>{fmt(grandTotal)}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingTxt}>Carregando lista...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Lista vazia</Text>
          <Text style={styles.emptyTxt}>Adicione produtos fotografando-os na gôndola.</Text>
        </View>
      ) : (
        <FlatList data={items} keyExtractor={(i) => i.id} renderItem={renderItem}
          contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItem')} activeOpacity={0.85}>
        <Text style={styles.fabTxt}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1a237e' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#9fa8da', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  logoutTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  totalBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1b5e20', paddingHorizontal: 20, paddingVertical: 14 },
  totalBannerLbl: { fontSize: 13, color: '#a5d6a7', fontWeight: '600' },
  totalBannerSub: { fontSize: 11, color: '#81c784' },
  totalBannerVal: { fontSize: 26, fontWeight: '900', color: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  itemCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  itemImage: { width: 100, height: 110, resizeMode: 'cover' },
  itemInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 2 },
  itemUnit: { fontSize: 12, color: '#757575' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  qtyLabel: { fontSize: 13, color: '#555', marginRight: 6 },
  qtyDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8eaf6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyValue: { fontSize: 15, fontWeight: '700', color: '#283593' },
  editHint: { fontSize: 11, marginLeft: 4 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyEditInput: { borderWidth: 1.5, borderColor: '#1a73e8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, width: 56, fontSize: 15, fontWeight: '700', color: '#1a237e', textAlign: 'center' },
  saveBtn: { backgroundColor: '#2e7d32', borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cancelEditBtn: { backgroundColor: '#e53935', borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  cancelEditTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemTotalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemTotalLbl: { fontSize: 13, color: '#555', marginRight: 4 },
  itemTotal: { fontSize: 16, fontWeight: '800', color: '#2e7d32' },
  deleteBtn: { justifyContent: 'center', paddingHorizontal: 14, backgroundColor: '#fff3f3' },
  deleteBtnTxt: { fontSize: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingTxt: { marginTop: 12, color: '#666', fontSize: 15 },
  emptyEmoji: { fontSize: 72, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a237e', marginBottom: 6 },
  emptyTxt: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center', elevation: 8,
    shadowColor: '#1a73e8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 },
  fabTxt: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
