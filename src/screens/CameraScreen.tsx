import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

export default function CameraScreen({ navigation, route }: Props) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permEmoji}>📷</Text>
        <Text style={styles.permTitle}>Permissão Necessária</Text>
        <Text style={styles.permText}>O app precisa acessar sua câmera para fotografar os produtos.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || loading) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (!photo?.uri) throw new Error('Falha');


      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      route.params.onCapture(manipulated.uri);
      navigation.goBack();
    } catch {
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
              <Text style={styles.topBtnText}>✕ Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} style={styles.topBtn}>
              <Text style={styles.topBtnText}>🔄 Girar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.guideContainer}>
            <View style={styles.guide} />
            <Text style={styles.guideText}>Enquadre o produto</Text>
          </View>
          <View style={styles.bottomBar}>
            <TouchableOpacity style={[styles.captureBtn, loading && { opacity: 0.5 }]}
              onPress={takePicture} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="large" /> : <View style={styles.captureInner} />}
            </TouchableOpacity>
            <Text style={styles.captureHint}>Toque para fotografar</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between' },
  permContainer: { flex: 1, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', padding: 32 },
  permEmoji: { fontSize: 72, marginBottom: 16 },
  permTitle: { fontSize: 22, fontWeight: '800', color: '#1a237e', marginBottom: 8 },
  permText: { fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 24 },
  permBtn: { backgroundColor: '#1a73e8', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginBottom: 12 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { paddingVertical: 10 },
  cancelText: { color: '#1a73e8', fontSize: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 48, backgroundColor: 'rgba(0,0,0,0.4)' },
  topBtn: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  topBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  guideContainer: { alignItems: 'center' },
  guide: { width: 260, height: 260, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 16, borderStyle: 'dashed' },
  guideText: { color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13, fontWeight: '500' },
  bottomBar: { alignItems: 'center', paddingBottom: 48, backgroundColor: 'rgba(0,0,0,0.4)', paddingTop: 24 },
  captureBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddd' },
  captureHint: { color: 'rgba(255,255,255,0.7)', marginTop: 10, fontSize: 12 },
});
