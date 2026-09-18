import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useListCategories, useListPosts } from '@workspace/api-client-react';
import { categoryHref, EmptyState, LoadingBlocks, PageShell, PostCard } from '@/components/journal-ui';

export default function CategoryPage() {
  const { category = '' } = useParams<{ category: string }>();
  const decoded = decodeURIComponent(category);
  const postsQuery = useListPosts({ category: decoded === 'All' ? undefined : decoded });
  const categoriesQuery = useListCategories();
  const posts = postsQuery.data ?? [];

  return (
    <PageShell>
      <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 lg:px-10 lg:pt-20">
        <Link href="/" data-testid="link-category-back" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground transition hover:text-primary"><ArrowLeft size={14} /> Back to the journal</Link>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="reveal"><p className="font-mono text-[10px] uppercase tracking-[.22em] text-primary">Category / {decoded}</p><h1 data-testid="text-category-title" className="mt-4 font-display text-[clamp(4rem,9vw,8.5rem)] leading-[.82] tracking-[-.06em]">{decoded}</h1></div>
          <p className="reveal reveal-2 max-w-sm text-lg leading-7 text-muted-foreground">A considered edit of spaces, objects, and small moves for {decoded.toLowerCase()} with a little more character.</p>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-2 border-y border-border py-4">
          <SlidersHorizontal size={15} className="mr-2 text-primary" />
          <span className="mr-3 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Explore:</span>
          {categoriesQuery.data?.map((item) => <Link key={item.name} href={categoryHref(item.name)} data-testid={`link-category-filter-${item.name}`} className={`border px-3 py-2 text-xs transition ${item.name === decoded ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary hover:text-primary'}`}>{item.name}</Link>)}
        </div>
        {postsQuery.isLoading ? <div className="mt-12"><LoadingBlocks count={3} /></div> : posts.length ? <div className="mt-12 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{posts.map((post, index) => <div key={post.id} className={`reveal reveal-${Math.min(index + 1, 4)}`}><PostCard post={post} /></div>)}</div> : <div className="mt-12"><EmptyState title="A quiet corner" body={`We haven't filed any stories under ${decoded} yet. Try another category or return to the journal.`} /></div>}
      </main>
    </PageShell>
  );
}