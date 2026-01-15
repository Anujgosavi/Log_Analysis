"use client"

import { useState } from "react"
import Image from "next/image"
import type { FoodItem } from "@/lib/types"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Plus, Minus } from "lucide-react"

interface FoodCardProps {
  item: FoodItem
  anomalyMode?: boolean
}

export function FoodCard({ item, anomalyMode }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async () => {
    setIsLoading(true)
    if (anomalyMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    addItem(item, quantity)
    setQuantity(1)
    setIsLoading(false)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-muted">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{item.rating}</span>
          </div>
          <span className="text-lg font-bold text-primary">₹{item.price}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1}
          >
            <Minus size={16} />
          </Button>
          <span className="flex-1 text-center font-medium">{quantity}</span>
          <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>
            <Plus size={16} />
          </Button>
        </div>

        <Button onClick={handleAddToCart} disabled={isLoading} className="w-full">
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </Card>
  )
}
