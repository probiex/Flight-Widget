# Flightlo real-data app

React/Vite frontend + Express API, with shared OpenAPI-generated types and
queries. Requires Node.js 22+ and pnpm 10. No database is required.

## Local development

```sh
pnpm install --frozen-lockfile
# Terminal 1
pnpm dev:api
# Terminal 2
pnpm dev:web
```

Open http://localhost:3000. The web development server proxies `/api` to the
API service at port 3001. Replit's managed preview routes the services
separately, so that proxy is optional there.

Set `AVIATIONSTACK_API_KEY` only in the API server's environment (a secure
secret, not a browser variable). No key is included. Without a key, flight
requests return HTTP 503 and the UI explains that live data is not connected.
Airport and weather failures also return explicit errors, never sample data.

## Production build

```sh
pnpm build
PORT=3000 pnpm start
```

The Express service serves the built frontend and `/api` on one port.
Deep links return the app shell. Configure the same server-side API key on
the hosting platform.

## Data

- Airports: OurAirports, public-domain reference dataset, cached six hours.
- Airline codes: OpenFlights reference snapshot, cached 24 hours. Its
  published January 2012 age is disclosed prominently; not a current carrier
  operations feed.
- Aviation weather: NOAA AWC METAR and TAF reports, cached five minutes, with
  source observation/validity times. Not an approved aviation briefing.
- US weather alerts: NWS point-based alerts, cached five minutes. Other
  countries explicitly show unsupported coverage.
- Airport infrastructure: OurAirports runway, radio, navaid, and country
  records, cached six hours. Reference only, never navigation or radio guidance.
- Currency tools: Frankfurter blended reference rates (one-hour cache) and
  currency list (24-hour cache), with source rate dates and no invented defaults.
- Flights: Aviationstack, cached five minutes, up to 100 records per lookup.
  Today uses the live endpoint. Historical lookups require provider-plan
  support. Future schedules are not supported by this implementation.

Retrieval timestamps do not imply the source dataset was updated at that time.
Confirm operational information with the airline or airport.

See `/sources` for the reviewed registry and `docs/FREE_DATA_PLAN.md` for
source policies and the next integration stages. `/weather` is retired with
HTTP 410; it no longer calls the non-commercial Open-Meteo service.

## Not ready for an ad-supported launch

Do not show ads against non-commercial free API plans. Review
`../PRODUCT_PLAN.md` first. Commercial data licensing, persistent shared quota
protection, production monitoring, SEO rendering, and privacy/consent setup
are launch gates. This MVP has no ad code and no revenue guarantee.

## Development

```sh
pnpm typecheck
pnpm --filter @workspace/api-spec codegen
```

The older root static app and `../flightlo/` are not used by this app.
