"use client"

import { useState, useMemo, useEffect } from "react"
import { FOOD_ITEMS } from "@/lib/dummy-data"
import { FoodCard } from "@/components/food-card"
import { Button } from "@/components/ui/button"
import { useApiAnomaly } from "@/app/providers/apiAnomalyContext"

const CATEGORIES = [
    "All",
    "Pizza",
    "Burgers",
    "Salads",
    "Indian",
    "Asian",
    "Mexican",
    "Desserts",
    "Beverages",
    "Wraps",
    "Pasta",
]

export default function FoodPage() {
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [anomalyMode, setAnomalyMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { apiAnomaly } = useApiAnomaly()

    useEffect(() => {
        console.log("Product page loaded")
        console.log("apiAnomalyContext is:", apiAnomaly ? "ON" : "OFF")

        // If anomaly mode is ON, introduce an artificial delay
        const delay = apiAnomaly ? Math.floor(Math.random() * 5000) + 1000 : 0 // 5–10 sec delay

        setIsLoading(true)

        const timer = setTimeout(() => {
            const apiUrl = apiAnomaly
                ? "http://localhost:3000/api/products/slow"
                : "http://localhost:3000/api/products/normal"

            fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Fetching product data",
                }),
            })
                .then((res) => res.json())
                .then((data) => console.log("API Response:", data))
                .catch((err) => console.error("API Error:", err))
                .finally(() => setIsLoading(false))
        }, delay)

        return () => clearTimeout(timer)
    }, [apiAnomaly])

    const filteredItems = useMemo(() => {
        if (selectedCategory === "All") return FOOD_ITEMS
        return FOOD_ITEMS.filter((item) => item.category === selectedCategory)
    }, [selectedCategory])

    // ⏳ Show loading screen during delay
    if (isLoading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                        {apiAnomaly ? "Hold Tight, your meals are arriving..." : "Loading..."}
                    </h2>
                    <p className="text-muted-foreground">
                        Please wait while we load your delicious meals 🍔
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Order Your Favorite Food
                    </h1>
                    <p className="text-muted-foreground">
                        Fast delivery, fresh food, great prices
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                        {CATEGORIES.map((category) => (
                            <Button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                variant={selectedCategory === category ? "default" : "outline"}
                                className="whitespace-nowrap"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Food Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <FoodCard key={item.id} item={item} anomalyMode={anomalyMode} />
                    ))}
                </div>
            </div>
        </main>
    )
}
