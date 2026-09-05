import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Beef,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Droplets,
  Factory,
  Home,
  MapPin,
  Menu,
  Milk,
  PackageCheck,
  Phone,
  Search,
  ShoppingBasket,
  Sprout,
  Store,
  Users,
  X,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetMilkVolumeTrendQueryKey,
  getHealthCheckQueryKey,
  getListCollectionCentersQueryKey,
  getListCowsQueryKey,
  getListFarmsQueryKey,
  getListProcessingPlantsQueryKey,
  getListSupermarketsQueryKey,
  getListVillagesQueryKey,
  useGetDashboardSummary,
  useGetMilkVolumeTrend,
  useHealthCheck,
  useListCollectionCenters,
  useListCows,
  useListFarms,
  useListProcessingPlants,
  useListSupermarkets,
  useListVillages,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const navItems = [
  { href: '/', label: 'Overview', icon: Home, exact: true },
  { href: '/villages', label: 'Villages', icon: MapPin },
  { href: '/farms', label: 'Farms', icon: Sprout },
  { href: '/cows', label: 'Cows', icon: Beef },
  { href: '/collection-centers', label: 'Collection centers', icon: Milk },
  { href: '/processing-plants', label: 'Processing plants', icon: Factory },
  { href: '/supermarkets', label: 'Supermarkets', icon: Store },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-[0_5px_0_hsl(193_45%_15%)]">
        <Droplets size={22} strokeWidth={2.5} />
      </div>
      <div>
        <div className="font-[Space_Grotesk] text-[17px] font-bold tracking-[-0.04em]">DairyTrack</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.62)]">Field operations</div>
      </div>
    </div>
  );
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const isHealthy = health.data?.status === 'ok' || health.data?.status === 'healthy';
  return (
    <>
      {mobileOpen && <button data-testid="button-close-navigation-overlay" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-[hsl(var(--primary)/.38)] lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <BrandMark />
          <button data-testid="button-close-navigation" aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))] lg:hidden"><X size={19} /></button>
        </div>
        <div className="mt-10 px-3 font-mono text-[10px] uppercase tracking-[0.17em] text-[hsl(var(--sidebar-foreground)/.48)]">Network view</div>
        <nav className="mt-3 space-y-1" aria-label="Primary navigation">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? location === href : location.startsWith(href);
            return (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={onClose} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-colors ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}>
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
                {active && <ChevronRight size={15} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.5)] p-4">
          <div className="flex items-center gap-2">
            {health.isLoading ? <span className="h-2 w-2 rounded-full bg-[hsl(var(--sidebar-foreground)/.45)]" /> : <span className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-[hsl(142_56%_60%)]' : 'bg-[hsl(var(--accent))]'}`} />}
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--sidebar-foreground)/.72)]">{health.isLoading ? 'Checking network' : isHealthy ? 'Network online' : 'Network attention'}</span>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--sidebar-foreground)/.55)]">A clear view from the first pour to the morning shelf.</p>
        </div>
      </aside>
    </>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const current = navItems.find((item) => item.exact ? location === item.href : location.startsWith(item.href));
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-5 backdrop-blur-md sm:px-8 lg:px-11">
          <div className="flex items-center gap-3">
            <button data-testid="button-open-navigation" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-[hsl(var(--muted))] lg:hidden"><Menu size={21} /></button>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Monday, 14 October 2024</div>
              <h1 className="mt-0.5 font-[Space_Grotesk] text-[19px] font-bold tracking-[-0.03em]">{current?.label ?? 'Overview'}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[11px] text-[hsl(var(--muted-foreground))]"><span className="h-2 w-2 rounded-full bg-[hsl(142_48%_45%)]" />Live network</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-[Space_Grotesk] text-xs font-bold text-[hsl(var(--primary-foreground))]">AM</div>
          </div>
        </header>
        <main className="page-enter px-5 py-7 sm:px-8 lg:px-11 lg:py-9">{children}</main>
      </div>
    </div>
  );
}

function QueryError({ message = 'We could not load this view.' , onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div data-testid="status-query-error" className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--accent)/.24)] text-[hsl(var(--primary))]"><AlertTriangle size={22} /></div>
      <h2 className="mt-4 font-[Space_Grotesk] text-lg font-bold">A small hold-up</h2>
      <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
      <button data-testid="button-retry-query" onClick={onRetry} className="mt-5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">Try again</button>
    </div>
  );
}

function SkeletonRows({ count = 5 }: { count?: number }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, index) => <div key={index} className="skeleton h-[62px] rounded-xl" />)}</div>;
}

