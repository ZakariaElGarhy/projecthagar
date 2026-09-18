import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ImagePlus, LogOut, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCurrentUserQueryKey,
  getGetDashboardSummaryQueryKey,
  getListCategoriesQueryKey,
  getListPostsQueryKey,
  useCreatePost,
  useDeletePost,
  useGetCurrentUser,
  useGetDashboardSummary,
  useListCategories,
  useListPosts,
  useLogout,
  useUpdatePost,
  type Post,
  type Product,
} from '@workspace/api-client-react';
import { BrandMark, EmptyState, fallbackImages, LoadingBlocks, ThemeToggle } from '@/components/journal-ui';

const blankProduct: Product = { name: '', material: '', image: '', description: '', amazon_link: '' };
const blankPost = { title: '', slug: '', category: '', accent_color: '#e86d54', intro_text: '', cover_image: '', products: [{ ...blankProduct }], conclusion_text: '' };

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const userQuery = useGetCurrentUser();
  const summaryQuery = useGetDashboardSummary({ query: { enabled: !!userQuery.data, queryKey: getGetDashboardSummaryQueryKey() } });
  const postsQuery = useListPosts(undefined, { query: { enabled: !!userQuery.data, queryKey: getListPostsQueryKey() } });
  const categoriesQuery = useListCategories({ query: { enabled: !!userQuery.data, queryKey: getListCategoriesQueryKey() } });
  const createPost = useCreatePost();
  const logout = useLogout();
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(blankPost);
  const [notice, setNotice] = useState('');
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const posts = postsQuery.data ?? [];

  useEffect(() => {
    if (userQuery.isError) setLocation('/login');
  }, [userQuery.isError, setLocation]);

  const openCreate = () => { setEditing(null); setForm({ ...blankPost, products: [{ ...blankProduct }] }); setNotice(''); };
  const openEdit = (post: Post) => { setEditing(post); setForm({ title: post.title, slug: post.slug, category: post.category, accent_color: post.accent_color, intro_text: post.intro_text, cover_image: post.cover_image, products: post.products.length ? post.products : [{ ...blankProduct }], conclusion_text: post.conclusion_text }); setNotice(''); };
  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const updateProduct = (index: number, field: keyof Product, value: string) => setForm((current) => ({ ...current, products: current.products.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const addProduct = () => setForm((current) => ({ ...current, products: [...current.products, { ...blankProduct }] }));
  const removeProduct = (index: number) => setForm((current) => ({ ...current, products: current.products.length > 1 ? current.products.filter((_, itemIndex) => itemIndex !== index) : current.products }));
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    const payload = { ...form, products: form.products.filter((product) => product.name.trim()) };
    if (!payload.products.length) { setNotice('Add at least one product to publish this story.'); return; }
    if (editing) {
      updatePost.mutate({ id: editing.id, data: payload }, { onSuccess: () => { setNotice('Story updated.'); refresh(); setEditing(null); } });
    } else {
      createPost.mutate({ data: payload }, { onSuccess: () => { setNotice('Story published.'); refresh(); setForm({ ...blankPost, products: [{ ...blankProduct }] }); } });
    }
  };

  const confirmDelete = (post: Post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    deletePost.mutate({ id: post.id }, { onSuccess: () => { setNotice('Story removed.'); refresh(); if (editing?.id === post.id) setEditing(null); } });
  };
  const signOut = () => logout.mutate(undefined, { onSuccess: () => { queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() }); setLocation('/'); } });

  if (userQuery.isLoading) return <div className="min-h-[100dvh] bg-secondary p-10"><div className="mx-auto max-w-6xl"><LoadingBlocks count={3} /></div></div>;
  if (!userQuery.data) return null;

  return (
    <div className="paper-grain min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 lg:px-10"><BrandMark light /><div className="flex items-center gap-2"><span data-testid="text-dashboard-username" className="hidden text-xs text-secondary-foreground/70 sm:inline">{userQuery.data.username} · {userQuery.data.role}</span><ThemeToggle compact /><button type="button" onClick={signOut} data-testid="button-dashboard-logout" className="inline-flex items-center gap-2 border border-secondary-foreground/25 px-3 py-2 text-xs font-bold uppercase tracking-[.13em] transition hover:border-accent hover:text-accent"><LogOut size={14} /><span className="hidden sm:inline">Sign out</span></button></div></div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><Link href="/" data-testid="link-dashboard-journal" className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground transition hover:text-primary"><ArrowLeft size={14} /> View journal</Link><p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Publishing desk</p><h1 className="mt-2 font-display text-5xl tracking-[-.04em]">Make the next room.</h1></div><button type="button" onClick={openCreate} data-testid="button-new-post" className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.16em] text-primary-foreground transition hover:bg-secondary hover:text-secondary-foreground"><Plus size={16} /> New story</button></div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">{[{ label: 'Published stories', value: summaryQuery.data?.total_posts ?? posts.length, accent: 'bg-primary' }, { label: 'Active categories', value: summaryQuery.data?.categories ?? categoriesQuery.data?.length ?? 0, accent: 'bg-accent' }, { label: 'Latest note', value: summaryQuery.data?.latest_post?.title ?? '—', accent: 'bg-secondary' }].map((item, index) => <div key={item.label} data-testid={`status-dashboard-${index}`} className="relative overflow-hidden border border-border bg-card p-5"><span className={`absolute inset-y-0 left-0 w-1 ${item.accent}`} /><p className="font-mono text-[10px] uppercase tracking-[.17em] text-muted-foreground">{item.label}</p><p className="mt-3 line-clamp-1 font-display text-3xl">{item.value}</p></div>)}</div>
        {notice && <p data-testid="status-dashboard-notice" className="mt-5 border-l-2 border-primary bg-primary/10 px-4 py-3 text-sm">{notice}</p>}
        <div className="mt-10 grid gap-10 xl:grid-cols-[.85fr_1.15fr]">
          <section className="border border-border bg-card p-5 sm:p-7"><div className="flex items-end justify-between border-b border-border pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">Your archive</p><h2 className="mt-1 font-display text-3xl">Stories</h2></div><span className="font-mono text-[10px] text-muted-foreground">{posts.length} total</span></div>{postsQuery.isLoading ? <div className="mt-6"><LoadingBlocks count={2} /></div> : posts.length ? <div className="mt-4 divide-y divide-border">{posts.map((post) => <article key={post.id} data-testid={`row-post-${post.id}`} className="group flex gap-3 py-4"><img src={post.cover_image || fallbackImages[post.id % fallbackImages.length]} alt="" className="h-16 w-20 object-cover" /><div className="min-w-0 flex-1"><p className="font-mono text-[9px] uppercase tracking-[.16em] text-primary">{post.category}</p><h3 className="mt-1 truncate font-display text-xl">{post.title}</h3><p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100"><button type="button" onClick={() => openEdit(post)} data-testid={`button-edit-post-${post.id}`} aria-label={`Edit ${post.title}`} className="p-2 transition hover:bg-muted hover:text-primary"><Pencil size={15} /></button><button type="button" onClick={() => confirmDelete(post)} data-testid={`button-delete-post-${post.id}`} aria-label={`Delete ${post.title}`} className="p-2 transition hover:bg-muted hover:text-destructive"><Trash2 size={15} /></button></div></article>)}</div> : <div className="mt-5"><EmptyState title="A blank shelf" body="Your published stories will gather here. Start with the room you keep thinking about." /></div>}</section>
          <section className="border border-border bg-card p-5 sm:p-7"><div className="flex items-end justify-between border-b border-border pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">{editing ? 'Edit story' : 'New story'}</p><h2 className="mt-1 font-display text-3xl">{editing ? 'Refine the room' : 'Put it on paper'}</h2></div>{editing && <button type="button" onClick={openCreate} data-testid="button-cancel-edit" className="inline-flex items-center gap-1 text-xs uppercase tracking-[.12em] text-muted-foreground hover:text-primary"><X size={15} /> Clear</button>}</div>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <label className="block"><span className="field-label">Title</span><input required value={form.title} onChange={(event) => updateField('title', event.target.value)} data-testid="input-post-title" className="field-input font-display text-xl" placeholder="A room with somewhere to go" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="field-label">Slug</span><input required value={form.slug} onChange={(event) => updateField('slug', event.target.value)} data-testid="input-post-slug" className="field-input" placeholder="room-with-somewhere-to-go" /></label><label className="block"><span className="field-label">Category</span><input required value={form.category} onChange={(event) => updateField('category', event.target.value)} data-testid="input-post-category" className="field-input" placeholder="Living Rooms" /></label></div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><label className="block"><span className="field-label">Cover image URL</span><div className="relative"><ImagePlus size={15} className="absolute left-3 top-3 text-muted-foreground" /><input required value={form.cover_image} onChange={(event) => updateField('cover_image', event.target.value)} data-testid="input-post-cover-image" className="field-input pl-9" placeholder="https://..." /></div></label><label className="block"><span className="field-label">Accent</span><input type="color" value={form.accent_color} onChange={(event) => updateField('accent_color', event.target.value)} data-testid="input-post-accent" className="mt-2 h-10 w-16 cursor-pointer border border-border bg-transparent p-1" /></label></div>
              <label className="block"><span className="field-label">Intro</span><textarea required rows={3} value={form.intro_text} onChange={(event) => updateField('intro_text', event.target.value)} data-testid="input-post-intro" className="field-input resize-y" placeholder="What makes this room worth a second look?" /></label>
              <div><div className="mb-3 flex items-center justify-between"><span className="field-label">Products</span><button type="button" onClick={addProduct} data-testid="button-add-product" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.13em] text-primary"><Plus size={13} /> Add product</button></div><div className="space-y-3">{form.products.map((product, index) => <div key={index} data-testid={`form-product-${index}`} className="border border-border bg-muted/40 p-3"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] text-muted-foreground">Find {String(index + 1).padStart(2, '0')}</span><button type="button" onClick={() => removeProduct(index)} data-testid={`button-remove-product-${index}`} className="text-muted-foreground hover:text-destructive"><X size={14} /></button></div><div className="grid gap-2 sm:grid-cols-2"><input required value={product.name} onChange={(event) => updateProduct(index, 'name', event.target.value)} data-testid={`input-product-name-${index}`} className="field-input" placeholder="Product name" /><input required value={product.material} onChange={(event) => updateProduct(index, 'material', event.target.value)} data-testid={`input-product-material-${index}`} className="field-input" placeholder="Primary material" /><input value={product.image} onChange={(event) => updateProduct(index, 'image', event.target.value)} data-testid={`input-product-image-${index}`} className="field-input" placeholder="Image URL" /><input required value={product.amazon_link} onChange={(event) => updateProduct(index, 'amazon_link', event.target.value)} data-testid={`input-product-link-${index}`} className="field-input" placeholder="Shopping link" /><input required value={product.description} onChange={(event) => updateProduct(index, 'description', event.target.value)} data-testid={`input-product-description-${index}`} className="field-input sm:col-span-2" placeholder="Why it earns its place" /></div></div>)}</div></div>
              <label className="block"><span className="field-label">Conclusion</span><textarea required rows={3} value={form.conclusion_text} onChange={(event) => updateField('conclusion_text', event.target.value)} data-testid="input-post-conclusion" className="field-input resize-y" placeholder="The last word on this room..." /></label>
              {(createPost.isError || updatePost.isError || deletePost.isError) && <p data-testid="status-dashboard-error" className="text-sm text-destructive">Something went wrong while saving. Your draft is still here.</p>}
              <button disabled={createPost.isPending || updatePost.isPending} type="submit" data-testid="button-save-post" className="inline-flex items-center gap-2 bg-secondary px-5 py-3 text-xs font-bold uppercase tracking-[.16em] text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"><Save size={15} /> {createPost.isPending || updatePost.isPending ? 'Saving...' : editing ? 'Save changes' : 'Publish story'}</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}