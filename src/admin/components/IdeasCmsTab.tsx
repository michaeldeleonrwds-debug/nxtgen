import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createIdea,
  updateIdea,
  deleteIdea,
  type IdeaItem,
} from '../api';

interface IdeasCmsTabProps {
  ideas: IdeaItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const IdeasCmsTab: React.FC<IdeasCmsTabProps> = ({
  ideas,
  onRefresh,
  showToast,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IdeaItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    sort_order: 0,
    is_active: 1,
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      sort_order: ideas.length + 1,
      is_active: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: IdeaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      sort_order: item.sort_order,
      is_active: item.is_active ? 1 : 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateIdea(editingItem.id, formData);
        showToast('Marquee idea updated', 'success');
      } else {
        await createIdea(formData);
        showToast('New marquee idea added', 'success');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleToggleActive = async (item: IdeaItem) => {
    const nextState = item.is_active ? 0 : 1;
    try {
      await updateIdea(item.id, { is_active: nextState });
      showToast(`Idea ${nextState ? 'enabled' : 'disabled'}`, 'success');
      onRefresh();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this marquee idea?')) return;
    try {
      await deleteIdea(id);
      showToast('Idea deleted', 'success');
      onRefresh();
    } catch {
      showToast('Failed to delete idea', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-pink-400" />
            Marquee Ideas & Capabilities
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic uppercase keyword badges cycling continuously across the public landing page marquee.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Idea Badge
        </button>
      </div>

      {/* Live Preview Strip */}
      <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/70 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">
          Live Marquee Preview:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {ideas
            .filter((i) => i.is_active)
            .map((i) => (
              <span
                key={i.id}
                className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs font-extrabold tracking-wider"
              >
                {i.title}
              </span>
            ))}
        </div>
      </div>

      {/* Ideas Grid - Cards have independent heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
        {ideas.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 bg-zinc-950/70 backdrop-blur-md transition-all flex items-center justify-between gap-2 self-start w-full ${
              item.is_active
                ? 'border-white/10 hover:border-pink-500/40'
                : 'border-white/5 opacity-50 bg-zinc-950/30'
            }`}
          >
            <div className="min-w-0">
              <span className="text-xs font-black tracking-wider text-white truncate block">
                {item.title}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Order: #{item.sort_order}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleToggleActive(item)}
                title={item.is_active ? 'Disable' : 'Enable'}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  item.is_active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
              <button
                onClick={() => openEditDialog(item)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 z-50 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                {editingItem ? 'Edit Marquee Idea' : 'Add Marquee Idea'}
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Idea / Keyword Title (Will be uppercased)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI AGENTS, CLOUD INFRASTRUCTURE"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white uppercase focus:outline-none focus:border-pink-500"
                />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Draft</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-pink-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Add Idea'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
