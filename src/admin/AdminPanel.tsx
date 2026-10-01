import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  Star,
  Users,
  Sparkles,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import siteLogo from '../assets/sitelogo.webp';
import {
  fetchCurrentUser,
  fetchStats,
  fetchServices,
  fetchProjects,
  fetchReviews,
  fetchTeam,
  fetchIdeas,
  fetchInquiries,
  fetchSettings,
  logout,
  type AdminUser,
  type StatsData,
  type ServiceItem,
  type ProjectItem,
  type ReviewItem,
  type TeamMember,
  type IdeaItem,
  type Inquiry,
} from './api';

import { DashboardTab } from './components/DashboardTab';
import { ServicesCmsTab } from './components/ServicesCmsTab';
import { ProjectsCmsTab } from './components/ProjectsCmsTab';
import { ReviewsCmsTab } from './components/ReviewsCmsTab';
import { TeamCmsTab } from './components/TeamCmsTab';
import { IdeasCmsTab } from './components/IdeasCmsTab';
import { InquiriesTab } from './components/InquiriesTab';
import { SettingsCmsTab } from './components/SettingsCmsTab';
import { LoginScreen } from './components/LoginScreen';

interface AdminPanelProps {
  onViewPublicSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onViewPublicSite }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<StatsData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });
  }, []);

  // Fetch all CMS data
  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [
        statsData,
        servicesData,
        projectsData,
        reviewsData,
        teamData,
        ideasData,
        inquiriesData,
        settingsData,
      ] = await Promise.all([
        fetchStats().catch(() => null),
        fetchServices().catch(() => []),
        fetchProjects().catch(() => []),
        fetchReviews().catch(() => []),
        fetchTeam().catch(() => []),
        fetchIdeas().catch(() => []),
        fetchInquiries().catch(() => []),
        fetchSettings().catch(() => ({})),
      ]);

      if (statsData) setStats(statsData);
      setServices(servicesData);
      setProjects(projectsData);
      setReviews(reviewsData);
      setTeam(teamData);
      setIdeas(ideasData);
      setInquiries(inquiriesData);
      setSettings(settingsData);
    } catch {
      showToast('Error syncing CMS data with MySQL', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    showToast('Logged out successfully', 'success');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-400 font-mono tracking-wider">
            INITIALIZING NXTGEN CMS...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in, show dedicated Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`, 'success');
        }}
        onBackToWebsite={onViewPublicSite}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Layers, count: services.length },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: projects.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { id: 'team', label: 'Team Members', icon: Users, count: team.length },
    { id: 'ideas', label: 'Marquee Ideas', icon: Sparkles, count: ideas.length },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: Mail,
      badge: stats?.inquiries.new ? `${stats.inquiries.new} New` : null,
    },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500 selection:text-black relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation (Desktop) - Fixed at the side */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-zinc-950/95 backdrop-blur-2xl flex-col justify-between shrink-0 h-screen z-30 p-5 overflow-y-auto">
        <div className="space-y-6">
          {/* Logo & Brand - Centered and Full Width */}
          <div className="w-full flex items-center justify-center py-2 px-1">
            <img src={siteLogo} alt="NXTGen Studio" className="h-8 w-auto max-w-full mx-auto object-contain" />
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-black/20 text-black' : 'text-zinc-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="space-y-3 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-zinc-500 block truncate">
                @{currentUser.username}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={onViewPublicSite}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center">
          <img src={siteLogo} alt="NXTGen" className="h-6 w-auto" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-xl bg-white/5 text-zinc-300"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-white/10 p-4 space-y-2 z-40">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === item.id
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10 flex justify-between">
            <button
              onClick={onViewPublicSite}
              className="text-xs text-zinc-400 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public Site
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen lg:pl-64">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
              Workspace
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-white capitalize">
              {activeTab} Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <button
              onClick={onViewPublicSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              stats={stats}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'services' && (
            <ServicesCmsTab
              services={services}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsCmsTab
              projects={projects}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsCmsTab
              reviews={reviews}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'team' && (
            <TeamCmsTab
              team={team}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasCmsTab
              ideas={ideas}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsCmsTab
              settings={settings}
              onRefresh={loadAllData}
              showToast={showToast}
            />
          )}
        </div>
      </main>
    </div>
  );
};
