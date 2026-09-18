import { ArrowLeft, ExternalLink, Heart, Share2 } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getGetPostBySlugQueryKey, useGetPostBySlug, useListPosts } from '@workspace/api-client-react';
import { EmptyState, LoadingBlocks, PageShell, PostCard, fallbackImages } from '@/components/journal-ui';

export default function PostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const postQuery = useGetPostBySlug(slug, { query: { queryKey: getGetPostBySlugQueryKey(slug) } });
  const relatedQuery = useListPosts({ category: postQuery.data?.category });
  const post = postQuery.data;

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
  };

  if (postQuery.isLoading) return <PageShell><main className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10"><LoadingBlocks count={1} /></main></PageShell>;
  if (postQuery.isError || !post) return <PageShell><main className="mx-auto max-w-[720px] px-5 py-24 lg:px-10"><EmptyState title="We lost the thread" body="That story may have moved, or it may still be in the notebook. Head back and try another room." /><Link href="/" data-testid="link-post-error-home" className="mx-auto mt-6 flex w-fit border border-secondary bg-secondary px-4 py-3 text-xs font-bold uppercase tracking-[.15em] text-secondary-foreground">Back to the journal</Link></main></PageShell>;

  const image = post.cover_image || fallbackImages[post.id % fallbackImages.length];
  return (
    <PageShell>
      <main>
        <section className="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-16">
          <Link href="/" data-testid="link-post-back" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground transition hover:text-primary"><ArrowLeft size={14} /> All stories</Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div className="reveal">
              <p className="font-mono text-[10px] uppercase tracking-[.22em] text-primary">{post.category} · field note</p>
              <h1 data-testid="text-post-title" className="mt-5 font-display text-[clamp(3.8rem,7vw,7.4rem)] leading-[.84] tracking-[-.06em]">{post.title}</h1>
              <p className="mt-7 max-w-lg text-xl leading-8 text-muted-foreground">{post.intro_text}</p>
              <div className="mt-8 flex items-center gap-2">
                <button type="button" onClick={copyLink} data-testid="button-share-post" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-bold uppercase tracking-[.13em] transition hover:border-primary hover:text-primary"><Share2 size={14} /> Share</button>
                <button type="button" onClick={() => window.alert('Saved to your reading list.')} data-testid="button-save-post" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-bold uppercase tracking-[.13em] transition hover:border-primary hover:text-primary"><Heart size={14} /> Save room</button>
              </div>
            </div>
            <div className="image-zoom reveal reveal-2 relative aspect-[4/3] overflow-hidden bg-muted"><img src={image} alt={post.title} className="h-full w-full object-cover" /><span className="absolute bottom-4 left-4 bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.18em]">A lived-in study</span></div>
          </div>
        </section>
        <section className="mx-auto mt-16 max-w-[980px] px-5 lg:mt-24 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
            <aside className="lg:pt-2"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">In this room</p><div className="mt-4 h-px w-12 bg-primary" /><p className="mt-4 text-sm text-muted-foreground">{post.products.length} considered finds</p></aside>
            <div>
              <p className="font-display text-3xl leading-tight md:text-4xl">The point isn't perfection. It's knowing which details make a room feel more like the people who live there.</p>
              <div className="prose prose-lg mt-8 max-w-none text-muted-foreground dark:prose-invert"><p>{post.intro_text}</p></div>
            </div>
          </div>
        </section>
        <section className="mx-auto mt-20 max-w-[980px] px-5 lg:px-10">
          <div className="mb-8 border-b border-border pb-4"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">The considered edit</p><h2 className="mt-2 font-display text-4xl">Shop the feeling</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {post.products.map((product, index) => <article key={`${product.name}-${index}`} data-testid={`card-product-${index}`} className="group grid grid-cols-[112px_1fr] gap-4 border border-border bg-card p-3 transition hover:border-primary">
              <div className="overflow-hidden bg-muted"><img src={product.image || fallbackImages[index % fallbackImages.length]} alt={product.name} className="h-28 w-full object-cover transition group-hover:scale-105" /></div>
              <div className="flex min-w-0 flex-col justify-between py-1"><div><h3 data-testid={`text-product-name-${index}`} className="font-display text-xl leading-tight">{product.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p></div><a href={product.amazon_link} target="_blank" rel="noreferrer" data-testid={`link-product-shop-${index}`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.14em] text-primary">See the source <ExternalLink size={12} /></a></div>
            </article>)}
          </div>
        </section>
        <section className="mx-auto mt-20 max-w-[980px] px-5 lg:px-10">
          <div className="border-l-4 border-primary bg-muted px-6 py-8 md:px-10"><p className="font-display text-3xl leading-tight">{post.conclusion_text}</p></div>
        </section>
        {relatedQuery.data?.filter((item) => item.id !== post.id).slice(0, 3).length ? <section className="mx-auto mt-24 max-w-[1440px] px-5 pb-24 lg:px-10"><div className="mb-7 border-b border-border pb-4"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">Keep wandering</p><h2 className="mt-2 font-display text-4xl">More from {post.category}</h2></div><div className="grid gap-5 md:grid-cols-3">{relatedQuery.data.filter((item) => item.id !== post.id).slice(0, 3).map((item) => <PostCard key={item.id} post={item} />)}</div></section> : null}
      </main>
    </PageShell>
  );
}