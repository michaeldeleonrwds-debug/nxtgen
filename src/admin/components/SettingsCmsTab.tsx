import React, { useState } from 'react';
import {
  Settings,
  Save,
  Globe,
  Film,
  Phone,
  Share2,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { updateSettings } from '../api';

interface SettingsCmsTabProps {
  settings: Record<string, string>;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsCmsTab: React.FC<SettingsCmsTabProps> = ({
  settings,
  onRefresh,
  showToast,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    site_name: settings.site_name || 'NXTGEN STUDIO',
    site_tagline: settings.site_tagline || 'Engineering Digital Reality',
    site_description: settings.site_description || 'High-performance agency engineering custom software and web applications.',
    footer_brand_text: settings.footer_brand_text || 'NXTGEN',
    copyright_text: settings.copyright_text || '2026 NXTGEN Company. All rights reserved.',
    hero_badge: settings.hero_badge || 'NXTGEN STUDIO',
    hero_heading_1: settings.hero_heading_1 || "Build what's",
    hero_heading_italic: settings.hero_heading_italic || 'next',
    hero_subheading: settings.hero_subheading || 'Transforming ideas into scalable digital realities.',
    hero_video_url: settings.hero_video_url || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4',
    hero_cta_text: settings.hero_cta_text || 'Explore Services',
    hero_cta_url: settings.hero_cta_url || '#services',
    about_tagline: settings.about_tagline || 'ABOUT US',
    about_heading_part1: settings.about_heading_part1 || 'Engineering',
    about_heading_italic1: settings.about_heading_italic1 || 'solutions',
    about_heading_part2: settings.about_heading_part2 || 'for brands that',
    about_heading_italic2: settings.about_heading_italic2 || 'innovate, scale, and lead.',
    about_approach_text: settings.about_approach_text || 'We believe in the power of cutting-edge technology.',
    about_video_url: settings.about_video_url || 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
    contact_email: settings.contact_email || 'hello@nxtgen.studio',
    contact_phone: settings.contact_phone || '+63 917 123 4567',
    headquarters_line1: settings.headquarters_line1 || 'Cauayan City,',
    headquarters_line2: settings.headquarters_line2 || 'Cagayan Valley, Philippines',
    social_instagram: settings.social_instagram || 'https://instagram.com',
    social_twitter: settings.social_twitter || 'https://twitter.com',
    social_linkedin: settings.social_linkedin || 'https://linkedin.com',
    social_github: settings.social_github || 'https://github.com',
    social_facebook: settings.social_facebook || 'https://facebook.com',
    meta_title: settings.meta_title || 'NXTGEN Studio — Digital Engineering & Creative Technology',
    meta_description: settings.meta_description || 'Transforming ideas into scalable digital realities.',
    seo_keywords: settings.seo_keywords || 'Software Development, Web Apps, Mobile Apps, Creative Tech',
    default_og_image: settings.default_og_image || '/assets/sitelogo.webp',
  });

  const [activeCategory, setActiveCategory] = useState<'general' | 'hero' | 'about' | 'contact' | 'social' | 'seo'>('general');
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      showToast('Website settings saved successfully!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const navCategories = [
    { id: 'general', label: 'Identity & Brand', icon: Globe },
    { id: 'hero', label: 'Hero Section', icon: Film },
    { id: 'about', label: 'About Section', icon: Sparkles },
    { id: 'contact', label: 'Contact & Location', icon: Phone },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            Global Website Settings
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic site configuration stored in MySQL and served to the public landing page in real time.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {navCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
        {/* Category: General */}
        {activeCategory === 'general' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Brand Identity & Global Text
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Website Title / Name
                </label>
                <input
                  type="text"
                  value={formData.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Studio Tagline
                </label>
                <input
                  type="text"
                  value={formData.site_tagline}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Site Description
              </label>
              <textarea
                rows={3}
                value={formData.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Footer Big Brand Watermark Text
                </label>
                <input
                  type="text"
                  value={formData.footer_brand_text}
                  onChange={(e) => handleChange('footer_brand_text', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={formData.copyright_text}
                  onChange={(e) => handleChange('copyright_text', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category: Hero */}
        {activeCategory === 'hero' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Homepage Hero Section
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.hero_badge}
                  onChange={(e) => handleChange('hero_badge', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Heading Part 1
                </label>
                <input
                  type="text"
                  value={formData.hero_heading_1}
                  onChange={(e) => handleChange('hero_heading_1', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Heading Italic Accent
                </label>
                <input
                  type="text"
                  value={formData.hero_heading_italic}
                  onChange={(e) => handleChange('hero_heading_italic', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white font-serif italic focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hero Subheading Paragraph
              </label>
              <textarea
                rows={3}
                value={formData.hero_subheading}
                onChange={(e) => handleChange('hero_subheading', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hero Background Video (MP4 URL)
              </label>
              <input
                type="text"
                value={formData.hero_video_url}
                onChange={(e) => handleChange('hero_video_url', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Call to Action (CTA) Button Text
                </label>
                <input
                  type="text"
                  value={formData.hero_cta_text}
                  onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  CTA Button Target URL
                </label>
                <input
                  type="text"
                  value={formData.hero_cta_url}
                  onChange={(e) => handleChange('hero_cta_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category: About */}
        {activeCategory === 'about' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              About & Philosophy Section
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  About Badge Tagline
                </label>
                <input
                  type="text"
                  value={formData.about_tagline}
                  onChange={(e) => handleChange('about_tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  About Video URL
                </label>
                <input
                  type="text"
                  value={formData.about_video_url}
                  onChange={(e) => handleChange('about_video_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Philosophy & Approach Text
              </label>
              <textarea
                rows={3}
                value={formData.about_approach_text}
                onChange={(e) => handleChange('about_approach_text', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Category: Contact */}
        {activeCategory === 'contact' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Contact & Physical Headquarters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Phone / Hotline
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Headquarters Line 1
                </label>
                <input
                  type="text"
                  value={formData.headquarters_line1}
                  onChange={(e) => handleChange('headquarters_line1', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Headquarters Line 2
                </label>
                <input
                  type="text"
                  value={formData.headquarters_line2}
                  onChange={(e) => handleChange('headquarters_line2', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category: Social */}
        {activeCategory === 'social' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Social Media Accounts & Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.social_instagram}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={formData.social_twitter}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.social_linkedin}
                  onChange={(e) => handleChange('social_linkedin', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.social_github}
                  onChange={(e) => handleChange('social_github', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.social_facebook}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category: SEO */}
        {activeCategory === 'seo' && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Search Engine Optimization (SEO) & Social Sharing
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Meta Title (Browser Tab)
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                SEO Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => handleChange('seo_keywords', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Default OpenGraph Share Image URL
              </label>
              <input
                type="text"
                value={formData.default_og_image}
                onChange={(e) => handleChange('default_og_image', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-white/10 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
