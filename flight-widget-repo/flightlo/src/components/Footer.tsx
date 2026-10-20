"use client"

import { Github, ExternalLink, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-3">FlightTracker Pro</h3>
            <p className="text-sm text-gray-400">
              Real-time flight tracking application powered by multiple aviation APIs.
              Track flights, get airport information, and stay updated with live data.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">Data Sources</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-2 text-blue-400" />
                <span className="text-gray-400">OpenSky Network API</span>
              </li>
              <li className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-2 text-blue-400" />
                <span className="text-gray-400">AviationStack API</span>
              </li>
              <li className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-2 text-blue-400" />
                <span className="text-gray-400">OpenFlights Database</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">About</h3>
            <p className="text-sm text-gray-400 mb-3">
              Built with Next.js, TypeScript, and Tailwind CSS for optimal performance and user experience.
            </p>
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Open Source Project</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            © 2025 FlightTracker Pro. Made with <Heart className="h-4 w-4 text-red-500" /> for air travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
