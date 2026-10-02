import React, { useState, type SVGProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Palette,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import siteLogo from '../assets/sitelogo.webp';

type BrandIconProps = SVGProps<SVGSVGElement>;

const Github = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3 .8.1-.7.4-1.1.7-1.3-2.2-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 6.9 7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8V21c0 .3.2.6.8.5A10 10 0 0 0 12 2Z" />
  </svg>
);

const Linkedin = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6.9 8.9H3.6V20h3.3V8.9ZM5.2 7.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM20.4 20v-6.1c0-3-1.6-4.4-3.8-4.4a3.3 3.3 0 0 0-3 1.7V8.9h-3.3V20h3.3v-5.5c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.6 1.8 3V20h3Z" />
  </svg>
);

const Twitter = (props: BrandIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.9 10.6 21.1 2h-1.7l-6.3 7.5L8.1 2H2.3l7.6 11.1L2.3 22h1.7l6.7-7.9 5.3 7.9h5.8l-7.9-11.4Zm-2.4 2.8-.8-1.1L4.6 3.3h2.7l4.9 7.2.8 1.1 6.4 9.3h-2.7l-5.2-7.5Z" />
  </svg>
);

import type { TeamMember } from '../admin/api';

export interface TeamPageProps {
  team: TeamMember[];
  settings?: Record<string, string>;
  onBackToHome: () => void;
}

const teamAvatarPresets: Record<string, { image: string; bio: string; skills: string[]; quote: string }> = {
  'michael de leon': {
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Architecting distributed platforms, cloud-native backend engines, and reactive frontend experiences. Focused on low-latency systems and database performance.',
    skills: ['System Architecture', 'React & TypeScript', 'MariaDB / MySQL', 'Nginx & Linux', 'PHP 8.5+ & Node.js'],
    quote: 'Architecture is not just how components connect, but how gracefully they endure scale.',
  },
  'mc denver alba': {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Crafting pixel-perfection, micro-interactions, and headless CMS integrations. Specializes in accessible interface choreography and component scalability.',
    skills: ['Design Systems', 'Framer Motion', 'Tailwind CSS', 'Headless CMS', 'Next.js & Vite'],
    quote: 'The interface is the product. Every millisecond of motion should feel organic.',
  },
  'bryl fayosal': {
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'Leading DevOps automation, container pipelines, and edge network delivery. Bridges raw microcontroller telemetry with high-availability cloud servers.',
    skills: ['DevOps & Docker', 'Edge Caching & CDN', 'IoT & Telemetry', 'Cloud Security', 'MariaDB Clusters'],
    quote: 'Zero-downtime is a baseline commitment, not an aspirational goal.',
  },
  'marc paul tuquilar': {
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'Defining the sensory visual tone, brand narratives, and futuristic design languages. Merging 3D aesthetics with intuitive interaction mechanics.',
    skills: ['Visual Identity', 'Design Tokens', 'Product Strategy', '3D / WebGL Concepts', 'Figma Prototyping'],
    quote: 'Great engineering becomes timeless when elevated by intentional visual rhythm.',
  },
};

