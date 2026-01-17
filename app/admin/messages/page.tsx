'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Inbox, Check, Archive, Trash2, Search, Loader2, 
  Clock, Eye, Reply, ChevronDown, X, ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ConfirmModal } from '@/components/ui/Modal';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Inbox },
  read: { label: 'Read', color: 'bg-amber-100 text-amber-700', icon: Eye },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: Reply },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500', icon: Archive },
};

export default function AdminMessagesPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: ContactSubmission['status']) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSubmissions(submissions.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    }
    setDeleteId(null);
  };

  const openSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    // Mark as read if pending
    if (submission.status === 'pending') {
      updateStatus(submission.id, 'read');
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-text-dark flex items-center gap-3">
            <Mail className="w-7 h-7 text-terracotta" />
            Messages
          </h1>
          <p className="text-text-muted mt-1">
            {submissions.length} total • {pendingCount} unread
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-clay/20 bg-cream focus:outline-none focus:border-terracotta"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'New', count: pendingCount },
            { value: 'read', label: 'Read' },
            { value: 'replied', label: 'Replied' },
            { value: 'archived', label: 'Archived' },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-terracotta text-white'
                  : 'bg-sand text-text-dark hover:bg-clay/20'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-white rounded-2xl shadow-sm border border-clay/10 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
              <p className="text-text-muted">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-clay/10 max-h-[600px] overflow-y-auto">
              {filteredSubmissions.map((submission) => {
                const config = statusConfig[submission.status];
                const isSelected = selectedSubmission?.id === submission.id;
                const isUnread = submission.status === 'pending';
                
                return (
                  <motion.button
                    key={submission.id}
                    onClick={() => openSubmission(submission)}
                    className={`w-full text-left p-4 hover:bg-sand/50 transition-colors ${
                      isSelected ? 'bg-terracotta/5 border-l-4 border-terracotta' : ''
                    } ${isUnread ? 'bg-blue-50/50' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${isUnread ? 'bg-terracotta' : 'bg-sand'} flex items-center justify-center flex-shrink-0`}>
                        <span className={`font-medium ${isUnread ? 'text-white' : 'text-text-muted'}`}>
                          {submission.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium truncate ${isUnread ? 'text-text-dark' : 'text-text-muted'}`}>
                            {submission.name}
                          </p>
                          <span className="text-xs text-text-muted flex-shrink-0">
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isUnread ? 'font-medium text-text-dark' : 'text-text-muted'}`}>
                          {submission.subject}
                        </p>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {submission.message}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-clay/10 overflow-hidden">
          {selectedSubmission ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-clay/10 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-dark">{selectedSubmission.name}</h3>
                  <a 
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-sm text-terracotta hover:underline flex items-center gap-1"
                  >
                    {selectedSubmission.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-sand rounded-lg lg:hidden"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Subject & Status */}
              <div className="p-4 border-b border-clay/10 bg-sand/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Subject</p>
                    <p className="font-medium text-text-dark capitalize">{selectedSubmission.subject.replace(/-/g, ' ')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedSubmission.status].color}`}>
                    {statusConfig[selectedSubmission.status].label}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedSubmission.created_at).toLocaleString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-text-dark whitespace-pre-wrap leading-relaxed">
                  {selectedSubmission.message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-clay/10 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  onClick={() => updateStatus(selectedSubmission.id, 'replied')}
                  className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-xl text-sm font-medium hover:bg-terracotta-dark transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </a>
                
                {selectedSubmission.status !== 'archived' && (
                  <button
                    onClick={() => updateStatus(selectedSubmission.id, 'archived')}
                    className="flex items-center gap-2 px-4 py-2 bg-sand text-text-dark rounded-xl text-sm font-medium hover:bg-clay/30 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                )}

                <button
                  onClick={() => setDeleteId(selectedSubmission.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center">
                <Mail className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
