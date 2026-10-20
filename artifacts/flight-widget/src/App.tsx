import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetAirport, useGetAirportWeather, useListAirlines, useListAirports, useSearchFlights } from '@workspace/api-client-react';
import { getGetAirportWeatherQueryKey, getSearchFlightsQueryKey } from '@workspace/api-client-react';
import type { Airport, Flight } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowDownUp, ArrowRight, ArrowUpRight, Building2, ChevronRight, Clock3, CloudSun, Compass, Globe2, MapPin, Plane, Search, Wind, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const today = () => new Date().toISOString().slice(0, 10);

function useTitle(title: string) {
  useEffect(() => { document.title = `${title} — Flightlo`; }, [title]);
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const nav = [
    { href: '/', label: 'Flight search', icon: Compass },
    { href: '/airports', label: 'Airports', icon: MapPin },
    { href: '/airlines', label: 'Airlines', icon: Plane },
  ];
  return <div className="grain min-h-[100dvh] bg-background text-foreground">
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-sm no-underline" data-testid="link-home">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Plane size={18} strokeWidth={2.4} /></div>
          <span className="font-display text-[21px] font-extrabold tracking-[-.07em]">flightlo<span className="text-accent">.</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`focus-ring flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors sm:px-4 ${location === href || (href !== '/' && location.startsWith(href)) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={15} /><span>{label}</span></Link>)}
        </nav>
        <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[.14em] text-muted-foreground md:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Independent travel, clearly</div>
      </div>
    </header>
    <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-8 md:px-10 md:pt-12">{children}</main>
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
        <span className="font-display font-bold text-foreground">flightlo<span className="text-accent">.</span> / Go with what’s known.</span>
        <span>Flight and weather information is supplied by external providers and may change.</span>
      </div>
    </footer>
  </div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary"><span className="h-px w-5 bg-accent" />{children}</div>;
}

function SectionHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>{eyebrow}</Eyebrow><h2 className="font-display text-[25px] font-bold tracking-[-.045em] sm:text-[30px]">{title}</h2></div>{aside}</div>;
}

function LoadingRows() {
  return <div aria-label="Loading" className="space-y-3 py-2">{[0, 1, 2].map(i => <div key={i} className="h-[67px] animate-pulse rounded-xl bg-muted/80" />)}</div>;
}

function ProviderUnavailable({ title = 'This provider is temporarily unavailable.', retry }: { title?: string; retry?: () => void }) {
  return <div role="status" className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
    <div className="flex items-start gap-3"><div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Globe2 size={16} /></div><div className="flex-1"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">We couldn’t verify this information just now. Try again in a moment; missing data is not an indication that nothing is operating.</p>{retry && <button type="button" onClick={retry} className="focus-ring mt-3 rounded-md text-xs font-bold text-primary underline underline-offset-4" data-testid="button-provider-retry">Try again</button>}</div></div>
  </div>;
}

function providerErrorTitle(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback;
  const data = (error as { data?: unknown }).data;
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    if (/not configured|not connected/i.test(data.error)) {
      return 'Live flight data is not connected yet. No unverified results will be shown.';
    }
    return data.error;
  }
  return fallback;
}

function Attribution({ source, attribution, fetchedAt }: { source?: string; attribution?: string; fetchedAt?: string }) {
  if (!source && !attribution) return null;
  return <div className="mt-4 border-t border-border/70 pt-3 text-[10px] leading-relaxed text-muted-foreground">Source: {attribution || source}{source && attribution && source !== attribution ? ` · ${source}` : ''}{fetchedAt ? ` · Updated ${new Date(fetchedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</div>;
}

function FlightRow({ flight }: { flight: Flight }) {
  const departure = flight.actualDeparture || flight.estimatedDeparture || flight.scheduledDeparture;
  const arrival = flight.actualArrival || flight.estimatedArrival || flight.scheduledArrival;
  const time = (value?: string | null) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  return <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 border-b border-border/70 py-4 last:border-0 sm:grid-cols-[1fr_1.1fr_1fr_auto]">
    <div><div className="font-mono text-[12px] font-medium tracking-wide">{flight.flightNumber || flight.airlineIata || 'Flight details'}</div><div className="mt-1 truncate text-xs text-muted-foreground">{flight.airlineName || 'Airline not provided'}</div></div>
    <div className="hidden items-center justify-center gap-3 sm:flex"><div className="text-right"><div className="font-mono text-[14px] font-medium">{time(departure)}</div><div className="text-[10px] text-muted-foreground">{flight.originCode || '—'}</div></div><span className="h-px w-10 bg-border" /><ArrowRight size={13} className="text-accent" /><span className="h-px w-10 bg-border" /><div><div className="font-mono text-[14px] font-medium">{time(arrival)}</div><div className="text-[10px] text-muted-foreground">{flight.destinationCode || '—'}</div></div></div>
    <div className="text-xs text-muted-foreground sm:hidden">{flight.originCode || '—'} <ArrowRight className="mx-1 inline" size={12} /> {flight.destinationCode || '—'} · {time(departure)}</div>
    <div className="justify-self-end text-right"><span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold capitalize text-foreground"><span className={`h-1.5 w-1.5 rounded-full ${/cancel|divert|delay/i.test(flight.status || '') ? 'bg-accent' : 'bg-primary'}`} />{flight.status || 'Status unreported'}</span><div className="mt-1 text-[10px] text-muted-foreground">{flight.gate ? `Gate ${flight.gate}` : ''}{flight.terminal ? `${flight.gate ? ' · ' : ''}Terminal ${flight.terminal}` : ''}</div></div>
  </div>;
}

function HomePage() {
  useTitle('Flight & airport companion');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(today());
  const [submitted, setSubmitted] = useState<{ origin: string; destination?: string; date?: string } | null>(null);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('flightlo-recent') || '[]') as string[]; } catch { return []; }
  });
  const queryParams = submitted || { origin: 'XXX' };
  const flightsQuery = useSearchFlights(queryParams, { query: { enabled: !!submitted, queryKey: getSearchFlightsQueryKey(queryParams) } });

  function search(event: FormEvent) {
    event.preventDefault();
    const code = origin.trim().toUpperCase();
    if (code.length !== 3 || (destination.trim() && destination.trim().length !== 3)) return;
    const next = { origin: code, ...(destination.trim() ? { destination: destination.trim().toUpperCase() } : {}), ...(date ? { date } : {}) };
    setSubmitted(next);
    setRecent(previous => {
      const items = [code, ...previous.filter(item => item !== code)].slice(0, 4);
      localStorage.setItem('flightlo-recent', JSON.stringify(items));
      return items;
    });
  }

  const result = flightsQuery.data;
  return <div className="page-enter">
    <section className="relative overflow-hidden rounded-[28px] bg-[#183f3b] px-6 py-8 text-[#f8f5ec] sm:px-10 sm:py-11 lg:px-[58px] lg:py-[54px]">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-[400px] w-[400px] rounded-full border border-white/10 sm:right-[-38px] sm:top-[-140px] sm:h-[570px] sm:w-[570px]"><div className="absolute inset-8 rounded-full border border-white/10" /><div className="absolute inset-[76px] rounded-full border border-white/10" /><div className="absolute inset-[144px] rounded-full border border-white/10" /><div className="absolute left-1/2 top-[-35px] h-[640px] w-px rotate-[42deg] bg-white/10" /></div>
      <div className="relative max-w-[650px]">
        <Eyebrow>For the in-between moments</Eyebrow>
        <h1 className="font-display max-w-[620px] text-[42px] font-extrabold leading-[1.05] tracking-[-.065em] sm:text-[58px]">Travel with the<br className="hidden sm:block" /> facts in front of you.</h1>
        <p className="mt-4 max-w-[490px] text-[14px] leading-6 text-[#e5ede6]/75 sm:text-[15px]">Check a flight. Get to know an airport. Make the next decision with data you can trace back to its source.</p>
      </div>
      <form onSubmit={search} className="relative mt-8 grid gap-2 rounded-2xl bg-[#f8f5ec] p-2 text-foreground shadow-[0_16px_50px_rgba(12,34,31,.18)] md:grid-cols-[1fr_30px_1fr_1fr_auto] md:items-center">
        <label className="flex min-w-0 flex-col px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">From airport</span><input aria-label="Origin airport IATA code" data-testid="input-origin" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase().slice(0, 3))} placeholder="e.g. SFO" maxLength={3} autoComplete="off" className="mt-1 w-full bg-transparent font-mono text-[17px] font-medium uppercase tracking-[.1em] outline-none placeholder:text-muted-foreground/40" required /></label>
        <button type="button" aria-label="Swap airports" onClick={() => { setOrigin(destination); setDestination(origin); }} className="focus-ring mx-auto grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary" data-testid="button-swap-airports"><ArrowDownUp size={14} /></button>
        <label className="flex min-w-0 flex-col border-t border-border px-3 py-2 md:border-l md:border-t-0"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">To airport <span className="normal-case tracking-normal">(optional)</span></span><input aria-label="Destination airport IATA code" data-testid="input-destination" value={destination} onChange={e => setDestination(e.target.value.toUpperCase().slice(0, 3))} placeholder="e.g. LHR" maxLength={3} autoComplete="off" className="mt-1 w-full bg-transparent font-mono text-[17px] font-medium uppercase tracking-[.1em] outline-none placeholder:text-muted-foreground/40" /></label>
        <label className="flex min-w-0 flex-col border-t border-border px-3 py-2 md:border-l md:border-t-0"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Date</span><input type="date" aria-label="Flight date" data-testid="input-flight-date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] outline-none" /></label>
        <button type="submit" className="focus-ring flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 md:h-[54px]" data-testid="button-flight-search"><Search size={16} />Find flights</button>
      </form>
      <div className="relative mt-3 flex items-center justify-between gap-3 text-[10px] text-[#e5ede6]/60"><span>Airport IATA codes, like SFO or LHR</span>{recent.length > 0 && <div className="flex items-center gap-2"><span className="hidden sm:inline">Recent</span>{recent.map(code => <button key={code} onClick={() => { setOrigin(code); setDestination(''); }} className="focus-ring rounded-md border border-white/20 px-2 py-1 font-mono font-medium text-[#f8f5ec] hover:bg-white/10" data-testid={`button-recent-${code}`}>{code}</button>)}</div>}</div>
    </section>

    <section className="mt-11">
      <SectionHeading eyebrow="Flight board" title={submitted ? `Results from ${submitted.origin}` : 'Your flight, honestly'} aside={submitted ? <button onClick={() => { setSubmitted(null); setOrigin(''); setDestination(''); }} className="focus-ring inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-clear-search"><X size={13} />Clear lookup</button> : null} />
      {!submitted ? <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8 sm:py-7">
        <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Plane size={19} /></div><div><h3 className="font-display text-[19px] font-bold tracking-[-.03em]">Look up a real flight</h3><p className="mt-1 max-w-[530px] text-sm leading-6 text-muted-foreground">Search by departure airport to see verified records from the connected flight provider. We don’t fill in the gaps with guesses.</p></div></div><span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">External data · source attributed</span>
      </div> : flightsQuery.isLoading ? <LoadingRows /> : flightsQuery.isError ? <ProviderUnavailable title={providerErrorTitle(flightsQuery.error, 'Live flight data is temporarily unavailable.')} retry={() => flightsQuery.refetch()} /> : result ? <div className="rounded-2xl border border-border bg-card px-5 py-1 sm:px-7">
        {result.flights.length ? result.flights.map(flight => <FlightRow key={flight.id} flight={flight} />) : <div role="status" className="py-8 text-center"><div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground"><Search size={16} /></div><p className="text-sm font-semibold">No matching records returned</p><p className="mt-1 text-xs text-muted-foreground">The provider returned no records for this lookup. This does not confirm that no flights are operating.</p></div>}
        <Attribution source={result.source} attribution={result.attribution} fetchedAt={result.fetchedAt} />
      </div> : null}
    </section>
    <section className="mt-11 grid gap-4 border-t border-border pt-7 sm:grid-cols-[1fr_1fr]">
      <Link href="/airports" className="focus-ring group flex items-center justify-between rounded-xl px-1 py-2 hover:text-primary" data-testid="link-explore-airports"><span className="flex items-center gap-3"><MapPin size={17} className="text-accent" /><span><span className="block text-sm font-semibold">Airport directory</span><span className="mt-1 block text-xs text-muted-foreground">Codes, locations and local conditions</span></span></span><ArrowUpRight size={16} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
      <Link href="/airlines" className="focus-ring group flex items-center justify-between rounded-xl px-1 py-2 hover:text-primary" data-testid="link-explore-airlines"><span className="flex items-center gap-3"><Plane size={17} className="text-accent" /><span><span className="block text-sm font-semibold">Airline directory</span><span className="mt-1 block text-xs text-muted-foreground">A reference for carrier codes and names</span></span></span><ArrowUpRight size={16} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
    </section>
  </div>;
}

