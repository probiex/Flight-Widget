import { type ReactNode, useEffect } from 'react';
import { Globe2 } from 'lucide-react';

export function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} — Flightlo`;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
    tag.setAttribute('content', description);
    for (const [attr, key, value] of [
      ['property', 'og:title', `${title} — Flightlo`],
      ['property', 'og:description', description],
      ['name', 'twitter:title', `${title} — Flightlo`],
      ['name', 'twitter:description', description],
    ]) {
      let social = document.querySelector(`meta[${attr}="${key}"]`);
      if (!social) { social = document.createElement('meta'); social.setAttribute(attr, key); document.head.appendChild(social); }
      social.setAttribute('content', value);
    }
  }, [title, description]);
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary"><span className="h-px w-5 bg-accent" />{children}</div>;
}

export function Skeleton({ rows = 3, h = 67 }: { rows?: number; h?: number }) {
  return <div aria-label="Loading" role="status" className="space-y-3 py-2">{Array.from({ length: rows }, (_, i) => <div key={i} style={{ height: h }} className="animate-pulse rounded-xl bg-muted/80" />)}</div>;
}

export function Failure({ title, retry }: { title: string; retry?: () => void }) {
  return <div role="alert" className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
    <div className="flex items-start gap-3"><div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Globe2 size={16} /></div><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Nothing has been substituted. Missing data is not a statement that conditions are fine.</p>{retry && <button type="button" onClick={retry} className="focus-ring mt-3 rounded-md text-xs font-bold text-primary underline underline-offset-4">Try again</button>}</div></div>
  </div>;
}

export function Stamp({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  const d = new Date(value);
  return <span>{label} {Number.isNaN(d.getTime()) ? value : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>;
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return <ul role="note" className="mt-3 space-y-1 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs leading-5">{items.map((w, i) => <li key={i}>Warning: {w}</li>)}</ul>;
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  let ok = false;
  try { ok = /^https?:$/.test(new URL(href).protocol); } catch { ok = false; }
  if (!ok) return <span className="text-muted-foreground">{children} (invalid link)</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="focus-ring break-words rounded font-semibold text-primary underline underline-offset-4">{children}<span className="sr-only"> (opens in new tab)</span></a>;
}
