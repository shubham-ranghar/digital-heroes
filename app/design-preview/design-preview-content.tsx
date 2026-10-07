"use client";

import { Heart, Trophy } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MarketingSection } from "@/components/layout/marketing-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { headingHero, tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { MotionShowcase } from "@/app/design-preview/motion-showcase";

function SurfaceBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-sans text-xl font-semibold text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ComponentShowcase() {
  return (
    <div className="grid gap-10">
      <SurfaceBlock title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary (ivory outline)</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Danger</Button>
        </div>
      </SurfaceBlock>

      <SurfaceBlock title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Charity</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </SurfaceBlock>

      <SurfaceBlock title="Form controls">
        <div className="grid max-w-md gap-4">
          <Input placeholder="Email address" type="email" />
          <Select defaultValue="charity-a">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose charity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="charity-a">Community Food Bank</SelectItem>
              <SelectItem value="charity-b">Youth Sports Fund</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Charity share (min 10%)
            </p>
            <Slider defaultValue={[15]} max={50} step={1} />
          </div>
        </div>
      </SurfaceBlock>

      <SurfaceBlock title="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Monthly draw</CardTitle>
            <CardDescription>
              Pool scales with active subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              5-match jackpot rolls over when unclaimed.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">View tiers</Button>
          </CardFooter>
        </Card>
      </SurfaceBlock>

      <SurfaceBlock title="Tabs">
        <Tabs defaultValue="scores">
          <TabsList>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="draws">Draws</TabsTrigger>
            <TabsTrigger value="charity">Charity</TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="pt-4 text-muted-foreground">
            Latest five Stableford scores, newest first.
          </TabsContent>
          <TabsContent value="draws" className="pt-4 text-muted-foreground">
            40% / 35% / 25% tier split.
          </TabsContent>
          <TabsContent value="charity" className="pt-4 text-muted-foreground">
            Your chosen cause and giving rate.
          </TabsContent>
        </Tabs>
      </SurfaceBlock>

      <SurfaceBlock title="Dialog & toast">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm submission</DialogTitle>
                <DialogDescription>
                  One score per calendar date. This replaces your oldest stored
                  score when you already have five.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Proof uploaded — awaiting admin review.")
            }
          >
            Show toast
          </Button>
        </div>
      </SurfaceBlock>

      <SurfaceBlock title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>7 Oct 2026</TableCell>
              <TableCell>38</TableCell>
              <TableCell>
                <Badge variant="outline">Counted</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5 Oct 2026</TableCell>
              <TableCell>34</TableCell>
              <TableCell>
                <Badge variant="secondary">Counted</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </SurfaceBlock>

      <SurfaceBlock title="Typography">
        <div className="space-y-4">
          <p className={headingHero}>Display hero — warm, hopeful, human</p>
          <p className="text-display-md font-sans font-semibold tracking-tightish">
            Display section title
          </p>
          <p className="text-body-lg text-muted-foreground">
            Body lead — premium impact brand voice, not a sports club.
          </p>
          <p className={cn("text-display-sm font-sans", tabularImpact)}>
            £3,840.00 · 38 pts
          </p>
        </div>
      </SurfaceBlock>

      <SurfaceBlock title="Motion">
        <MotionShowcase />
      </SurfaceBlock>

      <SurfaceBlock title="Skeleton">
        <div className="flex max-w-sm flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
        </div>
      </SurfaceBlock>
    </div>
  );
}

export function DesignPreviewContent() {
  return (
    <>
      <MarketingSection variant="cream" className="hero-glow pt-10">
        <SectionHeading
          eyebrow="Foundation"
          title="Design system preview"
          description="All primitives on an ivory marketing surface. Text uses organic-deep; accents use apricot and leaf."
        />
        <div className="mt-12">
          <ComponentShowcase />
        </div>
      </MarketingSection>

      <MarketingSection variant="navy">
        <SectionHeading
          eyebrow="Dark surface"
          title="Components on organic-deep"
          description="Mirrors hero and footer sections — ivory typography on deep green."
        />
        <div className="mt-12">
          <ComponentShowcase />
        </div>
      </MarketingSection>

      <DashboardShell>
        <SectionHeading
          eyebrow="Dashboard shell"
          title="Subscriber & admin surfaces"
          description="Organic-deep page background with organic-soft cards."
          className="mb-10"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Active subscribers"
            value={1284}
            icon={Heart}
            trend="+12% this month"
          />
          <StatCard
            label="Prize pool"
            value={3840}
            prefix="£"
            icon={Trophy}
            trend="5-match tier 40%"
          />
          <StatCard
            label="Charity committed"
            value={42.5}
            suffix="%"
            decimals={1}
            icon={Heart}
          />
        </div>
      </DashboardShell>
    </>
  );
}
