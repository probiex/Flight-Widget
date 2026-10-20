# Flightlo

## Real-data MVP — feature branch

The new React/Vite + Express application is in **[replit-app/](replit-app/README.md)**.
See **[PRODUCT_PLAN.md](PRODUCT_PLAN.md)** for the repository audit, data
licensing constraints, traffic strategy, and phased advertising plan.

This new app does not generate flights or fares. Airport reference data and
weather are externally sourced. Flight records require a server-side
`AVIATIONSTACK_API_KEY`; without it, the app shows an unavailable state.
No advertising is enabled.

The earlier root static app and `flightlo/` Next.js app are preserved below for
reference. They contain simulated behavior and must **not** be used as the
real-data production app. This branch does not change an existing deployment.

---

## Archived legacy README (not the real-data MVP)

# FlightTracker Pro 🛫

## Your Ultimate Flight Search & Information Tool

A comprehensive, modern web application for flight travelers to search and track flights by destination, country, or airline. Built with vanilla JavaScript, HTML5, and CSS3 - no external dependencies required!

![FlightTracker Pro](https://img.shields.io/badge/FlightTracker-Pro-blue?style=for-the-badge&logo=airplane)

## ✨ Features

### 🔍 **Multi-Search Options**
- **Route Search**: Search flights between specific airports/cities
- **Airline Search**: View all flights for a specific airline
- **Airport Information**: Get detailed airport info and live departures

### 🌍 **Comprehensive Database**
- **35+ Major Airports** worldwide (JFK, LAX, LHR, CDG, DXB, etc.)
- **20+ Popular Airlines** (American, Delta, Emirates, Lufthansa, etc.)
- **Real-time Flight Generation** with realistic data

### 💡 **Smart Features**
- **Auto-complete Search** with intelligent suggestions
- **Sortable Results** by time, price, duration, or airline
- **Responsive Design** works on all devices
- **Live Departures Board** for airports
- **Flight Status Tracking** (On Time, Delayed, Cancelled)

### 🎨 **Modern UI/UX**
- Beautiful gradient design with smooth animations
- Card-based flight results layout
- Intuitive tab-based navigation
- Professional typography and spacing
- Mobile-responsive interface

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required!

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start searching for flights!

```bash
# Clone the repository
git clone https://github.com/yourusername/flight-widget.git

# Navigate to the project
cd flight-widget

# Open in browser (or double-click index.html)
open index.html
```

## 🛠️ Usage Guide

### Route Search
1. Click on **Route Search** tab
2. Enter departure airport (e.g., "JFK", "New York", "NYC")
3. Enter destination airport (e.g., "LAX", "Los Angeles", "LA")
4. Select travel date
5. Click **Search Flights**

### Airline Search
1. Click on **Airline Search** tab
2. Select an airline from the dropdown
3. Choose a date
4. Click **View Airline Flights**

### Airport Information
1. Click on **Airport Info** tab
2. Enter airport code or name
3. Click **Get Airport Info**
4. View airport details and live departures

## 📱 Features Overview

### Flight Results Display
- **Airline Information**: Logo, name, and flight number
- **Route Visualization**: Clear departure and arrival times
- **Flight Details**: Duration, aircraft type, gate, status
- **Pricing**: Realistic fare estimates
- **Sorting Options**: Multiple ways to organize results

### Airport Information
- **Location Details**: City, country, IATA code
- **Facility Information**: Terminals, gates, runways
- **Live Departures**: Real-time departure board
- **Operating Hours**: 24/7 availability info

## 🎯 Data Sources

This application uses **simulated flight data** that provides:
- Realistic flight times and durations
- Actual airport codes and names
- Real airline information
- Dynamic pricing algorithms
- Status updates and gate assignments

*Note: This is a demonstration tool using generated data. For actual flight booking, please use official airline websites or travel booking platforms.*

## 🏗️ Technical Implementation

### Architecture
- **Frontend**: Vanilla JavaScript ES6+
- **Styling**: CSS3 with custom properties and animations
- **Data**: JSON-based airport and airline databases
- **No External APIs**: Self-contained flight data generation

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Performance Features
- Lightweight (< 50KB total)
- Fast loading and responsive interface
- Efficient search algorithms
- Smooth animations and transitions

## 🔧 Customization

### Adding New Airports
Edit the `airports` array in `app.js`:
```javascript
{ code: 'XXX', name: 'Airport Name', city: 'City', country: 'Country' }
```

### Adding New Airlines
Edit the `airlines` array in `app.js`:
```javascript
{ code: 'XX', name: 'Airline Name' }
```

### Styling Customization
Modify CSS custom properties in `styles.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... more variables */
}
```

## 📈 Future Enhancements

- [ ] Integration with real flight APIs
- [ ] Flight price tracking and alerts
- [ ] Seat map visualization
- [ ] Weather information for airports
- [ ] Travel time to airport calculator
- [ ] Multi-city trip planning
- [ ] Offline mode with cached data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**FlightTracker Pro** - A modern flight search tool built for travelers worldwide.

---

### 🌟 **Made with ❤️ for flight travelers everywhere!**

*Happy Flying! ✈️*
