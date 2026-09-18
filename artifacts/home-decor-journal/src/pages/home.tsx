import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useListCategories, useListPosts } from '@workspace/api-client-react';
import { CategoryCard, EmptyState, LoadingBlocks, PageShell, PostCard } from '@/components/journal-ui';

export default function HomePage() {
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') ?? '');
  const [activeSearch, setActiveSearch] = useState(() => new URLSearchParams(window.location.search).get('search') ?? '');
  useEffect(() => {
    const syncSearch = () => {
      const value = new URLSearchParams(window.location.search).get('search') ?? '';
      setSearch(value);
      setActiveSearch(value);
    };
    window.addEventListener('popstate', syncSearch);
    return () => window.removeEventListener('popstate', syncSearch);
  }, []);
  const postsQuery = useListPosts(activeSearch ? { search: activeSearch } : undefined);
  const featuredQuery = useListPosts({ featured: true });
  const categoriesQuery = useListCategories();
  const posts = postsQuery.data ?? [];
  const featured = featuredQuery.data?.[0] ?? posts[0];
  const recent = posts.filter((post) => post.id !== featured?.id).slice(0, 6);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSearch(search.trim());
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    window.history.replaceState({}, '', `/${query}`);
  };

  return (
    <PageShell>
      <main>
        <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div className="reveal">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-primary">A photo-led home journal · Issue 04</p>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(4.2rem,10vw,9.8rem)] leading-[.82] tracking-[-.06em]">Make room<br /><i className="ml-[.55em] text-primary">for living.</i></h1>
            </div>
            <div className="reveal reveal-2 max-w-md justify-self-end lg:pb-2">
              <p className="text-lg leading-7 text-muted-foreground">Practical, beautiful ideas for the rooms you actually use. Find the odd lamp, the perfect blue, and a little more ease at home.</p>
              <div className="mt-7 flex items-center gap-4">
                <span className="h-px w-12 bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Read slowly. Save freely.</span>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-6 border-t border-border pt-6 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-wrap items-center gap-3">
              <Sparkles size={16} className="text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Currently considering</span>
              {categoriesQuery.data?.slice(0, 3).map((category) => <Link key={category.name} href={`/category/${category.name}`} data-testid={`link-featured-category-${category.name}`} className="border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary">{category.name}</Link>)}
            </div>
            <form onSubmit={submitSearch} className="flex items-center border-b border-foreground pb-2">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-home-search" placeholder="Search by room, mood, object..." className="w-full min-w-[210px] bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground" />
              <button type="submit" data-testid="button-search-home" className="font-mono text-[10px] uppercase tracking-[.16em] text-primary transition hover:text-foreground">Go</button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">The cover story</p><h2 className="mt-2 font-display text-4xl">A room worth lingering in</h2></div>
            <span className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">01 / featured</span>
          </div>
          {featuredQuery.isLoading || postsQuery.isLoading ? <LoadingBlocks count={1} /> : featured ? <div className="reveal reveal-1"><PostCard post={featured} featured /></div> : <EmptyState title="The journal is warming up" body="There are no featured stories yet. Check back soon for a fresh room to wander through." />}
        </section>

        <section className="mx-auto mt-24 max-w-[1440px] px-5 lg:px-10">
          <div className="mb-7 flex items-end justify-between border-b border-border pb-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Browse by feeling</p><h2 className="mt-2 font-display text-4xl">Rooms, moods, corners</h2></div>
            <ArrowRight className="text-primary" size={20} />
          </div>
          {categoriesQuery.isLoading ? <LoadingBlocks count={3} /> : categoriesQuery.data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categoriesQuery.data.slice(0, 4).map((category, index) => <CategoryCard key={category.name} category={category} index={index} />)}</div> : <EmptyState title="No categories yet" body="As new stories arrive, they will gather here by room and point of view." />}
        </section>

        <section className="mx-auto mt-24 max-w-[1440px] px-5 lg:px-10">
          <div className="mb-7 flex items-end justify-between border-b border-border pb-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">From the latest issue</p><h2 className="mt-2 font-display text-4xl">More to bring home</h2></div>
            <Link href="/category/All" data-testid="link-all-stories" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-primary sm:flex">All stories <ArrowRight size={15} /></Link>
          </div>
          {postsQuery.isLoading ? <LoadingBlocks count={3} /> : recent.length ? <div className="grid gap-x-5 gap-y-10 md:grid-cols-3">{recent.map((post, index) => <div key={post.id} className={`reveal reveal-${Math.min(index + 1, 4)}`}><PostCard post={post} /></div>)}</div> : <EmptyState title={activeSearch ? `Nothing matched “${activeSearch}”` : 'No other stories yet'} body={activeSearch ? 'Try a room, color, or object instead.' : 'The next stories are being photographed now.'} />}
        </section>
      </main>
    </PageShell>
  );
}