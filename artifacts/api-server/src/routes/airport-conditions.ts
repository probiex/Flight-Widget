import { Router, type IRouter } from "express";
import { GetAirportConditionsResponse } from "@workspace/api-zod";
import { getAirports } from "./flight-data";
import { publicJson, sourceValue } from "../services/public-source-cache";

const router: IRouter = Router();
type RecordData = Record<string, unknown>;
const object = (value: unknown): RecordData => value !== null && typeof value === "object" ? value as RecordData : {};
const text = (value: unknown) => typeof value === "string" && value ? value : null;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
function iso(value: unknown): string | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
async function weatherProduct(product: "metar" | "taf", station: string) {
  const payload = await publicJson(`https://aviationweather.gov/api/data/${product}?ids=${station}&format=json`);
  if (!Array.isArray(payload)) throw new Error("Invalid aviation weather response");
  if (!payload.length) return null;
  const record = payload.map(object).find(r => r.icaoId === station);
  if (!record || !text(record[product === "metar" ? "rawOb" : "rawTAF"])) throw new Error("Missing matching station report");
  return record;
}

router.get("/airports/:code/conditions", async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) { res.status(400).json({ error: "Valid IATA code required." }); return; }
  try {
    const airport = (await getAirports()).find(a => a.code === code);
    if (!airport) { res.status(404).json({ error: "Airport not found." }); return; }
    const result = await sourceValue(`conditions:${code}`, 5 * 60_000, async () => {
      const station = airport.icao && /^[A-Z]{4}$/.test(airport.icao) ? airport.icao : null;
      const us = ["US", "PR", "GU", "VI", "AS", "MP"].includes(airport.country);
      const warnings: string[] = [];
      const products = await Promise.allSettled([
        station ? weatherProduct("metar", station) : Promise.resolve(null),
        station ? weatherProduct("taf", station) : Promise.resolve(null),
        us ? publicJson(`https://api.weather.gov/alerts/active?point=${airport.latitude.toFixed(4)},${airport.longitude.toFixed(4)}`) : Promise.resolve(null),
      ]);
      const read = (index: number, label: string) => {
        const result = products[index];
        if (result.status === "fulfilled") return result.value;
        warnings.push(`${label} provider unavailable; no inference can be made about current conditions.`);
        return undefined;
      };
      const observation = read(0, "METAR") as RecordData | null | undefined;
      const forecast = read(1, "TAF") as RecordData | null | undefined;
      const alertPayload = read(2, "NWS alerts");
      const alertFeatures = object(alertPayload).features;
      if (us && alertPayload !== undefined && !Array.isArray(alertFeatures)) warnings.push("NWS returned an invalid alert response.");
      const alerts = Array.isArray(alertFeatures) ? alertFeatures.slice(0, 20).map(feature => {
        const a = object(object(feature).properties);
        return { event: text(a.event) ?? "Event not provided", headline: text(a.headline) ?? "Headline not provided",
          severity: text(a.severity) ?? "Unknown", description: text(a.description) ?? "Description not provided", expires: iso(a.expires) };
      }) : [];
      return {
        station, source: "NOAA Aviation Weather Center · NWS alerts (US coverage only)",
        metarStatus: !station ? "unsupported" : observation === undefined ? "unavailable" : observation ? "available" : "no_data",
        tafStatus: !station ? "unsupported" : forecast === undefined ? "unavailable" : forecast ? "available" : "no_data",
        alertsStatus: !us ? "unsupported" : !Array.isArray(alertFeatures) ? "unavailable" : alerts.length ? "available" : "no_data",
        warnings,
        metar: observation ? {
          raw: text(observation.rawOb), observedAt: iso(observation.obsTime) ?? iso(observation.reportTime),
          temperatureC: number(observation.temp), dewpointC: number(observation.dewp), windKnots: number(observation.wspd),
          windDirection: observation.wdir === undefined || observation.wdir === null ? null : String(observation.wdir),
          visibilityMiles: observation.visib === undefined || observation.visib === null ? null : String(observation.visib),
          pressureHpa: number(observation.altim), category: text(observation.fltCat),
        } : null,
        taf: forecast ? { raw: text(forecast.rawTAF), issuedAt: iso(forecast.issueTime),
          validFrom: iso(forecast.validTimeFrom), validTo: iso(forecast.validTimeTo) } : null,
        alerts,
      };
    });
    res.json(GetAirportConditionsResponse.parse({ ...result.value, fetchedAt: result.fetchedAt }));
  } catch (error) {
    req.log.warn({ err: error }, "Airport conditions unavailable");
    res.status(503).json({ error: "Airport conditions could not be verified." });
  }
});
export default router;
