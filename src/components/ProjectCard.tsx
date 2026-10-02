import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import wallpaperImage from '../assets/Wallpaper.webp';
import webMobileImage from '../assets/web-mobile.webp';
import cmsNoCodeImage from '../assets/CMS & No code.webp';
import arduinoIotImage from '../assets/Arduino & Iot.webp';
import designBrandingImage from '../assets/Design and Branding.webp';
import type { ProjectItem } from '../admin/api';

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
      <div>
        <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-black/60">
          <img
            src={bgImg}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-white/90">
              {project.category}
            </span>
          </div>

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {project.status || 'Live'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
            {project.title}
          </h3>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 sm:mt-4">
              {tagList.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-white/5 text-white/70 border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-0 mt-2 sm:mt-4 flex items-center justify-between border-t border-white/5">
        <span className="text-[11px] sm:text-xs text-white/40 font-mono">
          Client: {project.client || 'Confidential'}
        </span>

        {project.demo_url && project.demo_url !== '#' ? (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Live Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-white/30 cursor-not-allowed">
            <span>Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
          </span>
        )}
      </div>
    </motion.article>
  );
};
