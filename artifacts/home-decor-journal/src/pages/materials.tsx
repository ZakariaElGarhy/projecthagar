import { useMemo } from 'react';
import { ArrowUpRight, ExternalLink, Layers3 } from 'lucide-react';
import { useListPosts } from '@workspace/api-client-react';
import { EmptyState, fallbackImages, LoadingBlocks, PageShell } from '@/components/journal-ui';

export default function MaterialsPage() {
  const postsQuery = useListPosts();
  const materials = useMemo(() => {
    const grouped = new Map<string, Array<{ name: string; image: string; description: string; amazon_link: string; postTitle: string }>>();
    for (const post of postsQuery.data ?? []) {
      for (const product of post.products) {
        const material = product.material || 'Mixed materials';
        const items = grouped.get(material) ?? [];
        if (!items.some((item) => item.amazon_link === product.amazon_link && item.name === product.name)) {
          items.push({ ...product, postTitle: post.title });
        }
        grouped.set(material, items);
      }
    }
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [postsQuery.data]);

  return (
    <PageShell>
      <main className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 lg:px-10 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="reveal">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-primary">The material index</p>
            <h1 data-testid="text-materials-title" className="mt-5 max-w-4xl font-display text-[clamp(4rem,9vw,8.5rem)] leading-[.82] tracking-[-.06em]">What a room is made of.</h1>
          </div>
          <div className="reveal reveal-2">
            <p className="text-lg leading-7 text-muted-foreground">Wood, wool, steel, and the real pieces that use them well. Browse the materials behind the journal and shop the products attached to each story.</p>
            <div className="mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-primary"><Layers3 size={15} /> Real products · source links</div>
          </div>
        </div>

        {postsQuery.isLoading ? (
          <div className="mt-16"><LoadingBlocks count={3} /></div>
        ) : materials.length ? (
          <div className="mt-16 space-y-16">
            {materials.map(([material, products], materialIndex) => (
              <section key={material} data-testid={`section-material-${materialIndex}`}>
                <div className="mb-7 flex items-end justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Material {String(materialIndex + 1).padStart(2, '0')}</p>
                    <h2 data-testid={`text-material-name-${materialIndex}`} className="mt-2 font-display text-4xl md:text-5xl">{material}</h2>
                  </div>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">{products.length} {products.length === 1 ? 'find' : 'finds'}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, productIndex) => (
                    <article key={`${product.name}-${productIndex}`} data-testid={`card-material-product-${materialIndex}-${productIndex}`} className="group border border-border bg-card p-3 transition hover:border-primary">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img src={product.image || fallbackImages[productIndex % fallbackImages.length]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-foreground">From the journal</span>
                      </div>
                      <div className="p-3 pb-1">
                        <p className="font-mono text-[9px] uppercase tracking-[.14em] text-primary">{product.postTitle}</p>
                        <h3 className="mt-2 font-display text-2xl leading-tight">{product.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
                        <a href={product.amazon_link} target="_blank" rel="noreferrer" data-testid={`link-material-shop-${materialIndex}-${productIndex}`} className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-primary transition hover:text-foreground">Shop this piece <ExternalLink size={13} /></a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-16"><EmptyState title="The index is still empty" body="As stories gather, their materials and shopping links will be collected here." /></div>
        )}

        <div className="mt-20 border-l-4 border-primary bg-muted px-6 py-8 md:px-10">
          <p className="font-display text-3xl leading-tight">The best rooms are not made from one look. They are made from materials that age well, objects that earn their place, and links you can actually follow.</p>
          <a href="https://www.ikea.com/us/en/" target="_blank" rel="noreferrer" data-testid="link-materials-source" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-primary">Visit the source shop <ArrowUpRight size={14} /></a>
        </div>
      </main>
    </PageShell>
  );
}