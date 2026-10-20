import { Router, type IRouter } from "express";
import {
  GetAirportParams,
  GetAirportResponse,
  ListAirlinesQueryParams,
  ListAirlinesResponse,
  ListAirportsQueryParams,
  ListAirportsResponse,
  SearchFlightsQueryParams,
  SearchFlightsResponse,
} from "@workspace/api-zod";

type AirportRecord = {
  code: string;
  icao: string | null;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string | null;
  type: string;
  ident: string;
  officialWebsite: string | null;
  wikipediaUrl: string | null;
};

type AirlineRecord = {
  code: string;
  icao: string | null;
  name: string;
  country: string | null;
};

type CacheEntry<T> = {
  expiresAt: number;
  fetchedAt?: Date;
  value?: T;
  pending?: Promise<T>;
};

const router: IRouter = Router();
const AIRPORT_SOURCE =
  "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv";
const AIRLINE_SOURCE =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat";
const AIRPORT_ATTRIBUTION =
  "Airport reference data: OurAirports. This directory is not an operational flight feed.";
const AIRLINE_ATTRIBUTION =
  "OpenFlights airline reference snapshot (published January 2012), ODbL 1.0 / Database Contents License. Codes and operating status may be outdated. Source and licensing: https://openflights.org/data.php#license";
const FLIGHT_ATTRIBUTION = "Aviationstack: up to 100 provider records per lookup, not a complete airport schedule. Confirm operational details with the airline.";
const airportCache: CacheEntry<AirportRecord[]> = { expiresAt: 0 };
const airlineCache: CacheEntry<AirlineRecord[]> = { expiresAt: 0 };
const flightCache = new Map<string, CacheEntry<unknown>>();

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

async function cachedValue<T>(
  entry: CacheEntry<T>,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  if (entry.value !== undefined && entry.expiresAt > Date.now()) {
    return entry.value;
  }
  if (entry.pending) return entry.pending;

  entry.pending = load()
    .then((value) => {
      entry.value = value;
      entry.fetchedAt = new Date();
      entry.expiresAt = Date.now() + ttlMs;
      return value;
    })
    .finally(() => {
      entry.pending = undefined;
    });
  return entry.pending;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) {
    throw new Error(`Reference source responded with ${response.status}`);
  }
  return response.text();
}

async function getAirports(): Promise<AirportRecord[]> {
  return cachedValue(airportCache, 6 * 60 * 60 * 1000, async () => {
    const csv = await fetchText(AIRPORT_SOURCE);
    const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/);
    const headers = parseCsvLine(lines.shift() ?? "");
    const columns = new Map(headers.map((header, index) => [header, index]));
    const column = (row: string[], name: string) => row[columns.get(name) ?? -1] ?? "";
    const airports: AirportRecord[] = [];

    for (const line of lines) {
      if (!line) continue;
      const row = parseCsvLine(line);
      const code = column(row, "iata_code").trim().toUpperCase();
      const name = column(row, "name").trim();
      const latitude = Number(column(row, "latitude_deg"));
      const longitude = Number(column(row, "longitude_deg"));
      if (
        !/^[A-Z]{3}$/.test(code) ||
        !name ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        column(row, "scheduled_service").toLowerCase() !== "yes"
      ) {
        continue;
      }

      airports.push({
        code,
        icao: column(row, "gps_code").trim() || column(row, "ident").trim() || null,
        name,
        city: column(row, "municipality").trim() || "Unknown city",
        country: column(row, "iso_country").trim() || "Unknown country",
        latitude,
        longitude,
        timezone: column(row, "timezone").trim() || null,
        type: column(row, "type").trim() || "airport",
        ident: column(row, "ident").trim(),
        officialWebsite: column(row, "home_link").trim() || null,
        wikipediaUrl: column(row, "wikipedia_link").trim() || null,
      });
    }

    if (airports.length === 0) throw new Error("Airport source returned no usable records");
    return airports.sort((a, b) => a.name.localeCompare(b.name));
  });
}

