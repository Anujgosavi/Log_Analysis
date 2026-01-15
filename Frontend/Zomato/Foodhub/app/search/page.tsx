"use client"

import { useState, useMemo } from "react"
import { FOOD_ITEMS } from "@/lib/dummy-data"
import { FoodCard } from "@/components/food-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle } from "lucide-react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSecurityInfo, setShowSecurityInfo] = useState(false)

  // Safe search implementation - filters on client side
  const safeSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return FOOD_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    )
  }, [searchQuery])

  // Simulated unsafe search (for educational purposes only)
  const demonstrateUnsafeSearch = (query: string) => {
    // This is a DEMONSTRATION of what NOT to do
    // In a real application, NEVER concatenate user input into SQL queries
    const unsafeQuery = `SELECT * FROM food_items WHERE name LIKE '%${query}%'`
    return unsafeQuery
  }

  // New: call external inspection API on Enter key and report anomaly if detected
  const handleEnterSearch = async () => {
    try {
      // include surrounding quotes in the query param as requested
      const encoded = encodeURIComponent(`"${searchQuery}"`)
      const url = `http://localhost:3000/api/parsed-logs/check-sql-injection?query=${encoded}`

      const res = await fetch(url, { method: "GET" })
      const data = await res.json()
      console.log("Parsed-logs API response:", data)

      // If parsed-logs indicates SQL injection, report to anomalies endpoint
      if (data?.hasSqlInjection) {
        try {
          const anomaliesUrl = "http://localhost:3000/api/anomalies" // use no trailing slash
          const payload = {
            detectedAt: new Date().toISOString(),
            query: searchQuery,
            parsedLogsResponse: data,
          }
          console.log("Posting anomaly payload to", anomaliesUrl, payload)

          const postRes = await fetch(anomaliesUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

          if (!postRes.ok) {
            // try to read text for useful error info
            const txt = await postRes.text().catch(() => null)
            console.error("Anomalies POST failed", postRes.status, txt)
          } else {
            // parse JSON only if present
            let postData = null
            try {
              postData = await postRes.json()
            } catch {
              // server returned no JSON
            }
            console.log("Anomalies API response:", postData ?? { status: postRes.status })
          }
        } catch (postErr) {
          console.error("Anomalies API error:", postErr)
        }
      }
    } catch (err) {
      console.error("Parsed-logs API error:", err)
    }
  }

  const handleClear = () => {
    setSearchQuery("")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Search Food</h1>
          <p className="text-muted-foreground">Find your favorite dishes</p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnterSearch()
                }
              }}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Security Info Panel */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            className="flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {showSecurityInfo ? "Hide" : "Show"} Security Information
          </Button>

          {showSecurityInfo && (
            <Card className="mt-4 p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-foreground mb-3">SQL Injection Testing Information</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">Safe Implementation (Current):</p>
                  <p className="text-muted-foreground">
                    This search uses client-side filtering with parameterized matching. User input is never concatenated
                    into queries.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">Unsafe Implementation (DO NOT USE):</p>
                  <code className="block bg-white p-3 rounded border border-border text-xs overflow-x-auto mt-2">
                    {demonstrateUnsafeSearch(searchQuery || "user_input")}
                  </code>
                  <p className="text-muted-foreground mt-2">
                    This would be vulnerable to SQL injection. For example, searching for{" "}
                    <code className="bg-white px-2 py-1 rounded">'; DROP TABLE food_items; --</code> could delete data.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-foreground mb-1">Best Practices:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Always use parameterized queries or prepared statements</li>
                    <li>Validate and sanitize all user input</li>
                    <li>Use ORM libraries that handle escaping automatically</li>
                    <li>Implement proper access controls and least privilege</li>
                    <li>Use environment variables for sensitive data</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Search Results */}
        {searchQuery.trim() ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found <span className="font-semibold text-foreground">{safeSearchResults.length}</span> result
                {safeSearchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
            </div>

            {safeSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {safeSearchResults.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No results found</h2>
                <p className="text-muted-foreground">Try searching with different keywords</p>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Start searching</h2>
            <p className="text-muted-foreground">Enter a search term to find food items</p>
          </Card>
        )}
      </div>
    </main>
  )
}
