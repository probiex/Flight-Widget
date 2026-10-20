import { Router, type IRouter } from "express";
import { GetAirportResourcesResponse } from "@workspace/api-zod";
import { getAirports, parseCsvLine } from "./flight-data";
import { publicFetch, safeWebLink, sourceValue } from "../services/public-source-cache";

const router: IRouter = Router();
const SIX_HOURS = 6 * 60 * 60_000;
async function csvTable(name: string) {
  return sourceValue(`ourairports:${name}`, SIX_HOURS, async () => {
    const text = await (await publicFetch(`https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/${name}.csv`)).text();
    const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
    const headers = parseCsvLine(lines.shift() ?? "");
    if (!headers.includes("id")) throw new Error("Reference CSV header is invalid");
    return lines.filter(Boolean).map(line => Object.fromEntries(parseCsvLine(line).map((value, i) => [headers[i], value])));
  });
}
function numeric(value?: string) { return value?.trim() && Number.isFinite(Number(value)) ? Number(value) : null; }

router.get("/airports/:code/resources", async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) { res.status(400).json({ error: "Valid IATA code required." }); return; }
  try {
    const airport = (await getAirports()).find(a => a.code === code);
    if (!airport) { res.status(404).json({ error: "Airport not found." }); return; }
    const names = ["runways", "airport-frequencies", "navaids", "countries"];
    const results = await Promise.allSettled(names.map(csvTable));
    const warnings: string[] = [];
    const rows = (index: number) => {
      const result = results[index];
      if (result.status === "fulfilled") return result.value.value;
      warnings.push(`${names[index]} source unavailable; an empty section is not confirmation that no records exist.`);
      return [];
    };
    const runways = rows(0).filter(r => r.airport_ident === airport.ident).map(r => ({
      ident: [r.le_ident, r.he_ident].filter(Boolean).join(" / ") || "Identifier not provided",
      lengthFt: numeric(r.length_ft), widthFt: numeric(r.width_ft), surface: r.surface || null,
      lighted: r.lighted === "1", closed: r.closed === "1",
    }));
    const frequencies = rows(1).filter(r => r.airport_ident === airport.ident && numeric(r.frequency_mhz) !== null).map(r => ({
      type: r.type, description: r.description, mhz: Number(r.frequency_mhz),
    }));
    const navaids = rows(2).filter(r => r.associated_airport === airport.ident).map(r => ({
      ident: r.ident, name: r.name, type: r.type, frequencyKhz: numeric(r.frequency_khz),
    }));
    const country = rows(3).find(r => r.code === airport.country);
    const times = results.flatMap(r => r.status === "fulfilled" ? [r.value.fetchedAt] : []).sort();
    if (!times.length) { res.status(503).json({ error: "Airport resource datasets are unavailable." }); return; }
    res.json(GetAirportResourcesResponse.parse({
      airportCode: code, countryName: country?.name ?? null,
      officialWebsite: safeWebLink(airport.officialWebsite), wikipediaUrl: safeWebLink(airport.wikipediaUrl),
      mapUrl: `https://www.openstreetmap.org/?mlat=${airport.latitude}&mlon=${airport.longitude}#map=14/${airport.latitude}/${airport.longitude}`,
      source: "OurAirports · public domain; OpenStreetMap map is an external link",
      fetchedAt: times[0], warnings, runways, frequencies, navaids,
    }));
  } catch (error) {
    req.log.warn({ err: error }, "Airport resource source unavailable");
    res.status(503).json({ error: "Airport reference resources are unavailable." });
  }
});
export default router;
