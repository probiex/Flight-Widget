# Flightlo free-data plan

## Scope and evidence

This is a broad, reviewed starting set, **not a claim to have found every free
source on the web**. Free access is not the same as permission for commercial
reuse. The app's `/sources` directory and `/api/sources` response distinguish:

- **Integrated:** real data is fetched and shown.
- **Link-only:** a useful external resource is available, but no content is
  copied, scraped, or represented as a live API integration.
- **Planned:** promising source, not available in the app yet.
- **Restricted:** not usable as an unrestricted free fallback.

The registry contains source/terms links, licence caveats, commercial-use
conditions, coverage, cache policy, and the review date. It is research metadata,
not a guarantee of provider uptime or legal clearance for every use.

## Implemented data and product value

| User need | Actual source and endpoint | Data treatment |
| --- | --- | --- |
| Find airports | OurAirports airport CSV → `/api/airports` | Search published IATA/ICAO, names, city and country; no simulated locations |
| Understand an airport | OurAirports country, runway, frequency and navaid CSVs → `/api/airports/{code}/resources` | Join on source airport identifier, not guessed name; expose missing fields and per-dataset failures |
| Check reported weather | NOAA AWC → `/api/airports/{code}/conditions` | Query source ICAO station, show actual raw METAR and TAF plus decoded source fields; preserve observation, issue and validity times |
| Review US alerts | NWS point alerts → airport conditions | Use airport coordinates; distinguish US successful empty results, unavailable service and unsupported countries |
| Estimate travel currency | Frankfurter v2 blended API → `/api/currencies` and `/api/exchange-rate` | Currency list comes from provider; multiply entered amount by the returned pair rate; display rate date and retrieval time |
| Research airline codes | OpenFlights airline reference → `/api/airlines` | Historical snapshot, never described as current operating status; ODbL attribution/share-alike and upstream content caveats retained |
| Find authoritative guidance | External official resources in `/sources` | FAA NAS status, FCDO and US State advice, TSA screening rules, US DOT consumer rights and EU passenger rights; no automated eligibility/legal decisions |
| Read maps/background | OSM and source-provided Wikipedia/official-airport links | Open external pages; no public tile server, Overpass queries, copied article text or unlicensed images |

Open-Meteo's non-commercial hosted API has been removed from the active weather
experience; its old route returns HTTP 410. Optional Aviationstack flight
integration is separate and still unavailable without a key. It is not a
commercially free source just because a free testing plan exists.

## Licence evidence and attribution

- **OurAirports:** [official data terms](https://ourairports.com/data/) release
  data into the public domain with no accuracy/fitness guarantee.
- **NOAA/NWS:** [API documentation](https://www.weather.gov/documentation/services-web-api)
  describes open data free for any purpose. The
  [NWS disclaimer](https://www.weather.gov/disclaimer) has public-domain,
  third-party-content, no-endorsement and proper-use provisions. We preserve raw
  reports and identify decoded presentation as Flightlo's display.
- **AWC service:** [API guidelines](https://aviationweather.gov/data/api/) require
  narrow requests, a custom user agent, limited request frequency and compliance
  with the documented 100 requests/minute limit. No client-side direct requests:
  CORS is not supported.
- **Frankfurter:** the [official FAQ](https://frankfurter.dev/#faq) permits
  commercial blended-rate use and caching. The
  [licence page](https://frankfurter.dev/license/) distinguishes MIT software
  from provider data rights. We use blended `/v2/rate` endpoints, not direct
  individual-provider endpoints with potentially different terms.
- **OpenFlights:** the [source licence notice](https://openflights.org/data.php#license)
  specifies ODbL/Database Contents License and warns about upstream content
  rights. The filtered airline reference data made available here is offered
  under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) with attribution
  to OpenFlights. Original data is downloadable at
  <https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat>.
  The filtering operation keeps source rows with two-character codes not marked
  inactive, deduplicates codes and sorts names; this is not proof they operate
  today. ODbL obligations concern this reference data, not a claim to relicense
  unrelated app code. Review upstream rights or replace the dataset before an
  ad-supported launch.
- **OpenSky:** [current terms](https://opensky-network.org/about/terms-of-use)
  require written permission for operational REST integration; it is not a free
  live-product substitute.
- **Open-Meteo:** [terms](https://open-meteo.com/en/terms) exclude advertising
  from free non-commercial hosted use. It is disabled rather than quietly
  retained in the background.

Links are editorial references, not copied article/media content, government
endorsement, legal advice, or blanket commercial clearance. Recheck source terms
before enabling advertising and when the product's use changes.

## Freshness, failure and cost controls

1. Reference files use a six-hour cache; existing airline data uses 24 hours.
   Source download time never masquerades as the historical dataset's update.
2. Airport conditions use a five-minute cache. Observation and TAF times are
   preserved separately. The UI warns on observations older than two hours and
   expired TAFs and allows report refresh.
3. Rates use a one-hour cache and currency catalogs 24 hours. Missing or
   unsupported pairs fail explicitly. There are no fallback rates.
4. New public-source requests share in-flight work, bounded caches, a custom
   user agent, 15-second timeouts, and a conservative per-host per-process
   ceiling of 40 network requests/minute. Failed loads cool down for a minute.
   Independent METAR/TAF/alert failures remain distinguishable.
5. Free external data does not mean hosting/bandwidth is cost-free or unlimited.
   Before scaling beyond one process, move cache entries, upstream budgets and
   cooldowns to shared infrastructure. Multiple replicas must not multiply the
   provider's allowed traffic.
6. Never call arbitrary source URLs from user input. Official links are opened
   only for HTTP(S) destinations and never fetched as user-directed server URLs.

## Next stages, in priority order

### Quality and trustworthy search traffic

Measure report coverage, provider latency/error rate, cache efficiency and rate
budget exhaustion. Index factual airport pages only when they contain useful
sourced content; implement server-rendering/prerendering, canonical URLs and a
sitemap before relying on search traffic. Avoid copied travel guides and
mass-generated thin pages.

### Reference enrichment

[Wikidata structured entities](https://www.wikidata.org/wiki/Wikidata:Licensing)
are CC0 and a useful candidate for airline/aircraft reference enrichment.
Implement stable ID joins, ambiguity checks, provenance and daily caching before
enabling it. Do not infer operating status from an absent dissolution date.
No Wikidata results are currently fetched or displayed.

For airport photos, Wikimedia Commons requires per-file author/licence review.
Keep attribution and licence metadata with each asset. It is currently planned,
not silently populated with scraped images.

### Nearby amenities and transport

OSM data may support a useful POI feature under ODbL, but free public services
have separate operational restrictions.
[Overpass guidance](https://wiki.openstreetmap.org/wiki/Overpass_API)
directs commercial use toward self-hosted or paid service. Use compliant
regional extracts or a suitable provider and apply attribution/share-alike
before enabling a commercial amenities feature; do not flood a public endpoint.

### Operational information and monetization

Universal, current schedules, fares, gates, cancellations and visa decisions
were **not** verified as freely reusable global datasets. Do not fabricate them
from ADS-B positions, historical routes or general travel pages. Keep optional
commercial suppliers separate from the free-source product. Ads require
licence review, privacy/consent setup, original useful content and monitoring;
this work does not enable ads or guarantee approval or earnings.
