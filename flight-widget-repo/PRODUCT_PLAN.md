# Flightlo product plan

## Repository audit

The repository contains two overlapping web experiences: a legacy root-level
HTML/JavaScript page and a Next.js application in `flightlo/`. Both currently
make claims about live flight information that the implementation does not
support. The legacy page generates route results and departures when its data
sources fail. The Next.js flight route combines OpenSky aircraft-state data
with randomly generated routes, and its reference endpoints try unrelated
sources and demo credentials. Flight positions are not a reliable substitute
for schedules, airport departures, fares, gates, or cancellations.

## Product direction

Build Flightlo as a useful, source-transparent flight and airport companion,
not a booking engine or fare-comparison product unless a licensed fare source
is selected later. The product should never create flight records, prices,
gates, delays, or amenities to fill gaps in provider coverage.

## Release sequence

### 1. Trustworthy MVP

- Search a maintained airport reference directory by code, name, city, and
  country.
- Show an airport detail page with sourced reference facts and clearly
  attributed local conditions where the weather provider's license permits.
- Show route and airport flight information only when the configured provider
  returns matching records.
- Include provider attribution and retrieval time. Distinguish a verified
  empty result from provider errors and missing configuration.
- Keep API credentials server-side, validate inputs, cache reference data for
  hours and operational data for minutes, and limit calls to protect quotas.
- Remove simulated results, unsupported prices, and claims of live coverage.

### 2. Search traffic

- The selected MVP is React/Vite with an Express data service in `replit-app/`.
  The existing implementations are preserved, not silently migrated or
  deleted. Before SEO launch, add server-rendering or prerendering for airport
  pages, or explicitly integrate the verified data layer into the preserved
  Next.js app.
- Add canonical URLs, sitemap and robots rules, structured metadata, and
  fast mobile rendering.
- Publish airport and airline reference pages only where the page adds useful,
  accurate information beyond a code/name listing. Any travel guides must be
  researched and fact-checked; do not mass-generate thin pages.
- Measure search impressions, organic visits, useful page engagement, and
  return visits before adding monetization.

### 3. Advertising, only after traffic and licensing are ready

- Do not add advertising to the initial release.
- Apply to an ad network only after the site has original, useful content and
  complete privacy and cookie disclosures. Approval and earnings are not
  guaranteed.
- Confirm commercial rights for every data provider before showing ads.
  Aviationstack's current Free plan is marked non-commercial (100 requests per
  month); its Basic plan is listed at US$49.99/month with 10,000 requests and
  commercial use, plus overage charges. Open-Meteo's free API is also
  non-commercial and explicitly treats advertising as commercial use.
- Keep placements away from search controls and operational results, and
  monitor page speed, layout shift, and user retention.

## Data sources and limits

| Data | Initial source | Important limits |
| --- | --- | --- |
| Airport reference | [OurAirports data](https://ourairports.com/data/) | Public-domain reference data; not an operational flight feed and not guaranteed accurate. |
| Airline reference | [OpenFlights](https://openflights.org/data.php) | The published airline snapshot is dated; show its age and do not describe it as live. Replace it with a current licensed source or remove the directory if it is too stale. |
| Flight status and schedules | [Aviationstack](https://aviationstack.com/pricing) | Do not use its non-commercial free tier on an ad-supported production site. A key is required; never expose it to the browser. |
| Airport-area weather | [Open-Meteo](https://open-meteo.com/en/terms) | Free access is non-commercial only. Upgrade or replace it before ads or other commercial use. |

The provider list is a starting point, not a promise of coverage or accuracy.
Where a provider is unavailable or has no matching records, show that state
explicitly and never synthesize a result.

## Deferred until validated

- Fare search, booking links, and affiliate revenue require a separately
  selected supplier and review of commercial/affiliate terms.
- Flight alerts, user accounts, and saved trips should wait until visitors
  demonstrate demand; they add authentication, notification, and privacy
  obligations.
- Airport amenity claims should be added only when a current, attributable
  source is available.

## Verification gates

Before public launch, verify each source's current license, rate limits,
coverage, and error behavior; confirm there are no simulated or hard-coded
operational results; check metadata and mobile usability; and make sure every
advertising/data-provider combination is licensed for commercial use.
