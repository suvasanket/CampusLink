import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { Building2, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Globe, Mail, User, MapPin, Hash } from 'lucide-react';

export const InstitutionRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    code: '',
    location: '',
    contact_email: '',
    admin_name: '',
    website: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      // Auto-format slug: lowercase alphanumeric, dashes, underscores
      setFormData(prev => ({
        ...prev,
        username: value.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuickFill = (preset: 'apex' | 'mit') => {
    if (preset === 'apex') {
      setFormData({
        name: 'Apex Institute of Technology',
        username: `apex-${Math.floor(Math.random() * 900 + 100)}`,
        code: 'AIT',
        location: 'Bangalore, Karnataka',
        contact_email: 'placements@apex.edu',
        admin_name: 'Dr. K. S. Sharma',
        website: 'https://apex.edu'
      });
    } else {
      setFormData({
        name: 'National Institute of Technology',
        username: `nit-${Math.floor(Math.random() * 900 + 100)}`,
        code: 'NIT',
        location: 'Surathkal, Karnataka',
        contact_email: 'dean.placements@nit.edu',
        admin_name: 'Prof. Anand Rao',
        website: 'https://nitk.ac.in'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      setError('Please provide institution name and college username.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await api.createInstitution({
        name: formData.name.trim(),
        username: formData.username.trim(),
        code: formData.code.trim() || undefined,
        location: formData.location.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        admin_name: formData.admin_name.trim() || undefined,
        website: formData.website.trim() || undefined
      });

      // Save to institution session
      authService.setLoggedInInstitution(created);

      // Instant unlock: navigate directly to the college dashboard!
      navigate(`/${created.username || created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register institution. Username might already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://campuslink.edu';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Multi-Tenant Institution Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Register Your College or University
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Unlock a dedicated institution dashboard, referral student links, and recruiter management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('apex')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700"
            >
              Demo Fill #1
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('mit')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-violet-300 border border-slate-700"
            >
              Demo Fill #2
            </button>
          </div>
        </div>

        {/* Security / OTP Notice */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-indigo-300">Fast-Track Mode:</span> Email OTP verification is bypassed for instant workspace creation and testing.
            <div className="text-slate-400 text-[11px] mt-0.5">
              (Production Security Plan: 6-digit DNS/email OTP verifies official institution domain ownership).
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* College Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official College / Institution Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Apex Institute of Technology"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Username / URL Slug */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                College Username / Slug (Your Permanent URL) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono">@</span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. apex-inst or mit-campus"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                <span>Your dashboard will unlock at:</span>
                <span className="text-indigo-400 font-mono font-medium">
                  {originUrl}/{formData.username || '&lt;college-username&gt;'}
                </span>
              </div>
            </div>

            {/* Institution Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institution Code (Optional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. AIT-101"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Campus Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bangalore, Karnataka"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Administrator / Dean Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Placement Officer / Dean Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="admin_name"
                  placeholder="e.g. Dr. K. S. Sharma"
                  value={formData.admin_name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Placement Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="contact_email"
                  placeholder="e.g. placements@apex.edu"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Official Website */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institution Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  name="website"
                  placeholder="e.g. https://apex.edu"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to Overview
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Institution...</span>
                </>
              ) : (
                <>
                  <span>Create & Launch College Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
