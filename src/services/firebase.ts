import { auth, db, storage } from '../../firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ShoppingItem } from '../types';
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp,
  writeBatch, getDocs,   // ← adicione writeBatch e getDocs
} from 'firebase/firestore';

export { auth, onAuthStateChanged };


export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signOut = () => firebaseSignOut(auth);

export const getCurrentUser = () => auth.currentUser;


export const uploadImage = async (localUri: string, userId: string): Promise<string> => {
  const filename = `products/${userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};


const COL = 'shoppingItems';

export const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, COL), {
    ...item,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserItems = (userId: string, callback: (items: ShoppingItem[]) => void) => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const items: ShoppingItem[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ShoppingItem, 'id'>),
    }));
    callback(items);
  });
};

export const updateItemQuantity = async (itemId: string, quantity: number, unitPrice: number) => {
  await updateDoc(doc(db, COL, itemId), { quantity, totalPrice: quantity * unitPrice });
};

export const deleteShoppingItem = async (itemId: string) => {
  await deleteDoc(doc(db, COL, itemId));
};

export const clearUserList = async (userId: string) => {
  const q = query(collection(db, COL), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};