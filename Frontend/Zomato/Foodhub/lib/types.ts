export interface FoodItem {
  id: string
  name: string
  category: string
  description: string
  price: number
  rating: number
  image: string
}

export interface CartItem extends FoodItem {
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "delivered"
  createdAt: string
}
