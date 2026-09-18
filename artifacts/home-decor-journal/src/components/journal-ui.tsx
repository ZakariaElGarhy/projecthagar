import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUpRight, BookOpen, ChevronRight, Moon, Search, Sun } from 'lucide-react';

import type { Category, Post } from '@workspace/api-client-react';

const makeEditorialImage = (background: string, foreground: string, detail: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="${background}"/><rect x="80" y="110" width="1040" height="600" fill="${foreground}" opacity=".18"/><path d="M160 710V280h330v430M160 340h330M680 710V190h300v520M680 500h300" fill="none" stroke="${foreground}" stroke-width="18" opacity=".75"/><circle cx="850" cy="350" r="110" fill="${foreground}" opacity=".3"/><path d="M0 760h1200" stroke="${foreground}" stroke-width="24" opacity=".5"/><text x="90" y="820" fill="${foreground}" font-family="Georgia,serif" font-size="48" opacity=".82">${detail}</text></svg>`)}`;

export const fallbackImages = [
  makeEditorialImage('#d76b52', '#f1e5c7', 'quiet / warm / useful'),
  makeEditorialImage('#285c5b', '#f5cf4c', 'light finds its way in'),
  makeEditorialImage('#d2a238', '#193d45', 'a little off-center'),
  makeEditorialImage('#7d8791', '#f2ddc5', 'objects with a history'),
];

export function categoryHref(category: string) {
  return `/category/${encodeURIComponent(category)}`;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('home-decor-theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = stored ? stored === 'dark' : prefers;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('home-decor-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="button-toggle-theme"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[.16em] transition hover:bg-secondary hover:text-secondary-foreground ${compact ? 'px-2' : ''}`}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
      {!compact && <span className="hidden sm:inline">{dark ? 'Daylight' : 'After dark'}</span>}
    </button>
  );
}

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" data-testid="link-brand" className={`group flex items-center gap-3 ${light ? 'text-sidebar-foreground' : ''}`}>
      <span className="relative flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground transition-transform group-hover:rotate-6">
        <span className="font-display text-xl leading-none">H</span>
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-accent" />
      </span>
      <span className="font-display text-xl leading-none tracking-tight">Home Decor<br /><i className="not-italic text-primary">Journal</i></span>
    </Link>
  );
}

export function SiteHeader() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = search.trim();
    setLocation(value ? `/?search=${encodeURIComponent(value)}` : '/');
  };

  return (
    <header className="relative z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[.18em] md:flex">
          <Link href="/" data-testid="link-nav-home" className={`${location === '/' ? 'text-primary' : 'text-muted-foreground'} transition hover:text-primary`}>Journal</Link>
          <Link href={categoryHref('Living Rooms')} data-testid="link-nav-living-rooms" className="text-muted-foreground transition hover:text-primary">Rooms</Link>
          <Link href={categoryHref('Small Spaces')} data-testid="link-nav-small-spaces" className="text-muted-foreground transition hover:text-primary">Small spaces</Link>
          <Link href="/materials" data-testid="link-nav-materials" className="text-muted-foreground transition hover:text-primary">Materials</Link>
        </nav>
        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden items-center border-b border-border px-1 py-1 sm:flex">
            <Search size={15} className="text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="input-site-search"
              aria-label="Search journal"
              placeholder="Search the journal"
              className="w-32 bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground/70 focus:w-44 transition-all"
            />
          </form>
          <ThemeToggle compact />
          <Link href="/login" data-testid="link-admin-login" className="hidden border border-secondary bg-secondary px-3 py-2 text-xs font-bold uppercase tracking-[.15em] text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground sm:inline-flex">Publish</Link>
        </div>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="paper-grain min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      {children}
      <footer className="mt-24 border-t border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
          <div>
            <BrandMark light />
            <p className="mt-5 max-w-xs text-sm leading-6 text-secondary-foreground/70">Rooms with a point of view, products worth living with, and the small decisions that make a home feel like yours.</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">Explore</p>
            <div className="mt-4 grid gap-2 text-sm text-secondary-foreground/80">
              <Link href="/" data-testid="link-footer-journal" className="hover:text-accent">The journal</Link>
              <Link href={categoryHref('Living Rooms')} data-testid="link-footer-living" className="hover:text-accent">Living rooms</Link>
              <Link href={categoryHref('Small Spaces')} data-testid="link-footer-small-spaces" className="hover:text-accent">Small spaces</Link>
              <Link href="/materials" data-testid="link-footer-materials" className="hover:text-accent">Materials</Link>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">A note from us</p>
            <p className="mt-4 text-sm leading-6 text-secondary-foreground/80">No perfect homes here. Just thoughtful ones.</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-secondary-foreground/50">Issue 04 · Made for living</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const image = post.cover_image || fallbackImages[post.id % fallbackImages.length];
  return (
    <Link
      href={`/post/${post.slug}`}
      data-testid={`card-post-${post.id}`}
      className={`group block ${featured ? 'md:col-span-2' : ''}`}
    >
      <article className={`image-zoom relative overflow-hidden bg-muted ${featured ? 'grid min-h-[430px] md:grid-cols-[1.25fr_.75fr]' : ''}`}>
        <div className={`relative overflow-hidden ${featured ? 'min-h-[280px]' : 'aspect-[4/3]'}`}>
          <img src={image} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-70" />
          <span className="absolute left-4 top-4 bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-accent-foreground">{post.category}</span>
          <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={16} /></span>
        </div>
        <div className={`flex flex-col justify-end bg-secondary p-6 text-secondary-foreground ${featured ? 'md:p-9' : 'min-h-[160px]'}`}>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-accent">Field note · {new Date(post.created_at).getFullYear() || '2024'}</p>
          <h3 className={`mt-3 font-display leading-[.98] ${featured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>{post.title}</h3>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-secondary-foreground/70">{post.intro_text}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-accent">Read the room <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
        </div>
      </article>
    </Link>
  );
}

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <Link href={categoryHref(category.name)} data-testid={`card-category-${index}`} className="group relative min-h-[220px] overflow-hidden bg-secondary text-secondary-foreground">
      <img src={category.image || fallbackImages[index % fallbackImages.length]} alt={category.name} className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply transition duration-500 group-hover:scale-105 group-hover:opacity-75 dark:mix-blend-normal" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-3xl">{category.name}</h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[.17em] text-accent">{category.count} {category.count === 1 ? 'story' : 'stories'}</p>
      </div>
    </Link>
  );
}

export function LoadingBlocks({ count = 3 }: { count?: number }) {
  return <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: count }).map((_, index) => <div key={index} className="animate-pulse"><div className="aspect-[4/3] bg-muted" /><div className="mt-3 h-5 w-4/5 bg-muted" /><div className="mt-2 h-3 w-2/5 bg-muted" /></div>)}</div>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-border bg-card px-6 py-16 text-center">
      <BookOpen className="mx-auto text-primary" size={28} strokeWidth={1.4} />
      <h2 className="mt-4 font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}