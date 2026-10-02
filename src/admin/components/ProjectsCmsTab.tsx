import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  ExternalLink,
} from 'lucide-react';
import {
  createProject,
  updateProject,
  deleteProject,
  uploadMedia,
  type ProjectItem,
} from '../api';

interface ProjectsCmsTabProps {
  projects: ProjectItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ProjectsCmsTab: React.FC<ProjectsCmsTabProps> = ({
  projects,
  onRefresh,
  showToast,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Stack & Cloud',
    description: '',
    tags: 'React, TypeScript, MySQL',
    status: 'Live',
    client: '',
    demo_url: '',
    image_url: '',
    sort_order: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Full Stack & Cloud',
      description: '',
      tags: 'React, TypeScript, MySQL',
      status: 'Live',
      client: '',
      demo_url: '',
      image_url: '',
      sort_order: projects.length + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ProjectItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      tags: item.tags,
      status: item.status,
      client: item.client || '',
      demo_url: item.demo_url || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadMedia(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image_url: res.url! }));
        showToast('Project image uploaded', 'success');
      } else {
        showToast(res.error || 'Upload failed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Project image upload failed', 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateProject(editingItem.id, formData);
        showToast('Project updated successfully', 'success');
      } else {
        await createProject(formData);
        showToast('New project created successfully', 'success');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      showToast('Project deleted', 'success');
      onRefresh();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-emerald-400" />
            Projects Showcase CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Publish client case studies, technical deliverables, tags, and live demos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Projects Grid - Cards have independent heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 p-5 bg-zinc-950/70 hover:border-emerald-500/40 backdrop-blur-md transition-all flex flex-col justify-between self-start w-full"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {item.category}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.status === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #{item.sort_order}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
              {item.client && (
                <p className="text-xs text-emerald-400 font-medium mb-2">
                  Client: {item.client}
                </p>
              )}
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/5"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
              {item.demo_url && item.demo_url !== '#' ? (
                <a
                  href={item.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Demo
                </a>
              ) : (
                <span className="text-xs text-zinc-500">Internal Showcase</span>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditDialog(item)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Edit Project"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
            No projects found matching "{search}".
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 z-50 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                {editingItem ? 'Edit Project' : 'Add New Project'}
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NXTGen Digital Ecosystem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack & Cloud"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Live">Live</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Client / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. NXTGen Core, LaunchPad Studio"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tech Stack / Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, PHP, MariaDB"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize the core technical solution and business impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Demo URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com or #"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Project Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/uploads/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
