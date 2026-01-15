"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, Home, Package, Search } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="text-2xl">🍕</span>
            FoodHub
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home size={20} />
              <span className="hidden sm:inline">Menu</span>
            </Link>

            <Link
              href="/search"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/search") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search size={20} />
              <span className="hidden sm:inline">Search</span>
            </Link>

            <Link
              href="/orders"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/orders") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package size={20} />
              <span className="hidden sm:inline">Orders</span>
            </Link>

            <Link
              href="/checkout"
              className={`relative flex items-center gap-2 transition-colors ${
                isActive("/checkout") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