function AirportDirectory() {
  useTitle('Airport directory');
  const [search, setSearch] = useState('');
  const params = useMemo(() => ({ ...(search.trim() ? { q: search.trim() } : {}), limit: 50 }), [search]);
  const query = useListAirports(params);
  const response = query.data;
  return <div className="page-enter">
    <Eyebrow>Reference / 01</Eyebrow><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="font-display text-[42px] font-extrabold tracking-[-.065em] sm:text-[54px]">Airport index<span className="text-accent">.</span></h1><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Find the places behind the codes. Search verified airport reference data by city, name or IATA code.</p></div><div className="font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground">Directory / Search</div></div>
    <div className="mt-8 flex max-w-[680px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary/60"><Search size={17} className="shrink-0 text-muted-foreground" /><input type="search" aria-label="Search airports" data-testid="input-airport-search" placeholder="Search airport, city or code" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/65" />{search && <button aria-label="Clear airport search" onClick={() => setSearch('')} className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground" data-testid="button-clear-airport-search"><X size={15} /></button>}</div>
    <div className="mt-8">
      {query.isLoading ? <LoadingRows /> : query.isError ? <ProviderUnavailable title={providerErrorTitle(query.error, 'Airport reference data is unavailable.')} retry={() => query.refetch()} /> : response ? <>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{response.airports.length} {response.airports.length === 1 ? 'airport' : 'airports'} shown</span><span>Search the reference, not a booking inventory</span></div>
        {response.airports.length ? <div className="overflow-hidden rounded-2xl border border-border bg-card">{response.airports.map((airport, index) => <AirportRow key={airport.code} airport={airport} index={index} />)}</div> : <EmptySearch query={search} />}
        <Attribution source={response.source} attribution={response.attribution} fetchedAt={response.fetchedAt} />
      </> : null}
    </div>
  </div>;
}

