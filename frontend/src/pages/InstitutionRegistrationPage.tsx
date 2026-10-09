import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
  Mail,
  User,
  MapPin,
  Hash,
  Layers,
  ArrowLeft,
  Server,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export const InstitutionRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    code: '',
    location: '',
    contact_email: '',
    admin_name: '',
    website: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
        password: 'admin123',
        confirmPassword: 'admin123',
        code: 'AIT-101',
        location: 'Bangalore, Karnataka',
        contact_email: 'placements@apex.edu',
        admin_name: 'Dr. K. S. Sharma',
        website: 'https://apex.edu'
      });
    } else {
      setFormData({
        name: 'National Institute of Technology',
        username: `nit-${Math.floor(Math.random() * 900 + 100)}`,
        password: 'admin123',
        confirmPassword: 'admin123',
        code: 'NIT-SUR',
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

    if (!formData.password || formData.password.length < 6) {
      setError('Please choose a secure admin password with at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created = await api.createInstitution({
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        code: formData.code.trim() || undefined,
        location: formData.location.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        admin_name: formData.admin_name.trim() || undefined,
        website: formData.website.trim() || undefined
      });

      // Save to institution session
      authService.setLoggedInInstitution(created);

      // Instant unlock: navigate directly to the college dashboard
      navigate(`/${created.username || created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register institution. Username might already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://campuslink.edu';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Navigation & Context Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Global Gateway</span>
          </button>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Multi-Tenant Node Provisioning</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Register Institution Campus
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Provision a sovereign placement workspace with isolated student rosters, custom recruiter intake links, and deterministic ranking engines.
          </p>
        </div>

        {/* Demo Hydration Presets */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">Hydrate Demo:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('apex')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 text-xs font-mono text-slate-300 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>@apex-demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('mit')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 text-xs font-mono text-slate-300 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>@nit-demo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Spacious 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Inspector: Live Vanity URL & Telemetry Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* Live Node Dossier Preview */}
          <div className="p-6 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Live Dossier Preview</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                STAGING
              </span>
            </div>

            <div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Institution Entity</div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                {formData.name || 'Your University / College Name'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-xs text-slate-300">
                  {formData.code || 'CODE-PENDING'}
                </span>
                {formData.location && (
                  <span className="flex items-center space-x-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{formData.location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Permanent Vanity Subpath Generator */}
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>VANITY TENANT PATH</span>
                <span className="text-emerald-400 font-semibold">Active Slug</span>
              </div>
              <div className="font-mono text-xs text-emerald-300 break-all select-all flex items-center space-x-1.5">
                <span className="text-slate-500">{originUrl}/</span>
                <span className="font-bold underline decoration-emerald-500/40">
                  {formData.username || 'college-slug'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                This vanity URL will anchor your primary placement dashboard and all child intake gateways.
              </p>
            </div>

            {/* Auto-Generated Child Gateways */}
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Generated Intake Gateways</div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Student Intake</span>
                <span className="text-slate-300">/{formData.username || 'slug'}/student-registration</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Recruiter Ingest</span>
                <span className="text-slate-300">/{formData.username || 'slug'}/recruiter-registration</span>
              </div>
            </div>

            {/* Placement Officer Info */}
            {formData.admin_name && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center space-x-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Placement Lead: <strong className="text-white">{formData.admin_name}</strong></span>
              </div>
            )}
          </div>

          {/* Architecture Isolation Telemetry */}
          <div className="p-5 rounded-3xl bg-[#0E111A] border border-white/[0.08] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Architecture Guarantee</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Strict Data Boundary:</strong> Student records and recruitment cutoffs are partitioned by unique tenant ID.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Zero Token Intelligence:</strong> All candidate scoring and 6-factor evaluations run locally with zero API billing.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Resilient Persistence:</strong> Automatic failover between PostgreSQL primary and embedded SQLite.</span>
              </li>
            </ul>
          </div>

          {/* Fast-Track Mode Notice */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">Fast-Track Provisioning:</span> DNS verification and email OTP are currently bypassed for instant sandbox workspace creation.
            </div>
          </div>
        </div>

        {/* Right Structured Form Deck (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Institutional Identity */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  01
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Institutional Identity & Vanity Slug</h2>
                  <p className="text-xs text-slate-400">Official legal entity name and vanity routing handle.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Official College Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    OFFICIAL COLLEGE / UNIVERSITY NAME <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Apex Institute of Technology"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Username / URL Slug */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    PERMANENT COLLEGE HANDLE / SLUG <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-emerald-400 font-mono text-sm font-semibold">@</span>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder="e.g. apex-inst or mit-campus"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-2 flex items-center space-x-1.5">
                    <span>Public Routing URL:</span>
                    <span className="text-emerald-400">
                      {originUrl}/{formData.username || '<college-handle>'}
                    </span>
                  </div>
                </div>

                {/* Institution Code */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    INSTITUTION / ACCREDITATION CODE
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="code"
                      placeholder="e.g. AIT-101 or NAAC-A++"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Campus Location */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    CAMPUS GEOGRAPHIC LOCATION
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Bangalore, Karnataka"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Administrative Governance */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Administrative Governance & Contacts</h2>
                  <p className="text-xs text-slate-400">Designated Training & Placement Officer credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Dean / TPO Name */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    PLACEMENT OFFICER / DEAN NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="admin_name"
                      placeholder="e.g. Dr. K. S. Sharma"
                      value={formData.admin_name}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    OFFICIAL PLACEMENT EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="contact_email"
                      placeholder="e.g. placements@apex.edu"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Institution Website */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    OFFICIAL UNIVERSITY DOMAIN / PORTAL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      name="website"
                      placeholder="e.g. https://apex.edu"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Admin Console Security & Password */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  03
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Administrator Access Password</h2>
                  <p className="text-xs text-slate-400">Restricts control desk access strictly to authorized placement officers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Admin Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono font-medium text-slate-300">
                      ADMIN MASTER PASSWORD <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    CONFIRM ADMIN PASSWORD <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Bar */}
            <div className="p-6 rounded-3xl bg-[#0E111A] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors order-2 sm:order-1"
              >
                ← Cancel & Return
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Provisioning Institution Node...</span>
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
    </div>
  );
};