async function getAirlines(): Promise<AirlineRecord[]> {
  return cachedValue(airlineCache, 24 * 60 * 60 * 1000, async () => {
    const csv = await fetchText(AIRLINE_SOURCE);
    const seen = new Set<string>();
    const airlines: AirlineRecord[] = [];

    for (const line of csv.split(/\r?\n/)) {
      if (!line) continue;
      const row = parseCsvLine(line);
      const name = (row[1] ?? "").trim();
      const code = (row[3] ?? "").trim().replace(/^\\N$/, "").toUpperCase();
      const icao = (row[4] ?? "").trim().replace(/^\\N$/, "").toUpperCase();
      const country = (row[6] ?? "").trim().replace(/^\\N$/, "");
      const active = (row[7] ?? "").trim().toUpperCase();

      if (!name || !/^[A-Z0-9]{2}$/.test(code) || active === "N" || seen.has(code)) {
        continue;
      }
      seen.add(code);
      airlines.push({
        code,
        icao: /^[A-Z0-9]{3}$/.test(icao) ? icao : null,
        name,
        country: country || null,
      });
    }

    if (airlines.length === 0) throw new Error("Airline source returned no usable records");
    return airlines.sort((a, b) => a.name.localeCompare(b.name));
  });
}

function queryMatches(query: string, ...values: Array<string | null | undefined>) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return values.some((value) => value?.toLocaleLowerCase().includes(normalized));
}

function parseError(message: string) {
  return { error: message };
}

