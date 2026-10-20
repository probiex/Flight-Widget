import { type FormEvent, useState } from 'react';
import { getGetExchangeRateQueryKey, useGetExchangeRate, useListCurrencies } from '@workspace/api-client-react';
import { ArrowDownUp } from 'lucide-react';
import { Eyebrow, Failure, Skeleton, Stamp, useMeta } from '@/components/common';

type Submitted = { base: string; quote: string; amount: number };

export default function ToolsPage() {
  useMeta('Travel tools', 'Currency converter using published reference exchange rates. Not a retail or bank quote.');
  const currencies = useListCurrencies();
  const [amount, setAmount] = useState('');
  const [base, setBase] = useState('');
  const [quote, setQuote] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const params = { base: submitted?.base ?? '', quote: submitted?.quote ?? '' };
  const rate = useGetExchangeRate(params, { query: { enabled: !!submitted, queryKey: getGetExchangeRateQueryKey(params) } });
  const list = currencies.data?.currencies ?? [];

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(n) || n < 0) return setError('Enter an amount that is a number and zero or greater.');
    if (n > 1_000_000_000_000) return setError('Enter an amount no greater than one trillion.');
    if (!base || !quote) return setError('Choose both currencies.');
    if (base === quote) return setError('Choose two different currencies.');
    setError('');
    setSubmitted({ base, quote, amount: n });
  }
  const r = rate.data;
  const sel = 'focus-ring w-full rounded-xl border border-border bg-background px-3 py-3 text-sm';
  return <div className="page-enter">
    <Eyebrow>Tools / 04</Eyebrow>
    <h1 className="font-display text-[42px] font-extrabold tracking-[-.065em] sm:text-[54px]">Travel tools<span className="text-accent">.</span></h1>
    <section aria-labelledby="fx-title" className="mt-8 max-w-[760px] rounded-2xl border border-border bg-card p-5 sm:p-7">
      <h2 id="fx-title" className="font-display text-2xl font-bold tracking-[-.04em]">Currency converter</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">Uses a published reference rate. It is not a retail, card or bureau quote; what you are charged will differ.</p>
      {currencies.isLoading ? <Skeleton rows={2} h={52} /> : currencies.isError ? <div className="mt-4"><Failure title="The currency list could not be loaded." retry={() => currencies.refetch()} /></div> : !list.length ? <p role="status" className="mt-4 text-sm">The provider returned no currencies.</p> :
        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-end" noValidate>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Amount<input data-testid="input-fx-amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className={`${sel} mt-1 font-mono`} /></label>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">From<select data-testid="select-fx-base" value={base} onChange={e => setBase(e.target.value)} className={`${sel} mt-1`}><option value="">Choose</option>{list.map(c => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}</select></label>
          <button type="button" aria-label="Swap currencies" onClick={() => { setBase(quote); setQuote(base); }} className="focus-ring mx-auto grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"><ArrowDownUp size={14} /></button>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">To<select data-testid="select-fx-quote" value={quote} onChange={e => setQuote(e.target.value)} className={`${sel} mt-1`}><option value="">Choose</option>{list.map(c => <option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}</select></label>
          <button type="submit" data-testid="button-fx-convert" className="focus-ring h-12 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground sm:col-span-4">Convert</button>
        </form>}
      {error && <p role="alert" data-testid="text-fx-error" className="mt-3 text-sm font-semibold text-accent">{error}</p>}
      <div className="mt-5" aria-live="polite">
        {submitted && (rate.isLoading ? <Skeleton rows={1} h={96} /> : rate.isError ? <Failure title="No reference rate could be retrieved for this pair." retry={() => rate.refetch()} /> : r && Number.isFinite(r.rate) ? <div data-testid="result-fx" className="rounded-xl bg-[#183f3b] p-5 text-[#f8f5ec]">
          <div className="font-mono text-xs text-[#e5ede6]/70">{submitted.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {r.base}</div>
          <div className="mt-1 break-words font-display text-[34px] font-extrabold tracking-[-.05em]">{(submitted.amount * r.rate).toLocaleString(undefined, { maximumFractionDigits: 4 })} {r.quote}</div>
          <p className="mt-2 font-mono text-[11px] text-[#e5ede6]/75">1 {r.base} = {r.rate} {r.quote} · Reference rate dated {r.date}</p>
          <p className="mt-2 text-[10px] text-[#e5ede6]/60">Source: {r.source} · <Stamp label="Retrieved" value={r.fetchedAt} /> · Not a retail quote.</p>
        </div> : <Failure title="The provider returned an unusable rate." retry={() => rate.refetch()} />)}
      </div>
      {currencies.data && <p className="mt-4 text-[10px] text-muted-foreground">Currency list: {currencies.data.source} · <Stamp label="Retrieved" value={currencies.data.fetchedAt} /></p>}
    </section>
  </div>;
}
