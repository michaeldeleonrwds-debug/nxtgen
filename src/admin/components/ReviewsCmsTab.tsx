import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createReview,
  updateReview,
  deleteReview,
  uploadMedia,
  type ReviewItem,
} from '../api';

interface ReviewsCmsTabProps {
  reviews: ReviewItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReviewsCmsTab: React.FC<ReviewsCmsTabProps> = ({
  reviews,
  onRefresh,
  showToast,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    role: '',
    quote: '',
    project: '',
    rating: 5,
    review_date: 'Recently',
    avatar_url: '',
    sort_order: 0,
    is_active: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      client_name: '',
      role: '',
      quote: '',
      project: '',
      rating: 5,
      review_date: 'Recently',
      avatar_url: '',
      sort_order: reviews.length + 1,
      is_active: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ReviewItem) => {
    setEditingItem(item);
    setFormData({
      client_name: item.client_name,
      role: item.role,
      quote: item.quote,
      project: item.project,
      rating: item.rating,
      review_date: item.review_date,
      avatar_url: item.avatar_url || '',
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
        setFormData((prev) => ({ ...prev, avatar_url: res.url! }));
        showToast('Avatar uploaded', 'success');
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
    if (!formData.client_name.trim() || !formData.quote.trim()) {
      showToast('Client name and testimonial quote are required', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateReview(editingItem.id, formData);
        showToast('Review updated successfully', 'success');
      } else {
        await createReview(formData);
        showToast('New review added successfully', 'success');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleToggleActive = async (item: ReviewItem) => {
    const nextState = item.is_active ? 0 : 1;
    try {
      await updateReview(item.id, { is_active: nextState });
      showToast(`Review ${nextState ? 'published' : 'hidden'}`, 'success');
      onRefresh();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this client review?')) return;
    try {
      await deleteReview(id);
      showToast('Review deleted', 'success');
      onRefresh();
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const filtered = reviews.filter(
    (r) =>
      r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.quote.toLowerCase().includes(search.toLowerCase()) ||
      r.project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400" />
            Client Reviews CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Showcase authentic client testimonials, ratings, and feedback on the public landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      {/* Reviews Grid - Cards have independent heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 bg-zinc-950/70 backdrop-blur-md transition-all flex flex-col justify-between self-start w-full ${
              item.is_active
                ? 'border-white/10 hover:border-amber-500/40'
                : 'border-white/5 opacity-60 bg-zinc-950/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating ? 'fill-amber-400' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
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

              <p className="text-xs text-zinc-300 leading-relaxed italic mb-4">
                "{item.quote}"
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">{item.client_name}</h4>
                <p className="text-[11px] text-zinc-400">{item.role}</p>
                {item.project && (
                  <p className="text-[10px] text-amber-400/80 mt-0.5">{item.project}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEditDialog(item)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Edit Review"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
            No client reviews found.
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
                <Star className="w-5 h-5 text-amber-400" />
                {editingItem ? 'Edit Review' : 'Add Client Review'}
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arielle Santos"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Role / Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Founder, LaunchPad Studio"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Project Engagement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product strategy & web platform"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Testimonial Quote
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="The feedback from the client..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Great)</option>
                    <option value={3}>3 Stars (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Date Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 weeks ago"
                    value={formData.review_date}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Client Avatar / Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/uploads/... or image URL"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>Active (Visible)</option>
                    <option value={0}>Draft (Hidden)</option>
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
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer transition-all shadow-lg shadow-amber-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
