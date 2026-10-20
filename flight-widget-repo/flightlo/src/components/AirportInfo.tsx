"use client"

import React from "react"
import { 
  MapPin, 
  Clock, 
  Plane, 
  Wifi, 
  Phone, 
  Globe, 
  Navigation,
  Users,
  Car,
  Coffee,
  ShoppingBag,
  Utensils,
  Bed,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Airport, Flight } from "@/types"

interface AirportInfoProps {
  airport: Airport
  departures: Flight[]
  isLoading: boolean
}

export default function AirportInfo({ airport, departures, isLoading }: AirportInfoProps) {
  if (isLoading) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            <p className="text-lg font-medium text-white">Loading airport information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Airport Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {airport.name}
                  </h1>
                  <p className="text-lg text-gray-300">
                    {airport.code} • {airport.city}, {airport.country}
                  </p>
                </div>
              </div>
              
              {airport.timezone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Timezone: {airport.timezone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {departures.length}
                </div>
                <div className="text-sm text-gray-400">Live Departures</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Airport Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                Airport Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">IATA Code:</span>
                  <span className="text-white font-mono font-bold">{airport.code}</span>
                </div>
                
                {airport.icao && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">ICAO Code:</span>
                    <span className="text-white font-mono font-bold">{airport.icao}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400">City:</span>
                  <span className="text-white">{airport.city}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Country:</span>
                  <span className="text-white">{airport.country}</span>
                </div>
                
                {airport.elevation && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Elevation:</span>
                    <span className="text-white">{airport.elevation} ft</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                  <Plane className="h-6 w-6 mx-auto text-blue-400 mb-2" />
                  <div className="text-xl font-bold text-white">{departures.length}</div>
                  <div className="text-xs text-gray-400">Departures</div>
                </div>
                
                <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                  <Clock className="h-6 w-6 mx-auto text-green-400 mb-2" />
                  <div className="text-xl font-bold text-white">
                    {departures.filter(f => f.status?.toLowerCase() === 'on time').length}
                  </div>
                  <div className="text-xs text-gray-400">On Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Airport Amenities */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coffee className="h-5 w-5 text-orange-400" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <Wifi className="h-5 w-5 mx-auto text-blue-400 mb-1" />
                  <div className="text-xs text-gray-400">WiFi</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <Utensils className="h-5 w-5 mx-auto text-green-400 mb-1" />
                  <div className="text-xs text-gray-400">Dining</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <ShoppingBag className="h-5 w-5 mx-auto text-purple-400 mb-1" />
                  <div className="text-xs text-gray-400">Shopping</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <Car className="h-5 w-5 mx-auto text-red-400 mb-1" />
                  <div className="text-xs text-gray-400">Parking</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <Bed className="h-5 w-5 mx-auto text-indigo-400 mb-1" />
                  <div className="text-xs text-gray-400">Hotels</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                  <Phone className="h-5 w-5 mx-auto text-yellow-400 mb-1" />
                  <div className="text-xs text-gray-400">Info</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Departures */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="h-5 w-5 text-green-400" />
                Live Departures
                <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full ml-2">
                  LIVE
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departures.length === 0 ? (
                <div className="text-center py-8">
                  <Plane className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No departures found for this airport</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {departures.slice(0, 10).map((flight, index) => (
                    <DepartureCard key={flight.id || index} flight={flight} />
                  ))}
                  
                  {departures.length > 10 && (
                    <div className="text-center pt-4 border-t border-gray-600">
                      <p className="text-gray-400 text-sm">
                        Showing 10 of {departures.length} departures
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DepartureCard({ flight }: { flight: Flight }) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "on time":
      case "boarding":
        return "text-green-300 bg-green-900/30"
      case "delayed":
        return "text-orange-300 bg-orange-900/30"
      case "cancelled":
        return "text-red-300 bg-red-900/30"
      case "departed":
        return "text-blue-300 bg-blue-900/30"
      default:
        return "text-gray-300 bg-gray-700/30"
    }
  }

  return (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-white font-bold">
            {flight.flightNumber}
          </div>
          <div className="text-gray-400 text-sm">
            {flight.airline}
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(flight.status || '')}`}>
          {flight.status || 'Unknown'}
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div>
          <div className="text-white font-semibold">
            {flight.departure?.time || 'N/A'}
          </div>
          <div className="text-gray-400 text-sm">
            {flight.arrival?.airport || 'Unknown Destination'}
          </div>
        </div>
        
        {flight.departure?.gate && (
          <div className="text-right">
            <div className="text-blue-400 text-sm">Gate</div>
            <div className="text-white font-semibold">{flight.departure.gate}</div>
          </div>
        )}
      </div>
    </div>
  )
}
