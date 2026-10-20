import { type ReactNode } from 'react';
import { useGetAirportConditions, useGetAirportResources } from '@workspace/api-client-react';
import { AlertTriangle } from 'lucide-react';
import { Eyebrow, ExtLink, Failure, Skeleton, Stamp, Warnings } from '@/components/common';

const SAFETY = 'Reference information only. Not for navigation, flight planning or official weather briefing. Radio, runway and navaid records may be stale; confirm with official sources.';

export function SafetyNotice() {
  return <div role="note" data-testid="notice-safety" className="mt-7 flex items-start gap-3 rounded-xl border-2 border-accent/60 bg-accent/10 p-4 text-sm font-semibold leading-6"><AlertTriangle size={18} className="mt-1 shrink-0 text-accent" /><p>{SAFETY}</p></div>;
}

function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'warn' | 'ok' }) {
  const c = tone === 'ok' ? 'bg-primary text-primary-foreground' : tone === 'warn' ? 'bg-accent text-accent-foreground' : 'border border-dashed border-muted-foreground text-muted-foreground';
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c}`}>{children}</span>;
}

function statusPill(s: string) {
  const label = s === 'no_data' ? 'no reports' : s;
  return <Pill tone={s === 'available' ? 'ok' : s === 'unavailable' ? 'warn' : 'plain'}>{label}</Pill>;
}

function Panel({ title, status, children }: { title: string; status?: string; children: ReactNode }) {
  return <div className="rounded-xl border border-border/80 p-4"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="font-display text-base font-bold">{title}</h3>{status && statusPill(status)}</div>{children}</div>;
}

const num = (v: number | null | undefined, unit = '') => v == null ? 'Not reported' : `${v}${unit}`;
const th = 'py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground';

export function ConditionsCard({ code }: { code: string }) {
  const q = useGetAirportConditions(code);
  const c = q.data;
  const age = c?.metar?.observedAt ? Date.now() - Date.parse(c.metar.observedAt) : null;
  const expired = c?.taf?.validTo ? Date.parse(c.taf.validTo) < Date.now() : false;
  return <section aria-labelledby="cond-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <Eyebrow>NOAA Aviation Weather</Eyebrow><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="cond-title" className="font-display text-xl font-bold tracking-[-.04em]">METAR, TAF and alerts</h2><button type="button" disabled={q.isFetching} onClick={() => q.refetch()} className="focus-ring rounded-md text-xs font-semibold text-primary underline disabled:opacity-50">{q.isFetching ? 'Refreshing…' : 'Refresh reports'}</button></div>
    {q.isLoading ? <Skeleton h={90} /> : q.isError || !c ? <div className="mt-4"><Failure title="Weather reports could not be loaded." retry={() => q.refetch()} /></div> : <div className="mt-4 space-y-3">
      <p className="font-mono text-[11px] text-muted-foreground">Station {c.station ?? 'none matched'}</p>
      <Warnings items={c.warnings} />
      {age !== null && age > 2 * 60 * 60_000 && <Warnings items={['This observation is more than two hours old. It is not a current weather confirmation.']} />}
      {expired && <Warnings items={['The returned TAF validity period has ended. Do not treat it as a current forecast.']} />}
      <Panel title="METAR (observation)" status={c.metarStatus}>
        {c.metar ? <><pre data-testid="text-metar-raw" className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 p-3 font-mono text-xs">{c.metar.raw}</pre>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{([['Category', c.metar.category ?? 'Not reported'], ['Temperature', num(c.metar.temperatureC, ' °C')], ['Dewpoint', num(c.metar.dewpointC, ' °C')], ['Wind', c.metar.windKnots == null ? 'Not reported' : `${c.metar.windKnots} kt${c.metar.windDirection ? ` from ${c.metar.windDirection}` : ''}`], ['Visibility', c.metar.visibilityMiles ? `${c.metar.visibilityMiles} mi` : 'Not reported'], ['Pressure', num(c.metar.pressureHpa, ' hPa')]] as const).map(([k, v]) => <div key={k}><dt className="text-[10px] text-muted-foreground">{k}</dt><dd className="font-mono font-medium">{v}</dd></div>)}</dl>
          <p className="mt-2 text-[10px] text-muted-foreground"><Stamp label="Observed" value={c.metar.observedAt} /></p></> : <p role="status" className="text-xs leading-5 text-muted-foreground">{c.metarStatus === 'unavailable' ? 'The METAR source could not be reached.' : 'No METAR reported for this station. That is not the same as clear weather.'}</p>}
      </Panel>
      <Panel title="TAF (forecast)" status={c.tafStatus}>
        {c.taf ? <><pre data-testid="text-taf-raw" className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 p-3 font-mono text-xs">{c.taf.raw}</pre><p className="mt-2 flex flex-wrap gap-x-4 text-[10px] text-muted-foreground"><Stamp label="Issued" value={c.taf.issuedAt} /><Stamp label="Valid from" value={c.taf.validFrom} /><Stamp label="to" value={c.taf.validTo} /></p></> : <p role="status" className="text-xs leading-5 text-muted-foreground">{c.tafStatus === 'unavailable' ? 'The TAF source could not be reached.' : 'No TAF reported for this station. Many airports do not issue one.'}</p>}
      </Panel>
      <Panel title="Weather alerts" status={c.alertsStatus}>
        {c.alertsStatus === 'unsupported' ? <p role="status" className="text-xs leading-5 text-muted-foreground">Alerts are supported for US locations only. This airport is outside coverage, so absence of alerts here means nothing.</p>
          : c.alertsStatus === 'unavailable' ? <p role="status" className="text-xs text-muted-foreground">The alerts source could not be reached. Alerts may exist.</p>
          : c.alerts.length ? <ul className="space-y-3">{c.alerts.map((a, i) => <li key={i} className="rounded-lg bg-accent/10 p-3 text-xs leading-5"><div className="font-bold">{a.event} <Pill tone="warn">{a.severity}</Pill></div><p className="mt-1 font-semibold">{a.headline}</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{a.description}</p><p className="mt-1 text-[10px]"><Stamp label="Expires" value={a.expires} /></p></li>)}</ul>
          : <p role="status" className="text-xs text-muted-foreground">The alerts source returned no active alerts for this location at retrieval time.</p>}
      </Panel>
      <p className="border-t border-border/70 pt-3 text-[10px] text-muted-foreground">Source: {c.source} · <Stamp label="Retrieved" value={c.fetchedAt} /></p>
    </div>}
  </section>;
}

export function ResourcesCard({ code }: { code: string }) {
  const q = useGetAirportResources(code);
  const r = q.data;
  return <section aria-labelledby="res-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <Eyebrow>Infrastructure reference</Eyebrow><h2 id="res-title" className="font-display text-xl font-bold tracking-[-.04em]">Runways, frequencies, navaids</h2>
    {q.isLoading ? <Skeleton h={90} /> : q.isError || !r ? <div className="mt-4"><Failure title="Airport infrastructure records could not be loaded." retry={() => q.refetch()} /></div> : <div className="mt-4 space-y-5">
      <Warnings items={r.warnings} />
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">{r.officialWebsite ? <ExtLink href={r.officialWebsite}>Official website</ExtLink> : <span className="text-muted-foreground">No official website listed</span>}{r.wikipediaUrl ? <ExtLink href={r.wikipediaUrl}>Wikipedia</ExtLink> : <span className="text-muted-foreground">No Wikipedia link listed</span>}<ExtLink href={r.mapUrl}>OpenStreetMap</ExtLink>{r.countryName && <span className="text-muted-foreground">{r.countryName}</span>}</div>
      <div><h3 className="mb-1 font-display text-base font-bold">Runways</h3>{r.runways.length ? <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-xs"><caption className="sr-only">Runways</caption><thead><tr><th className={th}>Ident</th><th className={th}>Length</th><th className={th}>Width</th><th className={th}>Surface</th><th className={th}>Status</th></tr></thead><tbody>{r.runways.map(w => <tr key={w.ident} className="border-t border-border/60 font-mono"><td className="py-2 pr-4 font-bold">{w.ident}</td><td className="pr-4">{w.lengthFt == null ? 'n/r' : `${w.lengthFt.toLocaleString()} ft`}</td><td className="pr-4">{w.widthFt == null ? 'n/r' : `${w.widthFt} ft`}</td><td className="pr-4">{w.surface ?? 'n/r'}</td><td>{w.closed ? 'Closed' : 'Open'}{w.lighted ? ', lit' : ', unlit'}</td></tr>)}</tbody></table></div> : <p role="status" className="text-xs text-muted-foreground">No runway records returned.</p>}</div>
      <div><h3 className="mb-1 font-display text-base font-bold">Frequencies</h3>{r.frequencies.length ? <ul className="grid gap-x-6 sm:grid-cols-2">{r.frequencies.map((f, i) => <li key={i} className="flex justify-between gap-3 border-t border-border/60 py-2 text-xs"><span className="min-w-0"><b>{f.type}</b> <span className="text-muted-foreground">{f.description}</span></span><span className="font-mono">{f.mhz} MHz</span></li>)}</ul> : <p role="status" className="text-xs text-muted-foreground">No frequency records returned.</p>}</div>
      <div><h3 className="mb-1 font-display text-base font-bold">Navaids</h3>{r.navaids.length ? <ul className="grid gap-x-6 sm:grid-cols-2">{r.navaids.map((n, i) => <li key={`${n.ident}-${i}`} className="flex justify-between gap-3 border-t border-border/60 py-2 text-xs"><span className="min-w-0"><b className="font-mono">{n.ident}</b> {n.name} <span className="text-muted-foreground">{n.type}</span></span><span className="font-mono">{n.frequencyKhz == null ? 'n/r' : `${n.frequencyKhz} kHz`}</span></li>)}</ul> : <p role="status" className="text-xs text-muted-foreground">No navaid records returned.</p>}</div>
      <p className="border-t border-border/70 pt-3 text-[10px] text-muted-foreground">n/r = not reported. Source: {r.source} · <Stamp label="Retrieved" value={r.fetchedAt} /></p>
    </div>}
  </section>;
}
