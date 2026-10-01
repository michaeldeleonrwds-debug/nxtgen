import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createService,
  updateService,
  deleteService,
  uploadMedia,
  type ServiceItem,
} from '../api';

interface ServicesCmsTabProps {
  services: ServiceItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ServicesCmsTab: React.FC<ServicesCmsTabProps> = ({
  services,
  onRefresh,
  showToast,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState({
    tag: 'Development',
    title: '',
    description: '',
    image_url: 'web-mobile.webp',
    sort_order: 0,
    is_active: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      tag: 'Development',
      title: '',
      description: '',
      image_url: 'web-mobile.webp',
      sort_order: services.length + 1,
      is_active: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      tag: item.tag,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
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
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast(res.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateService(editingItem.id, formData);
        showToast('Service updated successfully', 'success');
      } else {
        await createService(formData);
        showToast('New service created successfully', 'success');
      }
      setIsDialogOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleToggleActive = async (item: ServiceItem) => {
    const nextState = item.is_active ? 0 : 1;
    try {
      await updateService(item.id, { is_active: nextState });
      showToast(`Service ${nextState ? 'enabled' : 'disabled'}`, 'success');
      onRefresh();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      showToast('Service deleted', 'success');
      onRefresh();
    } catch {
      showToast('Failed to delete service', 'error');
    }
  };

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.tag.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            Services CMS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage agency capabilities, descriptions, showcase artwork, and live visibility on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Services Grid - Cards have independent heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 bg-zinc-950/70 backdrop-blur-md transition-all flex flex-col justify-between self-start w-full ${
              item.is_active
                ? 'border-white/10 hover:border-cyan-500/40'
                : 'border-white/5 opacity-60 bg-zinc-950/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                  {item.tag}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Order: #{item.sort_order}
                  </span>
                  <button
                    onClick={() => handleToggleActive(item)}
                    title={item.is_active ? 'Click to deactivate' : 'Click to activate'}
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

              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-500 truncate max-w-[200px]" title={item.image_url}>
                Asset: {item.image_url}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditDialog(item)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Edit Service"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
            No services found matching "{search}".
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 z-50 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                {editingItem ? 'Edit Service' : 'Add New Service'}
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Category Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Development, Platforms, Hardware, Creative"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Service Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web & Mobile Apps"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide a detailed description of this service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Artwork / Image Asset
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="web-mobile.webp or /uploads/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Visibility Status
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