export const resolveTeamMemberMedia = (member: TeamMember) => {
  const key = member.name.trim().toLowerCase();
  const preset = teamAvatarPresets[key];

  return {
    avatar: member.image_url || preset?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=101010&color=ffffff&bold=true&size=512`,
    bio: member.bio || preset?.bio || 'Core engineer at NXTGen Studio, crafting high-performance digital systems and future-facing user interfaces.',
    skills: preset?.skills || ['React', 'TypeScript', 'Software Architecture', 'Cloud Systems'],
    quote: preset?.quote || 'Engineering high-performance software for brands that move next.',
  };
};

export const TeamPage: React.FC<TeamPageProps> = ({
  team,
  settings,
  onBackToHome,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const defaultMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Michael de Leon',
      role: 'Full Stack Engineer & Tech Lead',
      initials: 'MD',
      sort_order: 1,
      is_active: 1,
    },
    {
      id: 2,
      name: 'Mc Denver Alba',
      role: 'Frontend & Systems Engineer',
      initials: 'MA',
      sort_order: 2,
      is_active: 1,
    },
    {
      id: 3,
      name: 'Bryl Fayosal',
      role: 'DevOps & Backend Engineer',
      initials: 'BF',
      sort_order: 3,
      is_active: 1,
    },
    {
      id: 4,
      name: 'Marc Paul Tuquilar',
      role: 'UI/UX & Creative Director',
      initials: 'MT',
      sort_order: 4,
      is_active: 1,
    },
  ];

  const members = team && team.length > 0 ? team : defaultMembers;

  const roles = ['All', 'Engineering', 'Frontend', 'DevOps & Systems', 'Creative & Design'];

  const filteredMembers = members.filter((m) => {
    if (selectedRole === 'All') return true;
    const r = m.role.toLowerCase();
    if (selectedRole === 'Engineering') return r.includes('engineer') || r.includes('stack') || r.includes('backend');
    if (selectedRole === 'Frontend') return r.includes('frontend') || r.includes('systems');
    if (selectedRole === 'DevOps & Systems') return r.includes('devops') || r.includes('systems') || r.includes('backend');
    if (selectedRole === 'Creative & Design') return r.includes('design') || r.includes('creative') || r.includes('ui');
    return true;
  });

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/30 selection:text-white relative">
      {/* Header / Navbar */}
      <nav className="relative z-30 px-4 sm:px-6 py-4 sm:py-6 w-full">
        <div className="liquid-glass rounded-2xl sm:rounded-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <img src={siteLogo} alt="NXTGen Studio" className="h-7 sm:h-8 w-auto shrink-0" />
            </button>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-white/60">
              Team
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onBackToHome}
              className="liquid-glass rounded-full px-4 sm:px-5 py-2 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <a
              href="/#contact-form"
              onClick={onBackToHome}
              className="liquid-glass rounded-full px-4 sm:px-6 py-2 text-white text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors hidden md:inline-flex"
            >
              Work With Us
            </a>

            {/* Mobile Hamburger / Burger Bar Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden liquid-glass rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden max-w-5xl mx-auto mt-2.5 p-4 liquid-glass rounded-2xl border border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-1 relative z-40"
            >
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToHome();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer w-full"
              >
                <span>Home Page</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </button>
              <a
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>Work (Projects)</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </a>
              <a
                href="/#services"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToHome();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>Services</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </a>
              <a
                href="/#features"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToHome();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>Features</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </a>
              <div className="pt-2 mt-1 border-t border-white/10">
                <a
                  href="/#contact-form"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBackToHome();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
                >
                  Work With Us
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Header */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-medium tracking-tight leading-[1.05] mb-6">
            Engineering & Design{' '}
            <span className="font-['Instrument_Serif'] italic text-white/60">
              collective
            </span>.
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A multidisciplinary collective of software engineers, systems architects, and creative technologists committed to building platforms that perform at the highest levels.
          </p>
        </motion.div>

        {/* Role Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {roles.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105'
                    : 'liquid-glass text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {role}
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Team Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence>
            {filteredMembers.map((member, idx) => {
              const meta = resolveTeamMemberMedia(member);

              return (
                <motion.article
                  layout
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <img
                            src={meta.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {member.name}
                          </h2>
                          <p className="text-white/40 text-xs sm:text-sm font-mono mt-1">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="liquid-glass rounded-full p-2.5 shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <p className="text-white/65 text-sm leading-relaxed mb-6">
                      {meta.bio}
                    </p>

                    {/* Specializations tags */}
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                      {meta.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social links & direct link */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl liquid-glass hover:text-white transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl liquid-glass hover:text-white transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl liquid-glass hover:text-white transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>

                    <a
                      href="/#contact-form"
                      onClick={onBackToHome}
                      className="liquid-glass rounded-full px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Connect
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Engineering Principles & Culture */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="liquid-glass rounded-3xl border border-white/10 p-8 sm:p-12 overflow-hidden">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl text-white font-medium tracking-tight leading-tight">
              Craftsmanship without compromise.{' '}
              <span className="font-['Instrument_Serif'] italic text-white/60">
                Speed, resilience, and clarity.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10 pt-10 border-t border-white/10">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Full-Spectrum Architecture</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                From micro-controllers and IoT hardware up to cloud servers, relational databases, and reactive SPAs, our team works cohesively across every tier.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Design-Led Rigor</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Code and aesthetics are unified. Every line of CSS and animation keyframe is engineered to respect brand hierarchy and visual rhythm.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Production Reliability</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Prepared queries, zero untrusted data leaks, and edge caching pipelines guarantee our platforms withstand high concurrency and rigorous security audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="liquid-glass rounded-3xl border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Build your vision with our team.
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Whether you need a dedicated technical partner to architect an entire platform or a specialized sprint to redesign an interface, we're ready to engineer what's next.
          </p>
          <a
            href="/#contact-form"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/10 hover:scale-105 cursor-pointer"
          >
            Start a Conversation <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4 sm:px-6 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} {settings?.footer_brand_text || 'NXTGEN'} Company. All rights reserved.
      </footer>
    </div>
  );
};
