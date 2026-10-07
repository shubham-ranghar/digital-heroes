import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CharityImage } from "@/components/charity/charity-image";
import { DonationForm } from "@/components/charity/donation-form";
import { MarketingSection } from "@/components/layout/marketing-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPlayedOnLabel } from "@/lib/scores/dates";
import {
  getCharityBySlug,
  listUpcomingCharityEvents,
} from "@/lib/charity/queries";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ donation?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!hasSupabaseEnv()) {
    return { title: "Charity" };
  }
  const supabase = await createClient();
  const charity = await getCharityBySlug(supabase, slug);
  return {
    title: charity?.name ?? "Charity",
    description: charity?.description ?? undefined,
  };
}

export default async function CharityDetailPage({
  params,
  searchParams,
}: PageProps) {
  await connection();
  const { slug } = await params;
  const query = await searchParams;

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createClient();
  const charity = await getCharityBySlug(supabase, slug);

  if (!charity) {
    notFound();
  }

  const events = await listUpcomingCharityEvents(supabase, charity.id);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <MarketingSection variant="navy" className="hero-glow pb-10 pt-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm" render={<Link href="/charities" />}>
            ← All charities
          </Button>
        </div>

        {query.donation === "success" ? (
          <p className="mb-6 rounded-xl border border-status-active/40 bg-status-active/15 px-3 py-2 text-sm text-navy">
            Thank you — your one-off donation is processing. You&apos;ll receive
            a receipt from Stripe.
          </p>
        ) : null}
        {query.donation === "cancelled" ? (
          <p className="mb-6 rounded-xl border border-slate/40 bg-surface/50 px-3 py-2 text-sm text-slate">
            Donation checkout was cancelled.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-sans text-display-md font-semibold text-cream">
            {charity.name}
          </h1>
          {charity.is_featured ? <Badge variant="outline">Featured</Badge> : null}
        </div>
        {charity.description ? (
          <p className="mt-4 max-w-3xl text-body-lg text-slate">
            {charity.description}
          </p>
        ) : null}
      </MarketingSection>

      <MarketingSection variant="cream">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {charity.images.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {charity.images.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--navy)_12%,transparent)]"
                  >
                    <CharityImage
                      src={src}
                      alt={`${charity.name} image ${index + 1}`}
                      className="aspect-[4/3] w-full"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <section>
              <h2 className="font-sans text-xl font-semibold text-navy">
                Upcoming events
              </h2>
              {events.length === 0 ? (
                <p className="mt-3 text-sm text-slate">
                  No upcoming events listed yet. Check back soon or contact the
                  charity directly.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {events.map((event) => (
                    <li key={event.id}>
                      <Card interactive={false}>
                        <CardHeader>
                          <CardTitle className="text-base text-navy">
                            {event.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-slate">
                          <p className="tabular-impact">
                            {formatPlayedOnLabel(event.event_date)}
                          </p>
                          {event.location ? <p>{event.location}</p> : null}
                          {event.description ? (
                            <p className="pt-1">{event.description}</p>
                          ) : null}
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DonationForm
              charityId={charity.id}
              charitySlug={charity.slug}
              charityName={charity.name}
              isLoggedIn={Boolean(user)}
            />
          </aside>
        </div>
      </MarketingSection>
    </>
  );
}