function EmptyState({ title = 'Nothing here yet', detail = 'New records will appear here when they are added to the network.' }: { title?: string; detail?: string }) {
  return <div data-testid="status-empty-state" className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"><CircleHelp size={21} /></div><h3 className="mt-4 font-[Space_Grotesk] font-bold">{title}</h3><p className="mt-1 max-w-xs text-sm leading-5 text-[hsl(var(--muted-foreground))]">{detail}</p></div>;
}

function SectionHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{eyebrow}</div><h2 className="mt-1 font-[Space_Grotesk] text-2xl font-bold tracking-[-0.04em] sm:text-[28px]">{title}</h2>{detail && <p className="mt-1 max-w-xl text-sm text-[hsl(var(--muted-foreground))]">{detail}</p>}</div>{action}</div>;
}

function StatCard({ label, value, note, icon: Icon, tone = 'cream' }: { label: string; value: string | number; note: string; icon: typeof Users; tone?: 'cream' | 'yellow' | 'green' | 'red' }) {
  const tones = { cream: 'bg-[hsl(var(--card))]', yellow: 'bg-[hsl(var(--accent)/.28)]', green: 'bg-[hsl(142_35%_88%)]', red: 'bg-[hsl(4_66%_93%)]' };
  return <div data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`} className={`rounded-2xl border border-[hsl(var(--border))] p-5 shadow-[var(--shadow-sm)] ${tones[tone]}`}><div className="flex items-start justify-between"><span className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">{label}</span><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.09)] text-[hsl(var(--primary))]"><Icon size={17} /></div></div><div className="mt-5 font-[Space_Grotesk] text-[30px] font-bold tracking-[-0.06em]">{value}</div><div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</div></div>;
}

function Dashboard() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const trendQuery = useGetMilkVolumeTrend({ query: { queryKey: getGetMilkVolumeTrendQueryKey() } });
  const summary = summaryQuery.data;
  const trend = trendQuery.data ?? [];
  const maxLiters = Math.max(...trend.map((item) => item.liters), 1);
  const totalWeek = trend.reduce((sum, item) => sum + item.liters, 0);
  if (summaryQuery.isLoading || trendQuery.isLoading) return <DashboardLoading />;
  if (summaryQuery.isError) return <QueryError onRetry={() => { void summaryQuery.refetch(); }} />;
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="flex items-center gap-2 text-[hsl(var(--accent-foreground))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /><span className="font-mono text-[10px] uppercase tracking-[0.18em]">Morning dispatch</span></div><h2 className="mt-3 max-w-2xl font-[Space_Grotesk] text-[clamp(2.15rem,5vw,4.2rem)] font-bold leading-[.96] tracking-[-0.07em] text-[hsl(var(--primary))]">Good morning, the network is moving.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">Here is the first read of today’s milk journey — from village collection to the local shelf.</p></div><div className="flex items-center gap-2 self-start rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] md:self-end"><CheckCircle2 size={15} className="text-[hsl(142_48%_45%)]" />Last synced a moment ago</div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Villages" value={summary?.villages ?? 0} note="Across the active network" icon={MapPin} tone="yellow" />
        <StatCard label="Farms" value={summary?.farms ?? 0} note="Registered milk suppliers" icon={Sprout} />
        <StatCard label="Cows" value={summary?.cows ?? 0} note="Being cared for today" icon={Beef} tone="green" />
        <StatCard label="Health alerts" value={summary?.activeHealthAlerts ?? 0} note="Need a closer look" icon={AlertTriangle} tone={(summary?.activeHealthAlerts ?? 0) > 0 ? 'red' : 'cream'} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.85fr]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="font-mono text-[10px] uppercase tracking-[0.17em] text-[hsl(var(--muted-foreground))]">Collection rhythm</div><h3 className="mt-2 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">Milk collected this week</h3></div><div className="text-left sm:text-right"><div className="font-[Space_Grotesk] text-2xl font-bold tracking-[-0.05em]">{totalWeek.toLocaleString()} <span className="text-sm font-semibold tracking-normal text-[hsl(var(--muted-foreground))]">L</span></div><div className="mt-1 flex items-center gap-1 text-[11px] text-[hsl(142_48%_40%)] sm:justify-end"><ArrowUpRight size={13} /> 8.4% from last week</div></div></div>
          <div className="mt-8 flex h-[210px] items-end gap-2 border-b border-l border-[hsl(var(--border))] px-2 pb-0 pt-4 sm:gap-4">{trend.length ? trend.map((point, index) => <div key={point.date} data-testid={`chart-volume-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex w-full flex-1 items-end justify-center"><div className="w-full max-w-[42px] rounded-t-md bg-[hsl(var(--primary))] transition-[height] duration-500 group-hover:bg-[hsl(var(--accent))]" style={{ height: `${Math.max((point.liters / maxLiters) * 100, 8)}%` }}><span className="pointer-events-none absolute -translate-y-7 rounded bg-[hsl(var(--primary))] px-2 py-1 font-mono text-[9px] text-[hsl(var(--primary-foreground))] opacity-0 transition-opacity group-hover:opacity-100">{point.liters}L</span></div></div><span className="font-mono text-[9px] uppercase text-[hsl(var(--muted-foreground))]">{new Date(point.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}</span></div>) : <EmptyState title="No collection rhythm yet" detail="Milk volume will show here once collection starts." />}</div>
        </div>
        <div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)]"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--primary-foreground)/.6)]">Today’s handoff</div><ClipboardList size={20} className="text-[hsl(var(--accent))]" /></div><div className="mt-8 font-[Space_Grotesk] text-[clamp(2.4rem,5vw,3.5rem)] font-bold tracking-[-0.07em]">{summary?.milkCollectedToday?.toLocaleString() ?? 0}<span className="ml-2 text-lg font-semibold tracking-normal text-[hsl(var(--primary-foreground)/.58)]">litres</span></div><p className="mt-2 text-sm text-[hsl(var(--primary-foreground)/.68)]">collected and checked today</p><div className="my-7 h-px bg-[hsl(var(--primary-foreground)/.15)]" /><div className="flex items-center justify-between"><div><div className="text-[11px] text-[hsl(var(--primary-foreground)/.56)]">Pending supermarket orders</div><div className="mt-1 font-[Space_Grotesk] text-2xl font-bold">{summary?.pendingOrders ?? 0}</div></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><ShoppingBasket size={19} /></div></div></div>
      </div>
      <div className="mt-10"><SectionHeading eyebrow="Network pulse" title="Keep an eye on the handoffs" detail="The small checks that keep a good morning running." /><div className="grid gap-4 md:grid-cols-3"><PulseCard icon={Milk} title="Collection centers" value="Receiving now" note="Morning collection window is open" href="/collection-centers" /><PulseCard icon={Factory} title="Processing plants" value="On schedule" note="Batches are moving through the line" href="/processing-plants" /><PulseCard icon={Store} title="Supermarket orders" value={`${summary?.pendingOrders ?? 0} pending`} note="Ready for the next dispatch round" href="/supermarkets" /></div></div>
    </div>
  );
}

