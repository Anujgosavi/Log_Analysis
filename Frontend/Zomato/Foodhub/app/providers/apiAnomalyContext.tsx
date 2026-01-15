"use client"

import React, { createContext, useContext, useState } from "react"

type ApiAnomalyContextType = {
	apiAnomaly: boolean
	setApiAnomaly: (v: boolean) => void
	toggleApiAnomaly: () => void
}

const ApiAnomalyContext = createContext<ApiAnomalyContextType | undefined>(undefined)

export function ApiAnomalyProvider({ children }: { children: React.ReactNode }) {
	const [apiAnomaly, setApiAnomaly] = useState(false)
	const toggleApiAnomaly = () => setApiAnomaly((v) => !v)

	return (
		<ApiAnomalyContext.Provider value={{ apiAnomaly, setApiAnomaly, toggleApiAnomaly }}>
			{children}
		</ApiAnomalyContext.Provider>
	)
}

export function useApiAnomaly() {
	const ctx = useContext(ApiAnomalyContext)
	if (!ctx) throw new Error("useApiAnomaly must be used within ApiAnomalyProvider")
	return ctx
}
