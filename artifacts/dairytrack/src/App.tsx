import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Beef,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  Droplets,
  Factory,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Milk,
  NotebookPen,
  PackageCheck,
  Plus,
  Phone,
  Search,
  ShoppingBasket,
  Sprout,
  Store,
  Users,
  Video,
  X,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetFieldLogSummaryQueryKey,
  getGetMilkVolumeTrendQueryKey,
  getHealthCheckQueryKey,
  getListCollectionCentersQueryKey,
  getListCctvCamerasQueryKey,
  getListCowsQueryKey,
  getListFarmsQueryKey,
  getListFieldLogsQueryKey,
  getListProcessingPlantsQueryKey,
  getListSupermarketsQueryKey,
  getListVillagesQueryKey,
  useCheckoutFieldLog,
  useCreateCctvCamera,
  useCreateFieldLog,
  useGetDashboardSummary,
  useGetFieldLogSummary,
  useGetMilkVolumeTrend,
  useHealthCheck,
  useListCollectionCenters,
  useListCctvCameras,
  useListCows,
  useListFarms,
  useListFieldLogs,
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
  { href: '/field-logs', label: 'Field logs', icon: NotebookPen },
  { href: '/cctv', label: 'Farm CCTV', icon: Video },
];

const networkProfiles = [
  {
    id: 'admin',
    initials: 'AM',
    name: 'Asha Mehta',
    role: 'Network admin',
    scope: 'All villages, farms, plants, and supermarkets',
    status: 'Full network access',
    tone: 'bg-[hsl(var(--accent)/.35)]',
  },
  {
    id: 'field',
    initials: 'RP',
    name: 'Rohan Patil',
    role: 'Field supervisor',
    scope: 'Sundarpur and Devgaon farm operations',
    status: 'Field operations',
    tone: 'bg-[hsl(142_35%_88%)]',
  },
] as const;

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileId, setProfileId] = useState<(typeof networkProfiles)[number]['id']>('admin');
  const [location] = useLocation();
  const current = navItems.find((item) => item.exact ? location === item.href : location.startsWith(item.href));
  const activeProfile = networkProfiles.find((profile) => profile.id === profileId) ?? networkProfiles[0];
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[11px] text-[hsl(var(--muted-foreground))] sm:flex"><span className="h-2 w-2 rounded-full bg-[hsl(142_48%_45%)]" />Live network</div>
            <div className="relative">
              <button
                type="button"
                data-testid="button-network-profile"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1.5 pl-1.5 pr-2.5 text-left transition-colors hover:bg-[hsl(var(--muted))]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-[Space_Grotesk] text-xs font-bold text-[hsl(var(--primary-foreground))]">{activeProfile.initials}</span>
                <span className="hidden max-w-[120px] sm:block">
                  <span className="block truncate text-[11px] font-bold">{activeProfile.name}</span>
                  <span className="block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-[hsl(var(--muted-foreground))]">{activeProfile.role}</span>
                </span>
                <ChevronDown size={14} className={`text-[hsl(var(--muted-foreground))] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileMenuOpen && (
                <div data-testid="menu-network-profiles" className="absolute right-0 top-12 z-50 w-[300px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-lg)]">
                  <div className="px-3 pb-2 pt-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Network profiles</div>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Preview the two teams working across DairyTrack.</p>
                  </div>
                  <div className="space-y-1">
                    {networkProfiles.map((profile) => {
                      const selected = profile.id === activeProfile.id;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          data-testid={`button-profile-${profile.id}`}
                          onClick={() => {
                            setProfileId(profile.id);
                            setProfileMenuOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${selected ? 'bg-[hsl(var(--accent)/.22)]' : 'hover:bg-[hsl(var(--muted))]'}`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-[Space_Grotesk] text-xs font-bold text-[hsl(var(--primary))] ${profile.tone}`}>{profile.initials}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold">{profile.name}</span>
                              {selected && <CheckCircle2 size={14} className="shrink-0 text-[hsl(142_48%_45%)]" />}
                            </span>
                            <span className="mt-0.5 block text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">{profile.role}</span>
                            <span className="mt-1 block text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{profile.scope}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[hsl(var(--border))] px-3 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[hsl(var(--muted-foreground))]">Demo profiles · permissions come next</div>
                </div>
              )}
            </div>
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

const todayForInput = () => new Date().toISOString().slice(0, 10);

function Feedback({ kind, children }: { kind: 'success' | 'error'; children: ReactNode }) {
  return <div data-testid={`feedback-${kind}`} className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${kind === 'success' ? 'border-[hsl(142_35%_75%)] bg-[hsl(142_35%_90%)] text-[hsl(142_45%_29%)]' : 'border-[hsl(4_55%_78%)] bg-[hsl(4_66%_94%)] text-[hsl(4_55%_38%)]'}`}><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{children}</div>;
}

