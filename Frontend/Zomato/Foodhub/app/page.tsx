"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useApiAnomaly } from "./providers/apiAnomalyContext"
import landingImg from "./landing.png" // added

export default function Home() {
	const { apiAnomaly, toggleApiAnomaly } = useApiAnomaly()

	return (
		<main className="relative min-h-screen bg-background flex items-center">
			{/* content sits above the image */}
			<div className="z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-100 text-center">
				<h1 className="text-7xl font-extrabold text-foreground mb-4">Welcome to Grubhub</h1>
				<p className="text-lg text-muted-foreground mb-8">
					Fast delivery, fresh food, and great prices. Browse our menu and order from a variety of cuisines.
				</p>

				<div className="flex items-center justify-center gap-4">
					<Link href="/food">
						<Button variant="default">Explore Menu</Button>
					</Link>
					<Link href="/food">
						<Button variant="outline">Order Now</Button>
					</Link>

					{/* Toggle for global apiAnomaly state */}
					<Button variant={apiAnomaly ? "destructive" : "ghost"} onClick={toggleApiAnomaly}>
						API Anomaly: {apiAnomaly ? "ON" : "OFF"}
					</Button>
				</div>
			</div>

			{/* landing image anchored to the bottom of the screen */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-center z-0 pointer-events-none">
				<Image
					src={landingImg}
					alt="Landing"
					className="w-full h-auto object-contain scale-75"
					priority
				/>
			</div>
		</main>
	)
}
