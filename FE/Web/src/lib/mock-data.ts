export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: "29.990.000đ",
    image: "https://picsum.photos/400/400?random=1",
    category: "Điện thoại",
  },
  {
    id: 2,
    name: "MacBook Pro M1",
    price: "35.500.000đ",
    image: "https://picsum.photos/400/400?random=2",
    category: "Laptop",
  },
  {
    id: 3,
    name: "Apple Watch Series 9",
    price: "10.200.000đ",
    image: "https://picsum.photos/400/400?random=3",
    category: "Phụ kiện",
  },
  {
    id: 4,
    name: "AirPods Pro 2",
    price: "5.990.000đ",
    image: "https://picsum.photos/400/400?random=4",
    category: "Tai nghe",
  },
];