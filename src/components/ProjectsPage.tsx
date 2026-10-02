import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import siteLogo from '../assets/sitelogo.webp';
import wallpaperImage from '../assets/Wallpaper.webp';
import webMobileImage from '../assets/web-mobile.webp';
import cmsNoCodeImage from '../assets/CMS & No code.webp';
import arduinoIotImage from '../assets/Arduino & Iot.webp';
import designBrandingImage from '../assets/Design and Branding.webp';
import type { ProjectItem } from '../admin/api';

export interface ProjectsPageProps {
  projects: ProjectItem[];
  settings?: Record<string, string>;
  onBackToHome: () => void;
}

export const resolveProjectImage = (url?: string, category?: string) => {
  if (url && (url.startsWith('http') || url.startsWith('/uploads'))) return url;
  if (url && url.includes('web-mobile')) return webMobileImage;
  if (url && url.includes('CMS')) return cmsNoCodeImage;
  if (url && url.includes('Arduino')) return arduinoIotImage;
  if (url && url.includes('Design')) return designBrandingImage;

  // Fallback based on category
  const cat = (category || '').toLowerCase();
  if (cat.includes('full stack') || cat.includes('cloud')) return webMobileImage;
  if (cat.includes('web application') || cat.includes('platform')) return cmsNoCodeImage;
  if (cat.includes('design') || cat.includes('ui')) return designBrandingImage;
  if (cat.includes('tooling') || cat.includes('iot')) return arduinoIotImage;

  return wallpaperImage;
};

export interface ProjectCardProps {
  project: ProjectItem;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const bgImg = resolveProjectImage(project.image_url, project.category);
  const tagList = project.tags
    ? project.tags.split(',').map((t) => t.trim())
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2), ease: 'easeOut' }}
      className="liquid-glass rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group hover:bg-white/[0.04]"
    >
      {/* Top Preview Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={bgImg}
          alt={project.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Category & Status Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="liquid-glass text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-white/90">
            {project.category}
          </span>

          <span className="liquid-glass text-xs font-medium px-3 py-1 rounded-full text-white/70">
            {project.status}
          </span>
        </div>

        {/* Client attribution if present */}
        {project.client && (
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-medium text-white/70 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              Client: {project.client}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-white/90 transition-colors">
            {project.title}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mt-3">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Pills & Link Footer */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tagList.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/70 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {project.demo_url && project.demo_url !== '#' ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors group/link"
              >
                <span>Explore Deliverable</span>
                <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Internal Architecture
              </span>
            )}

            <span className="text-xs text-white/30 font-mono">
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  settings,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [projects, selectedCategory]);

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
              Projects
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
              Contact Us
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
                href="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>Engineering & Design Team</span>
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
                  Start a Project
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Showcase Header */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-medium tracking-tight leading-[1.05] mb-6">
            Engineering{' '}
            <span className="font-['Instrument_Serif'] italic text-white/60">
              scalable digital realities
            </span>
            <br className="hidden sm:block" /> for brands that lead.
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Translating complex technical ambition into high-performance web platforms, custom software, and interactive brand systems.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105'
                    : 'liquid-glass text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Projects Showcase Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          >
            {filteredProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="py-24 text-center liquid-glass rounded-3xl border border-white/10 p-8">
            <Layers className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No projects found</h3>
            <p className="text-xs text-white/50 mt-1">
              There are currently no projects matching the category "{selectedCategory}".
            </p>
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="liquid-glass rounded-3xl border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Have a project in mind?
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Let's collaborate to build something exceptional. From initial architecture to final production launch, we engineer solutions built to scale.
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
