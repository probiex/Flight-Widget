"use client"

import { useState } from "react"
import FlightSearch from "@/components/FlightSearch"
import FlightResults from "@/components/FlightResults"
import AirportInfo from "@/components/AirportInfo"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Flight, Airport } from "@/types"

export default function FlightTracker() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [flightError, setFlightError] = useState<string>("")
  
  const [airport, setAirport] = useState<Airport | null>(null)
  const [departures, setDepartures] = useState<Flight[]>([])
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'airport'>('search')

  const handleFlightResults = (newFlights: Flight[]) => {
    setFlights(newFlights)
    setFlightError("")
    setCurrentView('results')
  }

  const handleAirportInfo = (airportData: Airport, departureFlights: Flight[]) => {
    setAirport(airportData)
    setDepartures(departureFlights)
    setCurrentView('airport')
  }

  const handleSearchStateChange = (searching: boolean) => {
    setIsSearching(searching)
    if (searching) {
      setFlightError("")
    }
  }

  const handleBackToSearch = () => {
    setCurrentView('search')
    setFlights([])
    setAirport(null)
    setDepartures([])
    setFlightError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Search Interface - Always visible */}
          <FlightSearch 
            onFlightResults={handleFlightResults}
            onAirportInfo={handleAirportInfo}
            onSearchStateChange={handleSearchStateChange}
          />

          {/* Results Display */}
          {currentView === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Search Results</h2>
                <button
                  onClick={handleBackToSearch}
                  className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  ← New Search
                </button>
              </div>
              <FlightResults 
                flights={flights}
                isLoading={isSearching}
                error={flightError}
              />
            </div>
          )}

          {/* Airport Information Display */}
          {currentView === 'airport' && airport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Airport Information</h2>
                <button
                  onClick={handleBackToSearch}
                  className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  ← New Search
                </button>
              </div>
              <AirportInfo 
                airport={airport}
                departures={departures}
                isLoading={isSearching}
              />
            </div>
          )}

          {/* Welcome/Getting Started Message */}
          {currentView === 'search' && !isSearching && (
            <div className="text-center py-12 space-y-6">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to Flight Tracker Pro
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your comprehensive flight tracking solution with real-time data from multiple sources. 
                Search flights by route, airline, or get detailed airport information with live departures.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
                <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-3xl mb-4">🗺️</div>
                  <h3 className="font-semibold text-white mb-3 text-lg">Route Search</h3>
                  <p className="text-gray-400">
                    Find flights between specific airports with detailed route information, pricing, and schedules
                  </p>
                </div>
                <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-3xl mb-4">✈️</div>
                  <h3 className="font-semibold text-white mb-3 text-lg">Airline Search</h3>
                  <p className="text-gray-400">
                    Browse flights by specific airlines with real-time status updates and fleet information
                  </p>
                </div>
                <div className="p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-3xl mb-4">🏢</div>
                  <h3 className="font-semibold text-white mb-3 text-lg">Airport Info</h3>
                  <p className="text-gray-400">
                    Get comprehensive airport details and live departure information with terminal data
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
