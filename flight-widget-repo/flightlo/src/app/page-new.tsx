"use client"

import { useState } from "react"
import { FlightSearch, SearchParams } from "@/components/FlightSearch"
import { FlightResults } from "@/components/FlightResults"
import { AirportInfo } from "@/components/AirportInfo"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flight, Airport } from "@/types"

export default function FlightTracker() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [isSearchingFlights, setIsSearchingFlights] = useState(false)
  const [flightError, setFlightError] = useState<string>("")
  
  const [airport, setAirport] = useState<Airport | null>(null)
  const [departures, setDepartures] = useState<Flight[]>([])
  const [isSearchingAirport, setIsSearchingAirport] = useState(false)
  const [airportError, setAirportError] = useState<string>("")

  const handleFlightSearch = async (params: SearchParams) => {
    setIsSearchingFlights(true)
    setFlightError("")
    setFlights([])

    try {
      const queryParams = new URLSearchParams()
      if (params.origin) queryParams.append("origin", params.origin)
      if (params.destination) queryParams.append("destination", params.destination)
      if (params.airline) queryParams.append("airline", params.airline)
      if (params.country) queryParams.append("country", params.country)

      const response = await fetch(`/api/flights/search?${queryParams.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search flights")
      }

      setFlights(data.flights || [])
    } catch (error) {
      console.error("Flight search error:", error)
      setFlightError(error instanceof Error ? error.message : "Failed to search flights")
    } finally {
      setIsSearchingFlights(false)
    }
  }

  const handleAirportSearch = async (iataCode: string) => {
    setIsSearchingAirport(true)
    setAirportError("")
    setAirport(null)
    setDepartures([])

    try {
      const response = await fetch(`/api/airports?code=${encodeURIComponent(iataCode)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Airport not found")
      }

      setAirport(data.airport)
      setDepartures(data.departures || [])
    } catch (error) {
      console.error("Airport search error:", error)
      setAirportError(error instanceof Error ? error.message : "Failed to find airport information")
    } finally {
      setIsSearchingAirport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Real-Time Flight Tracking
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Search for flights by route, airline, or country. Get detailed airport information 
              and live departure times from multiple aviation data sources.
            </p>
          </div>

          <Tabs defaultValue="flights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flights">Flight Search</TabsTrigger>
              <TabsTrigger value="airports">Airport Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flights" className="space-y-6">
              <FlightSearch 
                onSearch={handleFlightSearch} 
                isLoading={isSearchingFlights}
              />
              
              <FlightResults 
                flights={flights}
                isLoading={isSearchingFlights}
                error={flightError}
              />
            </TabsContent>
            
            <TabsContent value="airports" className="space-y-6">
              <AirportInfo
                onSearch={handleAirportSearch}
                isLoading={isSearchingAirport}
                airport={airport}
                departures={departures}
                error={airportError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
