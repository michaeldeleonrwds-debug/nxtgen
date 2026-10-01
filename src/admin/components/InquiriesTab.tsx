import React, { useState } from 'react';
import {
  Mail,
  Trash2,
  Search,
  Send,
  MessageSquare,
} from 'lucide-react';
import {
  updateInquiryStatus,
  deleteInquiry,
  type Inquiry,
} from '../api';

interface InquiriesTabProps {
  inquiries: Inquiry[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const InquiriesTab: React.FC<InquiriesTabProps> = ({
  inquiries,
  onRefresh,
  showToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(
    inquiries.length > 0 ? inquiries[0] : null
  );

  const handleStatusChange = async (id: number, status: 'new' | 'read' | 'replied') => {
    try {
      await updateInquiryStatus(id, status);
      showToast(`Inquiry marked as ${status}`, 'success');
      onRefresh();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await deleteInquiry(id);
      showToast('Inquiry deleted', 'success');
      onRefresh();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    } catch {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  const filtered = inquiries.filter((inq) => {
    if (filter !== 'all' && inq.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-rose-400" />
            Contact Inquiries Inbox
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time messages submitted by potential clients and partners via the public website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'new', 'read', 'replied'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inbox 2-column layout - Independent column heights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Inquiries List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 backdrop-blur-md flex flex-col self-start w-full">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sender, email, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
            {filtered.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {inq.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        inq.status === 'new'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : inq.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 truncate mt-1">
                    {inq.email}
                  </p>
                  <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{inq.created_at}</span>
                    {inq.ip_address && (
                      <span className="font-mono">{inq.ip_address}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-zinc-500 text-xs">
                No inquiries matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* Selected Inquiry Detail (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-md flex flex-col justify-between self-start w-full">
          {selectedInquiry ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedInquiry.name}
                  </h3>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=RE: NXTGen Studio Inquiry`}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedInquiry.status === 'new'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedInquiry.status === 'replied'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    Status: {selectedInquiry.status}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Client Message
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block mb-1">Submitted At</span>
                  <span className="text-white font-mono">{selectedInquiry.created_at}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block mb-1">Client Origin IP</span>
                  <span className="text-white font-mono">{selectedInquiry.ip_address || '127.0.0.1'}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'read')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'replied')}
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 transition-colors cursor-pointer"
                  >
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'new')}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-400 transition-colors cursor-pointer"
                  >
                    Mark as New
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=RE: NXTGen Studio Inquiry&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThank you for reaching out to NXTGen Studio!`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center text-zinc-500">
              <MessageSquare className="w-12 h-12 mb-3 stroke-1 text-zinc-600" />
              <p className="text-sm font-semibold">Select an inquiry from the inbox</p>
              <p className="text-xs text-zinc-600 mt-1">Review contact requests and manage statuses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
