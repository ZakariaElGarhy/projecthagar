import { useState, type FormEvent } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useLogin } from '@workspace/api-client-react';
import { BrandMark, ThemeToggle } from '@/components/journal-ui';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ data: { username, password } }, { onSuccess: () => setLocation('/dashboard') });
  };

  return (
    <div className="paper-grain min-h-[100dvh] bg-secondary text-secondary-foreground">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-10"><BrandMark light /><ThemeToggle compact /></header>
      <main className="mx-auto grid min-h-[calc(100dvh-90px)] max-w-[1440px] items-center gap-12 px-5 py-10 lg:grid-cols-[1.2fr_.8fr] lg:px-20">
        <div className="hidden lg:block"><p className="font-mono text-[10px] uppercase tracking-[.22em] text-accent">The back room</p><h1 className="mt-6 max-w-2xl font-display text-[clamp(5rem,9vw,9rem)] leading-[.82] tracking-[-.06em]">Keep the<br /><i className="text-accent">good stuff</i><br />coming.</h1><p className="mt-8 max-w-sm text-lg leading-7 text-secondary-foreground/70">A quiet place to shape the next story, find the right image, and send something worth saving out into the world.</p></div>
        <div className="mx-auto w-full max-w-md border border-secondary-foreground/20 bg-secondary-foreground/[.05] p-7 sm:p-10">
          <Link href="/" data-testid="link-login-home" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-secondary-foreground/60 transition hover:text-accent"><ArrowLeft size={14} /> Return to the journal</Link>
          <div className="mt-12 flex h-11 w-11 items-center justify-center bg-accent text-accent-foreground"><LockKeyhole size={18} /></div>
          <h2 className="mt-5 font-display text-4xl">Publisher sign in</h2>
          <p className="mt-2 text-sm leading-6 text-secondary-foreground/60">For the people behind the rooms.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-secondary-foreground/60">Username</span><input required value={username} onChange={(event) => setUsername(event.target.value)} data-testid="input-login-username" className="mt-2 w-full border-b border-secondary-foreground/30 bg-transparent px-0 py-3 outline-none transition focus:border-accent" /></label>
            <label className="block"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-secondary-foreground/60">Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} data-testid="input-login-password" className="mt-2 w-full border-b border-secondary-foreground/30 bg-transparent px-0 py-3 outline-none transition focus:border-accent" /></label>
            {login.isError && <p data-testid="status-login-error" className="border-l-2 border-primary bg-primary/10 px-3 py-2 text-sm text-primary">That sign in did not work. Check your details and try again.</p>}
            <button disabled={login.isPending} type="submit" data-testid="button-submit-login" className="mt-3 flex w-full items-center justify-center bg-accent px-4 py-4 text-xs font-bold uppercase tracking-[.18em] text-accent-foreground transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50">{login.isPending ? 'Checking the key...' : 'Enter the back room'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}