import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  uploadMedia,
  type TeamMember,
} from '../api';

interface TeamCmsTabProps {
  team: TeamMember[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TeamCmsTab: React.FC<TeamCmsTabProps> = ({
  team,
  onRefresh,
  showToast,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    initials: '',
    image_url: '',
    social_links: '',
    sort_order: 0,
    is_active: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      initials: '',
      image_url: '',
      social_links: '',
      sort_order: team.length + 1,
      is_active: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: TeamMember) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      bio: item.bio || '',
      initials: item.initials,
      image_url: item.image_url || '',
      social_links: item.social_links || '',
      sort_order: item.sort_order,
      is_active: item.is_active ? 1 : 0,
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
        showToast('Photo uploaded', 'success');
      } else {
        showToast(res.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Upload error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showToast('Name and role are required', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateTeam(editingItem.id, formData);
        showToast('Team member updated', 'success');
      } else {
        await createTeam(formData);
        showToast('Team member added', 'success');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleToggleActive = async (item: TeamMember) => {
    const nextState = item.is_active ? 0 : 1;
    try {
      await updateTeam(item.id, { is_active: nextState });
      showToast(`Team member ${nextState ? 'published' : 'hidden'}`, 'success');
      onRefresh();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await deleteTeam(id);
      showToast('Team member removed', 'success');
      onRefresh();
    } catch {
      showToast('Failed to delete team member', 'error');
    }
  };

  const filtered = team.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-violet-400" />
            Team Members CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage engineers, creative directors, initials, roles, and profiles shown in the footer and about section.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Team Grid - Cards have independent heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 bg-zinc-950/70 backdrop-blur-md transition-all flex flex-col justify-between self-start w-full ${
              item.is_active
                ? 'border-white/10 hover:border-violet-500/40'
                : 'border-white/5 opacity-60 bg-zinc-950/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 flex items-center justify-center font-bold font-mono text-violet-300 text-base shadow-inner">
                  {item.initials}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    #{item.sort_order}
                  </span>
                  <button
                    onClick={() => handleToggleActive(item)}
                    title={item.is_active ? 'Click to hide' : 'Click to publish'}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      item.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-violet-400 font-medium mb-3">{item.role}</p>

              {item.bio && (
                <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-3">
                  {item.bio}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-1.5">
              <button
                onClick={() => openEditDialog(item)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Edit Member"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title="Delete Member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
            No team members found.
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
                <Users className="w-5 h-5 text-violet-400" />
                {editingItem ? 'Edit Team Member' : 'Add Team Member'}
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael de Leon"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Role / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Engineer & Tech Lead"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Initials (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    maxLength={4}
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white font-mono uppercase focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Bio / Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief background and specialties..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Profile Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/uploads/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? '...' : 'Upload'}
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

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Visibility
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value={1}>Active (Visible)</option>
                  <option value={0}>Draft (Hidden)</option>
                </select>
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
                  className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-violet-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