function FieldLogsPage() {
  const queryClient = useQueryClient();
  const logsQuery = useListFieldLogs({ query: { queryKey: getListFieldLogsQueryKey() } });
  const summaryQuery = useGetFieldLogSummary({ query: { queryKey: getGetFieldLogSummaryQueryKey() } });
  const farmsQuery = useListFarms({ query: { queryKey: getListFarmsQueryKey() } });
  const createLog = useCreateFieldLog();
  const checkoutLog = useCheckoutFieldLog();
  const [form, setForm] = useState({ farmId: '', workerName: '', logDate: todayForInput(), milk: '', ghee: '', dahi: '', notes: '' });
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const summary = summaryQuery.data;
  const logs = logsQuery.data ?? [];
  const farms = farmsQuery.data ?? [];

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!form.farmId || !form.workerName.trim() || !form.logDate) {
      setFeedback({ kind: 'error', message: 'Choose a farm, add the worker name, and set the log date before starting.' });
      return;
    }
    createLog.mutate({ data: { farmId: Number(form.farmId), fieldWorkerName: form.workerName.trim(), logDate: form.logDate, milkLiters: Number(form.milk) || 0, gheeKg: Number(form.ghee) || 0, dahiKg: Number(form.dahi) || 0, notes: form.notes.trim() || undefined } }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListFieldLogsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetFieldLogSummaryQueryKey() });
        setForm({ farmId: '', workerName: '', logDate: todayForInput(), milk: '', ghee: '', dahi: '', notes: '' });
        setFeedback({ kind: 'success', message: 'Session started. The new production log is now in the field list.' });
      },
      onError: () => setFeedback({ kind: 'error', message: 'The session could not be started. Check the details and try again.' }),
    });
  };

  const handleCheckout = (id: number) => {
    setFeedback(null);
    checkoutLog.mutate({ id }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListFieldLogsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetFieldLogSummaryQueryKey() });
        setFeedback({ kind: 'success', message: 'Session closed. The check-out time and completed total are up to date.' });
      },
      onError: () => setFeedback({ kind: 'error', message: 'This session could not be closed. Please try again.' }),
    });
  };

  if (logsQuery.isLoading || summaryQuery.isLoading) return <FieldLogsLoading />;
  if (logsQuery.isError) return <QueryError message="The field logs could not be loaded." onRetry={() => { void logsQuery.refetch(); void summaryQuery.refetch(); }} />;

  return (
    <div className="mx-auto max-w-[1440px]">
      <SectionHeading eyebrow="Today in the field" title="Field logs" detail="Start a session, record the day’s production, and close the loop when the worker checks out." action={<div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]"><CalendarDays size={14} />{new Date().toLocaleDateString('en', { day: 'numeric', month: 'short' })}</div>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Milk today" value={`${summary?.milkLiters ?? 0} L`} note="Recorded in field logs" icon={Droplets} tone="yellow" />
        <StatCard label="Ghee today" value={`${summary?.gheeKg ?? 0} kg`} note="Processed on farms" icon={PackageCheck} />
        <StatCard label="Dahi today" value={`${summary?.dahiKg ?? 0} kg`} note="Fresh production" icon={Milk} tone="green" />
        <StatCard label="Active sessions" value={summary?.activeSessions ?? 0} note="Workers currently checked in" icon={Clock3} />
        <StatCard label="Completed logs" value={summary?.completedLogs ?? 0} note="Closed today" icon={CheckCircle2} tone="green" />
      </div>
      {feedback && <div className="mt-5 max-w-2xl"><Feedback kind={feedback.kind}>{feedback.message}</Feedback></div>}
      <div className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
        <form onSubmit={handleCreate} className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">New entry</div><h3 className="mt-1 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">Start a session</h3></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.27)] text-[hsl(var(--primary))]"><LogIn size={18} /></div></div>
          <div className="mt-6 space-y-4">
            <FormField label="Farm" htmlFor="field-log-farm"><select id="field-log-farm" data-testid="select-field-log-farm" value={form.farmId} onChange={(event) => setForm({ ...form, farmId: event.target.value })} className="form-control"><option value="">{farmsQuery.isLoading ? 'Loading farms…' : 'Choose a farm'}</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmerName} · {farm.villageName}</option>)}</select></FormField>
            <FormField label="Worker name" htmlFor="field-log-worker"><input id="field-log-worker" data-testid="input-field-log-worker" value={form.workerName} onChange={(event) => setForm({ ...form, workerName: event.target.value })} placeholder="Who is on the farm today?" className="form-control" /></FormField>
            <FormField label="Log date" htmlFor="field-log-date"><input id="field-log-date" data-testid="input-field-log-date" type="date" value={form.logDate} onChange={(event) => setForm({ ...form, logDate: event.target.value })} className="form-control" /></FormField>
            <div className="grid grid-cols-3 gap-2"><FormField label="Milk (L)" htmlFor="field-log-milk"><input id="field-log-milk" data-testid="input-field-log-milk" type="number" min="0" step="0.1" value={form.milk} onChange={(event) => setForm({ ...form, milk: event.target.value })} placeholder="0" className="form-control px-2" /></FormField><FormField label="Ghee (kg)" htmlFor="field-log-ghee"><input id="field-log-ghee" data-testid="input-field-log-ghee" type="number" min="0" step="0.1" value={form.ghee} onChange={(event) => setForm({ ...form, ghee: event.target.value })} placeholder="0" className="form-control px-2" /></FormField><FormField label="Dahi (kg)" htmlFor="field-log-dahi"><input id="field-log-dahi" data-testid="input-field-log-dahi" type="number" min="0" step="0.1" value={form.dahi} onChange={(event) => setForm({ ...form, dahi: event.target.value })} placeholder="0" className="form-control px-2" /></FormField></div>
            <FormField label="Notes (optional)" htmlFor="field-log-notes"><textarea id="field-log-notes" data-testid="input-field-log-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="A short note about the session" rows={3} className="form-control resize-none" /></FormField>
          </div>
          <button data-testid="button-start-field-session" type="submit" disabled={createLog.isPending} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] transition-[transform,opacity] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"><Plus size={17} />{createLog.isPending ? 'Starting…' : 'Start worker session'}</button>
        </form>
        <section className="min-w-0 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]">
          <div className="flex flex-col justify-between gap-2 border-b border-[hsl(var(--border))] p-5 sm:flex-row sm:items-center sm:px-6"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Live register</div><h3 className="mt-1 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">Today’s sessions</h3></div><div className="text-xs text-[hsl(var(--muted-foreground))]">{logs.length} {logs.length === 1 ? 'log' : 'logs'}</div></div>
          {logs.length === 0 ? <div className="p-5"><EmptyState title="No field logs today" detail="Start a worker session to put the first entry on the register." /></div> : <div className="space-y-3 p-4 sm:p-5">{logs.map((log) => { const open = !log.checkOut && log.status.toLowerCase() !== 'completed' && log.status.toLowerCase() !== 'closed'; return <article key={log.id} data-testid={`card-field-log-${log.id}`} className={`rounded-xl border p-4 ${open ? 'border-[hsl(var(--accent)/.7)] bg-[hsl(var(--accent)/.09)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{log.fieldWorkerName}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${open ? 'bg-[hsl(var(--accent)/.35)] text-[hsl(35_70%_27%)]' : 'bg-[hsl(142_35%_88%)] text-[hsl(142_45%_29%)]'}`}>{open ? 'Open session' : 'Completed'}</span></div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{log.farmName} · {new Date(log.logDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>{open && <button data-testid={`button-checkout-field-log-${log.id}`} type="button" disabled={checkoutLog.isPending} onClick={() => handleCheckout(log.id)} className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary))] transition-[transform,opacity] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"><LogOut size={14} />{checkoutLog.isPending ? 'Closing…' : 'Log out'}</button>}</div><div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><div className="text-[hsl(var(--muted-foreground))]">Check-in</div><div className="mt-1 flex items-center gap-1.5 font-mono text-[11px]"><Clock3 size={12} />{formatDateTime(log.checkIn)}</div></div><div><div className="text-[hsl(var(--muted-foreground))]">Check-out</div><div className="mt-1 font-mono text-[11px]">{log.checkOut ? formatDateTime(log.checkOut) : 'Still on farm'}</div></div><div><div className="text-[hsl(var(--muted-foreground))]">Production</div><div className="mt-1 font-mono text-[11px]">{log.milkLiters} L · {log.gheeKg} kg ghee</div></div><div><div className="text-[hsl(var(--muted-foreground))]">Dahi</div><div className="mt-1 font-mono text-[11px]">{log.dahiKg} kg</div></div></div>{log.notes && <div className="mt-3 border-t border-[hsl(var(--border)/.7)] pt-3 text-xs italic text-[hsl(var(--muted-foreground))]">{log.notes}</div>}</article>; })}</div>}
        </section>
      </div>
    </div>
  );
}

function FieldLogsLoading() {
  return <div className="mx-auto max-w-[1440px]"><div className="skeleton h-16 w-2/3 rounded-xl" /><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div><div className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]"><div className="skeleton h-[540px] rounded-2xl" /><div className="skeleton h-[540px] rounded-2xl" /></div><span className="sr-only">Loading field logs</span></div>;
}

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="block"><span className="mb-1.5 block text-[11px] font-bold text-[hsl(var(--muted-foreground))]">{label}</span>{children}</label>;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function CctvPage() {
  const queryClient = useQueryClient();
  const camerasQuery = useListCctvCameras({ query: { queryKey: getListCctvCamerasQueryKey() } });
  const farmsQuery = useListFarms({ query: { queryKey: getListFarmsQueryKey() } });
  const createCamera = useCreateCctvCamera();
  const cameras = camerasQuery.data ?? [];
  const farms = farmsQuery.data ?? [];
  const [selectedId, setSelectedId] = useState(0);
  const [form, setForm] = useState({ farmId: '', name: '', location: '', streamUrl: '' });
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const selected = cameras.find((camera) => camera.id === selectedId) ?? cameras[0];
  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!form.farmId || !form.name.trim() || !form.location.trim()) {
      setFeedback({ kind: 'error', message: 'Choose a farm and add a camera name and location.' });
      return;
    }
    createCamera.mutate({ data: { farmId: Number(form.farmId), name: form.name.trim(), location: form.location.trim(), streamUrl: form.streamUrl.trim() || null } }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCctvCamerasQueryKey() });
        setForm({ farmId: '', name: '', location: '', streamUrl: '' });
        setFeedback({ kind: 'success', message: 'Camera registered. The CCTV network list is up to date.' });
      },
      onError: () => setFeedback({ kind: 'error', message: 'The camera could not be registered. Check the details and try again.' }),
    });
  };
  if (camerasQuery.isLoading) return <CctvLoading />;
  if (camerasQuery.isError) return <QueryError message="The farm CCTV network could not be loaded." onRetry={() => { void camerasQuery.refetch(); }} />;
  return (
    <div className="mx-auto max-w-[1440px]">
      <SectionHeading eyebrow="Farm visibility" title="CCTV network" detail="Choose a farm camera to check the latest view, or register a new slot for the network." action={<div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]"><Camera size={14} />{cameras.length} camera slots</div>} />
      {feedback && <div className="mb-5 max-w-2xl"><Feedback kind={feedback.kind}>{feedback.message}</Feedback></div>}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5 sm:px-6"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Network slots</div><h3 className="mt-1 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">All farm cameras</h3></div><div className="text-xs text-[hsl(var(--muted-foreground))]">Select a row to inspect</div></div>
            {cameras.length === 0 ? <div className="p-5"><EmptyState title="No cameras registered" detail="Use the form to add the first camera slot to the network." /></div> : <div className="data-grid overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left"><thead><tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)]"><th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Camera</th><th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Farm</th><th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Location</th><th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Status</th><th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">Last seen</th></tr></thead><tbody>{cameras.map((camera, index) => { const isSelected = selected?.id === camera.id; const connected = camera.status.toLowerCase().includes('connect') && !camera.status.toLowerCase().includes('disconnect'); return <tr key={camera.id} data-testid={`row-cctv-camera-${camera.id}`} onClick={() => setSelectedId(camera.id)} className={`cursor-pointer border-b border-[hsl(var(--border))] transition-colors last:border-0 ${isSelected ? 'bg-[hsl(var(--accent)/.14)]' : index % 2 ? 'bg-[hsl(var(--card)/.5)] hover:bg-[hsl(var(--muted)/.35)]' : 'hover:bg-[hsl(var(--muted)/.35)]'}`}><td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${connected ? 'bg-[hsl(142_35%_88%)] text-[hsl(142_45%_29%)]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><Camera size={16} /></div><div><div className="font-semibold text-sm">{camera.name}</div><div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Camera #{camera.id}</div></div></div></td><td className="px-5 py-4 text-sm">{camera.farmName}</td><td className="px-5 py-4 text-sm text-[hsl(var(--muted-foreground))]">{camera.location}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${connected ? 'bg-[hsl(142_35%_88%)] text-[hsl(142_45%_29%)]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-[hsl(142_48%_45%)]' : 'bg-[hsl(var(--muted-foreground))]'}`} />{camera.status}</span></td><td className="px-5 py-4 text-xs text-[hsl(var(--muted-foreground))]">{camera.lastSeen ? formatDateTime(camera.lastSeen) : 'Not seen yet'}</td></tr>; })}</tbody></table></div>}
          </section>
          <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-5 sm:px-6"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Selected stream</div><h3 className="mt-1 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">{selected?.name ?? 'No camera selected'}</h3></div>{selected && <span className="text-xs text-[hsl(var(--muted-foreground))]">{selected.farmName}</span>}</div><div className="aspect-video bg-[hsl(var(--primary))]">{selected?.streamUrl ? <iframe data-testid={`iframe-cctv-stream-${selected.id}`} title={`${selected.name} live stream`} src={selected.streamUrl} className="h-full w-full border-0" allow="autoplay; fullscreen" /> : <div data-testid="status-cctv-not-connected" className="flex h-full flex-col items-center justify-center px-6 text-center text-[hsl(var(--primary-foreground))]"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary-foreground)/.12)] text-[hsl(var(--accent))]"><Video size={25} /></div><h4 className="mt-4 font-[Space_Grotesk] text-lg font-bold">Stream not connected</h4><p className="mt-1 max-w-sm text-xs leading-5 text-[hsl(var(--primary-foreground)/.62)]">{selected ? 'This camera slot has no stream URL yet. Register a URL when the farm feed is ready.' : 'Select a camera slot to inspect its stream.'}</p></div>}</div></section>
        </div>
        <form onSubmit={handleCreate} className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-6"><div className="flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">Network setup</div><h3 className="mt-1 font-[Space_Grotesk] text-xl font-bold tracking-[-0.04em]">Register a camera</h3></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.27)] text-[hsl(var(--primary))]"><Plus size={18} /></div></div><div className="mt-6 space-y-4"><FormField label="Farm" htmlFor="cctv-farm"><select id="cctv-farm" data-testid="select-cctv-farm" value={form.farmId} onChange={(event) => setForm({ ...form, farmId: event.target.value })} className="form-control"><option value="">{farmsQuery.isLoading ? 'Loading farms…' : 'Choose a farm'}</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.farmerName} · {farm.villageName}</option>)}</select></FormField><FormField label="Camera name" htmlFor="cctv-name"><input id="cctv-name" data-testid="input-cctv-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Main yard" className="form-control" /></FormField><FormField label="Location" htmlFor="cctv-location"><input id="cctv-location" data-testid="input-cctv-location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="North gate" className="form-control" /></FormField><FormField label="Stream URL (optional)" htmlFor="cctv-stream-url"><input id="cctv-stream-url" data-testid="input-cctv-stream-url" type="url" value={form.streamUrl} onChange={(event) => setForm({ ...form, streamUrl: event.target.value })} placeholder="https://camera.example/feed" className="form-control" /></FormField></div><button data-testid="button-register-cctv-camera" type="submit" disabled={createCamera.isPending} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] transition-[transform,opacity] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"><Camera size={16} />{createCamera.isPending ? 'Registering…' : 'Register camera'}</button><p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">A camera without a stream URL stays visible as a slot until its feed is connected.</p></form>
      </div>
    </div>
  );
}

function CctvLoading() {
  return <div className="mx-auto max-w-[1440px]"><div className="skeleton h-16 w-2/3 rounded-xl" /><div className="mt-7 grid gap-5 xl:grid-cols-[1fr_360px]"><div className="space-y-4"><div className="skeleton h-[330px] rounded-2xl" /><div className="skeleton aspect-video rounded-2xl" /></div><div className="skeleton h-[430px] rounded-2xl" /></div><span className="sr-only">Loading farm CCTV</span></div>;
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
  return <ErrorBoundary resetKey={useLocation()[0]}><AppShell><Switch><Route path="/" component={Dashboard} /><Route path="/villages"><ResourcePage kind="villages" /></Route><Route path="/farms"><ResourcePage kind="farms" /></Route><Route path="/cows"><ResourcePage kind="cows" /></Route><Route path="/collection-centers"><ResourcePage kind="collection-centers" /></Route><Route path="/processing-plants"><ResourcePage kind="processing-plants" /></Route><Route path="/supermarkets"><ResourcePage kind="supermarkets" /></Route><Route path="/field-logs" component={FieldLogsPage} /><Route path="/cctv" component={CctvPage} /><Route component={NotFound} /></Switch></AppShell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;