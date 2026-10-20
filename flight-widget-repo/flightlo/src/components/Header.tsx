"use client"

import { Plane, Menu } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 text-white shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FlightTracker Pro
              </h1>
              <p className="text-gray-400 text-xs">Real-time flight tracking worldwide</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Data</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Updated every 30 seconds</p>
            </div>
          </div>
          
          <div className="md:hidden">
            <Menu className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
