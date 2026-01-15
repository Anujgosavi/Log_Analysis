"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import { useApiAnomaly } from "../providers/apiAnomalyContext"

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { apiAnomaly } = useApiAnomaly()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("Cart page loaded")
    console.log("apiAnomalyContext is:", apiAnomaly ? "ON" : "OFF")

    const delay = apiAnomaly ? Math.floor(Math.random() * 5000) + 1000 : 0 // 5–10 sec delay
    setIsLoading(true)

    const timer = setTimeout(async () => {
      const apiUrl = apiAnomaly
        ? "http://localhost:3000/api/cart/slow"
        : "http://localhost:3000/api/cart/normal"

      const controller = new AbortController()

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Fetching cart data" }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        console.log("API Response:", data)
      } catch (err: any) {
        if (err?.name === "AbortError") console.log("Fetch aborted")
        else console.error("API Error:", err)
      } finally {
        setIsLoading(false)
      }

      return () => controller.abort()
    }, delay)

    return () => clearTimeout(timer)
  }, [apiAnomaly])

  const handleCheckout = () => {
    alert("Order placed successfully!")
    clearCart()
  }

  // ⏳ Show loading placeholder during simulated lag
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {apiAnomaly ? "Getting your cart, Hold Tight" : "Loading..."}
          </h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your cart 🛒
          </p>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft size={20} />
              Back to Menu
            </Link>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some delicious food to get started!</p>
            <Link href="/">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft size={20} />
            Back to Menu
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <p className="text-lg font-bold text-primary">₹{item.price}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={18} />
                      </Button>

                      <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity === 1}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border text-right">
                    <p className="text-sm text-muted-foreground">
                      Subtotal:{" "}
                      <span className="font-semibold text-foreground">
                        ₹{item.price * item.quantity}
                      </span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">₹50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">₹{Math.round(total * 0.05)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{total + 50 + Math.round(total * 0.05)}
                  </span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full mb-3" size="lg">
                Place Order
              </Button>

              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