router.get("/airports", async (req, res): Promise<void> => {
  const query = ListAirportsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json(parseError("Invalid airport search parameters."));
    return;
  }

  try {
    const allAirports = await getAirports();
    const airports = allAirports
      .filter((airport) =>
        queryMatches(
          query.data.q ?? "",
          airport.code,
          airport.icao,
          airport.name,
          airport.city,
          airport.country,
        ),
      )
      .slice(0, query.data.limit);

    res.json(
      ListAirportsResponse.parse({
        airports,
        source: "OurAirports",
        fetchedAt: airportCache.fetchedAt,
        attribution: AIRPORT_ATTRIBUTION,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Airport reference source unavailable");
    res.status(503).json(parseError("Airport reference data is temporarily unavailable."));
  }
});

router.get("/airports/:code", async (req, res): Promise<void> => {
  const params = GetAirportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json(parseError("Enter a valid three-letter IATA airport code."));
    return;
  }

  try {
    const airports = await getAirports();
    const airport = airports.find(
      (record) => record.code === params.data.code.toUpperCase(),
    );
    if (!airport) {
      res.status(404).json(parseError("Airport not found in the reference directory."));
      return;
    }
    res.json(GetAirportResponse.parse(airport));
  } catch (error) {
    req.log.error({ err: error }, "Airport reference source unavailable");
    res.status(503).json(parseError("Airport reference data is temporarily unavailable."));
  }
});

router.get("/airlines", async (req, res): Promise<void> => {
  const query = ListAirlinesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json(parseError("Invalid airline search parameters."));
    return;
  }

  try {
    const allAirlines = await getAirlines();
    const airlines = allAirlines
      .filter((airline) =>
        queryMatches(query.data.q ?? "", airline.code, airline.icao, airline.name, airline.country),
      )
      .slice(0, query.data.limit);

    res.json(
      ListAirlinesResponse.parse({
        airlines,
        source: "OpenFlights",
        fetchedAt: airlineCache.fetchedAt,
        attribution: AIRLINE_ATTRIBUTION,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Airline reference source unavailable");
    res.status(503).json(parseError("Airline reference data is temporarily unavailable."));
  }
});

router.get("/weather", async (req, res): Promise<void> => {
  res.status(410).json(parseError("The non-commercial Open-Meteo endpoint has been retired. Use /api/airports/{code}/conditions for sourced NOAA aviation weather."));
});

router.get("/flights", async (req, res): Promise<void> => {
  const query = SearchFlightsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json(parseError("Provide a valid three-letter origin airport code."));
    return;
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY?.trim();
  if (!apiKey) {
    res
      .status(503)
      .json(parseError("Live flight data is not configured. Add an Aviationstack API key to enable it."));
    return;
  }

  const { origin, destination, date } = query.data;
  const requestedDate = date?.toISOString().slice(0, 10);
  const currentDate = new Date().toISOString().slice(0, 10);
  if (requestedDate && requestedDate > currentDate) {
    res.status(400).json(parseError("Future schedules are not supported by this flight-status endpoint."));
    return;
  }
  const cacheKey = `${origin.toUpperCase()}:${destination?.toUpperCase() ?? ""}:${date ?? "today"}`;
  const entry = flightCache.get(cacheKey) as CacheEntry<ReturnType<typeof mapFlights>> | undefined;
  const currentEntry = entry ?? { expiresAt: 0 };
  if (!entry && flightCache.size >= 256) flightCache.delete(flightCache.keys().next().value!);
  flightCache.set(cacheKey, currentEntry);

  try {
    const result = await cachedValue(currentEntry, 5 * 60 * 1000, async () => {
      const params = new URLSearchParams({
        access_key: apiKey,
        dep_iata: origin.toUpperCase(),
        limit: "100",
      });
      if (destination) params.set("arr_iata", destination.toUpperCase());
      // Today's live endpoint does not need the historical-data filter.
      if (requestedDate && requestedDate !== currentDate) params.set("flight_date", requestedDate);

      const response = await fetch(
        `https://api.aviationstack.com/v1/flights?${params.toString()}`,
        { signal: AbortSignal.timeout(12_000) },
      );
      if (!response.ok) {
        throw new Error(`Flight source responded with ${response.status}`);
      }
      const payload: unknown = await response.json();
      return mapFlights(payload);
    });

    res.json(
      SearchFlightsResponse.parse({
        flights: result,
        source: "Aviationstack",
        fetchedAt: currentEntry.fetchedAt,
        attribution: FLIGHT_ATTRIBUTION,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Flight data source unavailable");
    res.status(503).json(parseError("Live flight data is temporarily unavailable."));
  }
});

type AviationstackFlight = {
  flight_date?: string;
  flight_status?: string;
  departure?: {
    iata?: string;
    airport?: string;
    scheduled?: string;
    estimated?: string;
    actual?: string;
    terminal?: string;
    gate?: string;
  };
  arrival?: {
    iata?: string;
    airport?: string;
    scheduled?: string;
    estimated?: string;
    actual?: string;
  };
  airline?: { iata?: string; name?: string };
  flight?: { iata?: string; number?: string };
  aircraft?: { iata?: string; registration?: string };
};

function mapFlights(input: unknown) {
  const payload = input as { data?: AviationstackFlight[]; error?: { message?: string } };
  if (payload.error) throw new Error("Flight provider returned an error");
  if (!Array.isArray(payload.data)) throw new Error("Flight provider returned an invalid response");

  return payload.data.map((flight, index) => ({
    id:
      flight.flight?.iata ||
      `${flight.flight_date ?? "unknown"}-${flight.flight?.number ?? index}-${flight.departure?.iata ?? ""}`,
    flightNumber: flight.flight?.iata || flight.flight?.number || null,
    airlineIata: flight.airline?.iata || null,
    airlineName: flight.airline?.name || null,
    originCode: flight.departure?.iata || null,
    originAirport: flight.departure?.airport || null,
    destinationCode: flight.arrival?.iata || null,
    destinationAirport: flight.arrival?.airport || null,
    scheduledDeparture: flight.departure?.scheduled || null,
    estimatedDeparture: flight.departure?.estimated || null,
    actualDeparture: flight.departure?.actual || null,
    scheduledArrival: flight.arrival?.scheduled || null,
    estimatedArrival: flight.arrival?.estimated || null,
    actualArrival: flight.arrival?.actual || null,
    status: flight.flight_status || null,
    terminal: flight.departure?.terminal || null,
    gate: flight.departure?.gate || null,
    aircraft: flight.aircraft?.iata || flight.aircraft?.registration || null,
  }));
}

export { getAirports, parseCsvLine };
export default router;
