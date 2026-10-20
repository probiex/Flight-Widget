import { useMemo, useState } from 'react';
import { useListDataSources } from '@workspace/api-client-react';
import { Search, X } from 'lucide-react';
import { Eyebrow, ExtLink, Failure, Skeleton, useMeta } from '@/components/common';

const STATUSES = ['integrated', 'link-only', 'planned', 'restricted'] as const;
const STYLE: Record<string, string> = {
  integrated: 'bg-primary text-primary-foreground',
  'link-only': 'border border-primary text-primary',
  planned: 'border border-dashed border-muted-foreground text-muted-foreground',
  restricted: 'bg-accent text-accent-foreground',
};
const DESC: Record<string, string> = { integrated: 'Data is fetched and shown in Flightlo', 'link-only': 'Linked out, not ingested', planned: 'Not available yet', restricted: 'Terms limit use' };

export default function SourcesPage() {
  useMeta('Data source registry', 'Every external data source Flightlo reviews, with license, commercial-use terms, limitations, refresh cadence and status.');
  const query = useListDataSources();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const data = query.data;
  const categories = useMemo(() => Array.from(new Set((data?.sources ?? []).map(s => s.category))).sort(), [data]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (data?.sources ?? []).filter(s => (status === 'all' || s.status === status) && (category === 'all' || s.category === category) && (!n || [s.name, s.category, s.license, s.coverage, s.usage, s.limitations, s.id].some(v => v.toLowerCase().includes(n))));
  }, [data, q, status, category]);
  const sel = 'focus-ring rounded-xl border border-border bg-card px-3 py-3 text-sm';
  return <div className="page-enter">
    <Eyebrow>Reference / 03</Eyebrow>
    <h1 className="font-display text-[42px] font-extrabold tracking-[-.065em] sm:text-[54px]">Source registry<span className="text-accent">.</span></h1>
    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Where every record comes from, what the license allows and where it falls short. Status tells you whether a source is actually wired in.</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STATUSES.map(s => <div key={s} className="rounded-xl border border-border bg-card p-3"><span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STYLE[s]}`}>{s}</span><p className="mt-2 text-xs text-muted-foreground">{DESC[s]}</p></div>)}</div>
    <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary/60"><Search size={17} className="shrink-0 text-muted-foreground" /><input type="search" aria-label="Search sources" data-testid="input-source-search" placeholder="Search name, license, coverage" value={q} onChange={e => setQ(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />{q && <button type="button" aria-label="Clear source search" onClick={() => setQ('')} className="focus-ring rounded p-1"><X size={15} /></button>}</div>
      <select aria-label="Filter by status" data-testid="select-source-status" value={status} onChange={e => setStatus(e.target.value)} className={sel}><option value="all">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
      <select aria-label="Filter by category" data-testid="select-source-category" value={category} onChange={e => setCategory(e.target.value)} className={sel}><option value="all">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
    </div>
    <div className="mt-6">
      {query.isLoading ? <Skeleton h={160} /> : query.isError ? <Failure title="The source registry could not be loaded." retry={() => query.refetch()} /> : data ? <>
        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{shown.length} of {data.sources.length} sources shown · Registry reviewed {new Date(data.reviewedAt).toLocaleDateString([], { dateStyle: 'long' })}</p>
        {shown.length ? <ul className="space-y-4">{shown.map(s => <li key={s.id} data-testid={`card-source-${s.id}`} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{s.category}</div><h2 className="font-display text-xl font-bold tracking-[-.03em]">{s.name}</h2></div><span data-testid={`status-source-${s.id}`} className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STYLE[s.status] ?? ''}`}>{s.status}</span></div>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
            {([['License', s.license], ['Commercial use', s.commercialUse], ['Coverage', s.coverage], ['Refresh', s.refresh], ['How Flightlo uses it', s.usage], ['Limitations', s.limitations]] as const).map(([k, v]) => <div key={k}><dt className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">{k}</dt><dd className="mt-0.5 leading-5">{v}</dd></div>)}
          </dl>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/70 pt-3 text-xs"><ExtLink href={s.url}>Source: {s.name}</ExtLink><ExtLink href={s.termsUrl}>Terms of use</ExtLink><span className="text-muted-foreground">Reviewed {new Date(data.reviewedAt).toLocaleDateString([], { dateStyle: 'medium' })}</span></div>
        </li>)}</ul> : <div role="status" className="rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-12 text-center"><p className="text-sm font-semibold">{data.sources.length ? 'No sources match these filters' : 'The registry returned no sources'}</p>{data.sources.length > 0 && <button type="button" onClick={() => { setQ(''); setStatus('all'); setCategory('all'); }} className="focus-ring mt-2 text-xs font-bold text-primary underline">Reset filters</button>}</div>}
      </> : null}
    </div>
  </div>;
}
