export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ShoppingList: undefined;
  AddItem: undefined;
  Camera: { onCapture: (uri: string) => void };
};

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: any;
}