function AirportRow({ airport, index }: { airport: Airport; index: number }) {
  return <Link href={`/airports/${airport.code}`} className={`focus-ring group grid grid-cols-[52px_1fr_auto] items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/55 sm:grid-cols-[65px_1fr_140px_32px] sm:px-5 ${index ? 'border-t border-border/70' : ''}`} data-testid={`link-airport-${airport.code}`}>
    <span className="font-mono text-[13px] font-medium tracking-[.08em] text-primary">{airport.code}</span>
    <span className="min-w-0"><span className="block truncate text-sm font-semibold">{airport.name}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{airport.city}, {airport.country}</span></span>
    <span className="hidden text-xs capitalize text-muted-foreground sm:block">{airport.type}</span><ChevronRight size={16} className="justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
  </Link>;
}

function EmptySearch({ query }: { query: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-12 text-center"><div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground"><Search size={16} /></div><p className="text-sm font-semibold">No reference match for “{query}”</p><p className="mt-1 text-xs text-muted-foreground">Try another airport name, city or three-letter code.</p></div>;
}

function WeatherCard({ airport }: { airport: Airport }) {
  const params = useMemo(() => ({ latitude: airport.latitude, longitude: airport.longitude, ...(airport.timezone ? { timezone: airport.timezone } : {}) }), [airport.latitude, airport.longitude, airport.timezone]);
  const query = useGetAirportWeather(params, { query: { queryKey: getGetAirportWeatherQueryKey(params), enabled: Number.isFinite(airport.latitude) && Number.isFinite(airport.longitude) } });
  const weather = query.data;
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <div className="flex items-center justify-between"><div><Eyebrow>At the airport</Eyebrow><h2 className="font-display text-xl font-bold tracking-[-.04em]">Local weather</h2></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8e8d5] text-primary"><CloudSun size={19} /></div></div>
    {query.isLoading ? <div className="mt-6 h-[92px] animate-pulse rounded-xl bg-muted" /> : query.isError ? <div className="mt-5"><ProviderUnavailable title={providerErrorTitle(query.error, 'Local weather is unavailable.')} retry={() => query.refetch()} /></div> : weather ? <><div className="mt-5 flex items-end justify-between"><div className="font-display text-[56px] font-bold leading-none tracking-[-.08em]">{Math.round(weather.temperatureC)}<span className="text-[26px]">°C</span></div><div className="pb-1 text-right text-xs text-muted-foreground">Feels like {Math.round(weather.feelsLikeC)}°</div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4"><Metric icon={<Wind size={13} />} label="Wind" value={`${Math.round(weather.windSpeedKmh)} km/h`} /><Metric icon={<span className="text-[11px]">RH</span>} label="Humidity" value={`${weather.humidityPercent}%`} /><Metric icon={<CloudSun size={13} />} label="Precip." value={`${weather.precipitationMm} mm`} /></div><Attribution source={weather.source} fetchedAt={weather.fetchedAt} /></> : <ProviderUnavailable title="Local weather could not be loaded." retry={() => query.refetch()} />}
  </section>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div><div className="flex items-center gap-1 text-[10px] text-muted-foreground">{icon}{label}</div><div className="mt-1 font-mono text-[12px] font-medium">{value}</div></div>;
}

function AirportDetail() {
  const params = useParams<{ code: string }>();
  const code = (params.code || '').toUpperCase();
  useTitle(`${code || 'Airport'} airport details`);
  const airportQuery = useGetAirport(code);
  const airport = airportQuery.data;
  const departureParams = useMemo(() => ({ origin: code, date: today() }), [code]);
  const departuresQuery = useSearchFlights(departureParams, { query: { queryKey: getSearchFlightsQueryKey(departureParams), enabled: !!airport } });
  return <div className="page-enter">
    <Link href="/airports" className="focus-ring inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary" data-testid="link-back-airports"><ChevronRight size={14} className="rotate-180" />Airport index</Link>
    {airportQuery.isLoading ? <div className="mt-7 h-48 animate-pulse rounded-[24px] bg-muted" /> : airportQuery.isError || !airport ? <div className="mt-7"><ProviderUnavailable title={`Airport details for ${code} are unavailable.`} retry={() => airportQuery.refetch()} /></div> : <>
      <section className="relative mt-6 overflow-hidden rounded-[26px] bg-[#183f3b] px-6 py-8 text-[#f8f5ec] sm:px-10 sm:py-10">
        <div aria-hidden className="absolute right-[-60px] top-[-110px] h-[320px] w-[320px] rounded-full border border-white/10 sm:h-[470px] sm:w-[470px]"><div className="absolute inset-8 rounded-full border border-white/10" /><div className="absolute inset-16 rounded-full border border-white/10" /></div>
        <div className="relative"><Eyebrow>Airport reference / {airport.type}</Eyebrow><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="font-mono text-[13px] tracking-[.16em] text-[#f0ad8c]">{airport.code}{airport.icao ? ` · ${airport.icao}` : ''}</div><h1 className="mt-2 max-w-[750px] font-display text-[38px] font-extrabold leading-tight tracking-[-.06em] sm:text-[52px]">{airport.name}</h1><p className="mt-2 flex items-center gap-2 text-sm text-[#e5ede6]/75"><MapPin size={14} />{airport.city}, {airport.country}</p></div><div className="flex items-center gap-2 text-xs text-[#e5ede6]/70"><Clock3 size={14} />{airport.timezone || 'Local timezone not listed'}</div></div><div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-4 font-mono text-[10px] text-[#e5ede6]/65"><span>LAT {airport.latitude.toFixed(4)}</span><span>LON {airport.longitude.toFixed(4)}</span><span className="capitalize">{airport.type} airport</span></div></div>
      </section>
      <div className="mt-7 grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <WeatherCard airport={airport} />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><Eyebrow>Departure board / Today</Eyebrow><h2 className="font-display text-xl font-bold tracking-[-.04em]">Verified departures</h2><p className="mt-1 text-xs text-muted-foreground">Records reported for {airport.code} by the connected flight provider.</p></div><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Plane size={18} /></div></div>
          {departuresQuery.isLoading ? <div className="mt-5"><LoadingRows /></div> : departuresQuery.isError ? <div className="mt-5"><ProviderUnavailable title={providerErrorTitle(departuresQuery.error, 'Departure data is unavailable.')} retry={() => departuresQuery.refetch()} /></div> : departuresQuery.data ? <>{departuresQuery.data.flights.length ? <div className="mt-3">{departuresQuery.data.flights.map(flight => <FlightRow key={flight.id} flight={flight} />)}</div> : <div className="mt-5 rounded-xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">The provider returned no departure records for this query. This is not confirmation that the airport has no departures.</div>}<Attribution source={departuresQuery.data.source} attribution={departuresQuery.data.attribution} fetchedAt={departuresQuery.data.fetchedAt} /></> : null}
        </section>
      </div>
      <div className="mt-7 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4 text-xs leading-5 text-muted-foreground"><Building2 size={15} className="mt-0.5 shrink-0 text-primary" /><p>Airport facts come from the airport reference provider. Weather and flight operations are separate live sources; values may be delayed or unavailable.</p></div>
    </>}
  </div>;
}

function AirlinesPage() {
  useTitle('Airline directory');
  const [search, setSearch] = useState('');
  const params = useMemo(() => ({ ...(search.trim() ? { q: search.trim() } : {}), limit: 50 }), [search]);
  const query = useListAirlines(params);
  const response = query.data;
  return <div className="page-enter">
    <Eyebrow>Reference / 02</Eyebrow><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="font-display text-[42px] font-extrabold tracking-[-.065em] sm:text-[54px]">Airline index<span className="text-accent">.</span></h1><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">A practical carrier reference. Search airline names and codes from verified external data.</p></div><div className="font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground">Directory / Search</div></div>
    <div className="mt-8 flex max-w-[680px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary/60"><Search size={17} className="shrink-0 text-muted-foreground" /><input type="search" aria-label="Search airlines" data-testid="input-airline-search" placeholder="Search airline or code" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/65" />{search && <button aria-label="Clear airline search" onClick={() => setSearch('')} className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground" data-testid="button-clear-airline-search"><X size={15} /></button>}</div>
    <div className="mt-8">
      {query.isLoading ? <LoadingRows /> : query.isError ? <ProviderUnavailable title={providerErrorTitle(query.error, 'Airline reference data is unavailable.')} retry={() => query.refetch()} /> : response ? <>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{response.airlines.length} {response.airlines.length === 1 ? 'airline' : 'airlines'} shown</span><span>Reference data only</span></div>
        {response.airlines.length ? <div className="overflow-hidden rounded-2xl border border-border bg-card">{response.airlines.map((airline, index) => <div key={airline.code} data-testid={`row-airline-${airline.code}`} className={`grid grid-cols-[48px_1fr_24px] items-center gap-3 px-4 py-4 sm:grid-cols-[64px_1fr_180px_24px] sm:px-5 ${index ? 'border-t border-border/70' : ''}`}><span className="font-mono text-[13px] font-medium tracking-[.08em] text-primary">{airline.code}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{airline.name}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{airline.country || 'Country not listed'}</span></span><span className="hidden font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground sm:block">{airline.icao || 'ICAO —'}</span><Plane size={15} className="justify-self-end text-muted-foreground/70" /></div>)}</div> : <EmptySearch query={search} />}
        <Attribution source={response.source} attribution={response.attribution} fetchedAt={response.fetchedAt} />
      </> : null}
    </div>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch>
    <Route path="/" component={HomePage} />
    <Route path="/airports" component={AirportDirectory} />
    <Route path="/airports/:code" component={AirportDetail} />
    <Route path="/airlines" component={AirlinesPage} />
    <Route component={NotFound} />
  </Switch></Shell></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
