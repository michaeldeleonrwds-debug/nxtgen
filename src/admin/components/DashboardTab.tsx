import React from 'react';
import {
  Layers,
  FolderGit2,
  Star,
  Users,
  Mail,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { StatsData } from '../api';

interface DashboardTabProps {
  stats: StatsData | null;
  onNavigateTab: (tabId: string) => void;
  onRefresh: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ stats, onNavigateTab }) => {
  const statCards = [
    {
      title: 'Active Services',
      value: stats?.servicesActive ?? 0,
      total: stats?.services ?? 0,
      icon: Layers,
      tab: 'services',
      accent: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Portfolio Projects',
      value: stats?.projects ?? 0,
      total: null,
      icon: FolderGit2,
      tab: 'projects',
      accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Client Reviews',
      value: stats?.reviewsActive ?? 0,
      total: stats?.reviews ?? 0,
      icon: Star,
      tab: 'reviews',
      accent: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Team Members',
      value: stats?.team ?? 0,
      total: null,
      icon: Users,
      tab: 'team',
      accent: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    },
    {
      title: 'Contact Inquiries',
      value: stats?.inquiries.total ?? 0,
      badge: stats?.inquiries.new ? `${stats.inquiries.new} New` : null,
      icon: Mail,
      tab: 'inquiries',
      accent: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-black p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NXTGEN CMS Active & Synced
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Studio Content Management
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Dynamically control all public agency content, portfolio showcases, team members, testimonials, marquee badges, and customer inquiries from one central database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('services')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Service
            </button>
            <button
              onClick={() => onNavigateTab('projects')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" /> New Project
            </button>
            <button
              onClick={() => onNavigateTab('settings')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Site Settings
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Cards have independent auto-heights and align to top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => onNavigateTab(card.tab)}
              className={`group relative rounded-2xl border p-5 bg-gradient-to-br transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer self-start ${card.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                  {card.value}
                </span>
                {card.total !== null && (
                  <span className="text-xs text-zinc-500">
                    / {card.total} total
                  </span>
                )}
                {card.badge && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-white">
                <span>Manage in {card.tab}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Inquiries + Recent Activity - Independent Column Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Inquiries (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-md self-start">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400" />
                Recent Inquiries
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                New messages submitted through the public contact form
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              View Inbox <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(!stats?.recentInquiries || stats.recentInquiries.length === 0) ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No recent inquiries found.
              </div>
            ) : (
              stats.recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => onNavigateTab('inquiries')}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                        {inq.name}
                      </span>
                      <span className="text-xs text-zinc-500 truncate">
                        &lt;{inq.email}&gt;
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        inq.status === 'new'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : inq.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    "{inq.message}"
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-600">
                    <Clock className="w-3 h-3" />
                    <span>{inq.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Admin Activity (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-md self-start">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Admin Activity Log
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Audit trail of changes made inside the CMS
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No recorded admin activity yet.
              </div>
            ) : (
              stats.recentActivity.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.015] flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {log.user_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      {log.details}
                    </p>
                    <span className="text-[9px] text-zinc-600 mt-1 block">
                      {log.created_at}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