function DashboardLoading() {
  return <div className="mx-auto max-w-[1440px]"><div className="skeleton h-40 w-3/4 rounded-2xl" /><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div><div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.85fr]"><div className="skeleton h-80 rounded-2xl" /><div className="skeleton h-80 rounded-2xl" /></div></div>;
}

function PulseCard({ icon: Icon, title, value, note, href }: { icon: typeof Milk; title: string; value: string; note: string; href: string }) {
  return <Link href={href} data-testid={`link-pulse-${title.toLowerCase().replaceAll(' ', '-')}`} className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.27)] text-[hsl(var(--primary))]"><Icon size={18} /></div><ChevronRight size={18} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></div><div className="mt-6 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">{title}</div><div className="mt-1 font-[Space_Grotesk] text-lg font-bold">{value}</div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{note}</div></Link>;
}

type ResourceKind = 'villages' | 'farms' | 'cows' | 'collection-centers' | 'processing-plants' | 'supermarkets';

function ResourcePage({ kind }: { kind: ResourceKind }) {
  const [search, setSearch] = useState('');
  const villagesQuery = useListVillages({ query: { queryKey: getListVillagesQueryKey(), enabled: kind === 'villages' } });
  const farmsQuery = useListFarms({ query: { queryKey: getListFarmsQueryKey(), enabled: kind === 'farms' } });
  const cowsQuery = useListCows({ query: { queryKey: getListCowsQueryKey(), enabled: kind === 'cows' } });
  const centersQuery = useListCollectionCenters({ query: { queryKey: getListCollectionCentersQueryKey(), enabled: kind === 'collection-centers' } });
  const plantsQuery = useListProcessingPlants({ query: { queryKey: getListProcessingPlantsQueryKey(), enabled: kind === 'processing-plants' } });
  const supermarketsQuery = useListSupermarkets({ query: { queryKey: getListSupermarketsQueryKey(), enabled: kind === 'supermarkets' } });
  const config = resourceConfig[kind];
  const query = { villages: villagesQuery, farms: farmsQuery, cows: cowsQuery, 'collection-centers': centersQuery, 'processing-plants': plantsQuery, supermarkets: supermarketsQuery }[kind];
  const rawData = { villages: villagesQuery.data, farms: farmsQuery.data, cows: cowsQuery.data, 'collection-centers': centersQuery.data, 'processing-plants': plantsQuery.data, supermarkets: supermarketsQuery.data }[kind] ?? [];
  const data = useMemo(() => rawData.filter((item) => config.search(item).toLowerCase().includes(search.toLowerCase())), [rawData, config, search]);
  if (query.isLoading) return <ResourceLoading title={config.title} />;
  if (query.isError) return <QueryError message={`The ${config.title.toLowerCase()} could not be loaded.`} onRetry={() => { void query.refetch(); }} />;
  return <div className="mx-auto max-w-[1440px]"><SectionHeading eyebrow="Network directory" title={config.title} detail={config.detail} action={<div className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{rawData.length} {rawData.length === 1 ? 'record' : 'records'}</div>} /><div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative block max-w-md flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input data-testid={`input-search-${kind}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={config.placeholder} className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-10 pr-4 text-sm outline-none transition-[border,box-shadow] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/.25)]" /></label><div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs text-[hsl(var(--muted-foreground))]"><Activity size={15} className="text-[hsl(142_48%_45%)]" />Live records</div></div>{data.length === 0 ? <EmptyState title={search ? 'No matching records' : config.emptyTitle} detail={search ? 'Try a different name, place, or identifier.' : config.emptyDetail} /> : <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]"><div className="data-grid overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left"><thead><tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)]">{config.columns.map((column) => <th key={column} className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{column}</th>)}</tr></thead><tbody>{data.map((item, index) => <ResourceRow key={item.id} item={item} kind={kind} index={index} />)}</tbody></table></div></div>}</div>;
}

function ResourceLoading({ title }: { title: string }) {
  return <div className="mx-auto max-w-[1440px]"><div className="skeleton h-16 w-2/3 rounded-xl" /><div className="mt-7 skeleton h-11 max-w-md rounded-xl" /><div className="mt-5"><SkeletonRows count={6} /></div><span className="sr-only">Loading {title}</span></div>;
}

const resourceConfig: Record<ResourceKind, { title: string; detail: string; placeholder: string; columns: string[]; emptyTitle: string; emptyDetail: string; search: (item: any) => string }> = {
  villages: { title: 'Villages & districts', detail: 'The communities at the beginning of every milk journey.', placeholder: 'Search villages or districts', columns: ['Village', 'District', 'State', 'Network role'], emptyTitle: 'No villages yet', emptyDetail: 'Village partners will appear here as the network grows.', search: (item) => `${item.name} ${item.district} ${item.state}` },
  farms: { title: 'Farms', detail: 'The people and animals who keep the morning moving.', placeholder: 'Search farms, farmers, or villages', columns: ['Farm & farmer', 'Village', 'Phone', 'Address', 'Cows'], emptyTitle: 'No farms yet', emptyDetail: 'Registered farms will appear here.', search: (item) => `${item.farmerName} ${item.villageName} ${item.address} ${item.phone}` },
  cows: { title: 'Cows', detail: 'A simple view of herd health and lactation status.', placeholder: 'Search tags, breeds, or farms', columns: ['Tag ID', 'Farm', 'Breed', 'Date of birth', 'Lactation'], emptyTitle: 'No cows yet', emptyDetail: 'Cow records will appear here when farms are onboarded.', search: (item) => `${item.tagId} ${item.farmName} ${item.breed} ${item.lactationStatus}` },
  'collection-centers': { title: 'Collection centers', detail: 'Where milk is weighed, checked, and welcomed into the route.', placeholder: 'Search centers, villages, or locations', columns: ['Center', 'Village', 'Location', 'Linked farms'], emptyTitle: 'No collection centers yet', emptyDetail: 'Collection points will appear here.', search: (item) => `${item.name} ${item.villageName} ${item.location}` },
  'processing-plants': { title: 'Processing plants', detail: 'The careful middle of the journey, from raw milk to ready goods.', placeholder: 'Search plants or locations', columns: ['Plant', 'Location', 'Current batches', 'Status'], emptyTitle: 'No processing plants yet', emptyDetail: 'Processing facilities will appear here.', search: (item) => `${item.name} ${item.location}` },
  supermarkets: { title: 'Supermarkets', detail: 'The final local handoff where families find the day’s milk.', placeholder: 'Search stores or locations', columns: ['Supermarket', 'Location', 'Orders today', 'Dispatch'], emptyTitle: 'No supermarkets yet', emptyDetail: 'Retail partners will appear here.', search: (item) => `${item.name} ${item.location}` },
};

function ResourceRow({ item, kind, index }: { item: any; kind: ResourceKind; index: number }) {
  const cell = (children: ReactNode, extra = '') => <td className={`px-5 py-4 align-middle text-sm ${extra}`}>{children}</td>;
  const primary = (title: string, subtitle?: string) => <div><div className="font-semibold text-[hsl(var(--foreground))]">{title}</div>{subtitle && <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{subtitle}</div>}</div>;
  const chip = (text: string, tone: 'green' | 'yellow' | 'red' | 'blue' = 'green') => <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${tone === 'green' ? 'bg-[hsl(142_35%_88%)] text-[hsl(142_45%_30%)]' : tone === 'yellow' ? 'bg-[hsl(var(--accent)/.25)] text-[hsl(35_70%_27%)]' : tone === 'red' ? 'bg-[hsl(4_66%_92%)] text-[hsl(4_55%_38%)]' : 'bg-[hsl(193_35%_89%)] text-[hsl(var(--primary))]'}`}>{text}</span>;
  return <tr data-testid={`row-${kind}-${item.id}`} className={`border-b border-[hsl(var(--border))] transition-colors last:border-0 hover:bg-[hsl(var(--muted)/.35)] ${index % 2 ? 'bg-[hsl(var(--card)/.5)]' : ''}`}>
    {kind === 'villages' && <>{cell(<div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.25)] text-[hsl(var(--primary))]"><MapPin size={16} /></div>{primary(item.name)}</div>)}{cell(item.district)}{cell(item.state)}{cell(chip('Active route', 'blue'))}</>}
    {kind === 'farms' && <>{cell(primary(item.farmerName, `Farm #${item.id} · ${item.address}`))}{cell(item.villageName)}{cell(<span className="flex items-center gap-1.5 text-xs"><Phone size={13} className="text-[hsl(var(--muted-foreground))]" />{item.phone}</span>)}{cell(item.address)}{cell(<span className="font-mono text-xs font-medium">{item.cowCount} cows</span>)}</>}
    {kind === 'cows' && <>{cell(<span className="font-mono font-medium">{item.tagId}</span>)}{cell(item.farmName)}{cell(item.breed)}{cell(new Date(item.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))}{cell(chip(item.lactationStatus, item.lactationStatus.toLowerCase().includes('active') ? 'green' : 'yellow'))}</>}
    {kind === 'collection-centers' && <>{cell(primary(item.name, `Center #${item.id}`))}{cell(item.villageName)}{cell(<span className="flex items-center gap-1.5"><MapPin size={13} className="text-[hsl(var(--muted-foreground))]" />{item.location}</span>)}{cell(<span className="font-mono text-xs">{item.farmCount} farms</span>)}</>}
    {kind === 'processing-plants' && <>{cell(primary(item.name, `Plant #${item.id}`))}{cell(<span className="flex items-center gap-1.5"><MapPin size={13} className="text-[hsl(var(--muted-foreground))]" />{item.location}</span>)}{cell(<span className="font-mono text-xs">{item.batchCount} batches</span>)}{cell(chip(item.batchCount > 0 ? 'Processing' : 'Ready', item.batchCount > 0 ? 'yellow' : 'green'))}</>}
    {kind === 'supermarkets' && <>{cell(primary(item.name, `Store #${item.id}`))}{cell(<span className="flex items-center gap-1.5"><MapPin size={13} className="text-[hsl(var(--muted-foreground))]" />{item.location}</span>)}{cell(<span className="font-mono text-xs">{item.orderCount} orders</span>)}{cell(chip(item.orderCount > 0 ? 'Dispatch queue' : 'Clear', item.orderCount > 0 ? 'yellow' : 'green'))}</>}
  </tr>;
}

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><AppShell><Switch><Route path="/" component={Dashboard} /><Route path="/villages"><ResourcePage kind="villages" /></Route><Route path="/farms"><ResourcePage kind="farms" /></Route><Route path="/cows"><ResourcePage kind="cows" /></Route><Route path="/collection-centers"><ResourcePage kind="collection-centers" /></Route><Route path="/processing-plants"><ResourcePage kind="processing-plants" /></Route><Route path="/supermarkets"><ResourcePage kind="supermarkets" /></Route><Route component={NotFound} /></Switch></AppShell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;