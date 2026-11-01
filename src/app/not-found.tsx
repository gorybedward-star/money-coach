import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p className="font-display text-7xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page took a detour.</h1>
      <p className="mt-4 text-slate-600">The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back on the Roadmap.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/tools" variant="outline">Explore free tools</ButtonLink>
      </div>
    </section>
  );
}
