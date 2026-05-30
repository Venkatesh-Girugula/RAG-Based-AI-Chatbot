import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MessageSquare, 
  Database, 
  BarChart2, 
  Settings, 
  Users, 
  Activity, 
  User, 
  LogOut,
  Cpu,
  HelpCircle,
  Menu,
  X,
  Sliders,
  ShieldAlert,
  Fingerprint,
  RefreshCw,
  Search,
  SlidersHorizontal,
  FolderLock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatArea from '../components/chat/ChatArea';
import UploadZone from '../components/knowledge/UploadZone';
import DocumentTable from '../components/knowledge/DocumentTable';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';

export const DashboardPage: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    logout,
    users,
    suspendUser,
    activateUser,
    changeUserRole,
    auditLogs,
    systemHealth,
    triggerSystemHealthRefresh,
    modelSettings,
    updateModelSettings,
    resetModelSettings
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile preferences local states
  const [profileName, setProfileName] = useState(currentUser?.name || 'Venkat Raman');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'venky@enterprise.io');
  const [profilePass, setProfilePass] = useState('');
  const [profileLang, setProfileLang] = useState('English');
  const [profileTheme, setProfileTheme] = useState('Dark');
  const [profile2FA, setProfile2FA] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Corporate Profile credentials saved and encrypted successfully.');
  };

  const navItems = [
    { id: 'chat', label: 'Chat Workspace', icon: <MessageSquare className="h-4.5 w-4.5" />, roles: ['User', 'Moderator', 'Admin'] },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database className="h-4.5 w-4.5" />, roles: ['User', 'Moderator', 'Admin'] },
    { id: 'admin', label: 'Admin Dashboard', icon: <BarChart2 className="h-4.5 w-4.5" />, roles: ['Admin'] },
    { id: 'analytics', label: 'Token Analytics', icon: <Cpu className="h-4.5 w-4.5" />, roles: ['Admin'] },
    { id: 'users', label: 'User Management', icon: <Users className="h-4.5 w-4.5" />, roles: ['Admin'] },
    { id: 'model', label: 'Model Settings', icon: <Sliders className="h-4.5 w-4.5" />, roles: ['Moderator', 'Admin'] },
    { id: 'system', label: 'System Monitoring', icon: <Activity className="h-4.5 w-4.5" />, roles: ['Admin'] },
    { id: 'profile', label: 'Profile Settings', icon: <User className="h-4.5 w-4.5" />, roles: ['User', 'Moderator', 'Admin'] },
  ] as const;

  // Filter nav items by current user role
  const userRole = currentUser?.role || 'User';
  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden relative">
      
      {/* Dynamic background neon orbs */}
      <div className="glow-bg bg-brand-500/5 w-[500px] h-[500px] -top-40 -left-40 animate-pulse" />
      <div className="glow-bg bg-indigo-500/5 w-[600px] h-[600px] -bottom-40 -right-40" />

      {/* --- ENTERPRISE MASTER SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/70 backdrop-blur-md flex flex-col z-20 shrink-0 hidden lg:flex">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AeroRAG Gateway
              </h1>
              <p className="text-[9px] text-brand-400 tracking-wider uppercase font-semibold">
                Enterprise v1.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Queue */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {visibleNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                  isActive 
                    ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 shadow-glass' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center text-xs font-bold text-slate-100 ${currentUser?.avatarColor || 'bg-brand-600'}`}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-300 truncate">{currentUser?.name || 'Venkat Raman'}</div>
              <div className="text-[9px] text-brand-400 font-semibold uppercase font-mono">{currentUser?.role || 'Admin'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Authenticate SignOut"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* --- DASHBOARD VIEW WRAPPER --- */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
        
        {/* Absolute Header Bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-200 capitalize tracking-wide">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>

          {/* Active health indicator banner */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-mono">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400 hidden sm:inline">RAG Engine:</span>
              <span className="text-emerald-400 font-bold uppercase">Ready</span>
            </div>
          </div>
        </header>

        {/* --- MAIN PAGE TABS PANEL SWITCH --- */}
        <div className="flex-1 overflow-hidden relative flex h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full flex h-full overflow-hidden"
            >
              
              {/* 1. CHAT WORKSPACE TAB */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex overflow-hidden h-full">
                  <ChatSidebar />
                  <ChatArea />
                </div>
              )}

              {/* 2. KNOWLEDGE BASE TAB */}
              {activeTab === 'knowledge' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
                  <div className="p-6 glass-panel border border-slate-900 rounded-2xl shadow-glass space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Index Knowledge Corpus</h2>
                      <p className="text-[10px] text-slate-500">Provide official guidelines for grounding AI responses</p>
                    </div>
                    <UploadZone />
                  </div>
                  <DocumentTable />
                </div>
              )}

              {/* 3. ADMIN PANEL OVERVIEW TAB */}
              {activeTab === 'admin' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: 'API Requests', val: '2,942', pct: '+12.4%', color: 'text-brand-400' },
                      { title: 'Success Rate', val: '99.88%', pct: '+0.02%', color: 'text-emerald-400' },
                      { title: 'Total Tokens', val: '1.45M', pct: '+8.1%', color: 'text-indigo-400' },
                      { title: 'Total Documents', val: '12 docs', pct: '+3 docs', color: 'text-amber-400' }
                    ].map((card, i) => (
                      <div key={i} className="glass-panel border border-slate-900 rounded-2xl p-4.5 shadow-glass">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">{card.title}</span>
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-md font-extrabold text-slate-100 font-mono">{card.val}</h3>
                          <span className={`text-[9px] font-bold font-mono ${card.color}`}>{card.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit logs & activity panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5 shadow-glass space-y-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">System Security Audit Logs</span>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-400">
                          <thead>
                            <tr className="border-b border-slate-900 pb-2 text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                              <th className="py-2.5">User</th>
                              <th className="py-2.5">Security Action</th>
                              <th className="py-2.5">Timestamp</th>
                              <th className="py-2.5 text-right">IP Address</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/60 font-mono">
                            {auditLogs.map(log => (
                              <tr key={log.id} className="hover:bg-slate-900/10">
                                <td className="py-3 font-semibold text-slate-300">{log.userName}</td>
                                <td className="py-3 text-slate-400 leading-normal">{log.action}</td>
                                <td className="py-3 text-slate-500">{log.timestamp}</td>
                                <td className="py-3 text-slate-500 text-right">{log.ipAddress}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="glass-panel border border-slate-900 rounded-2xl p-5 shadow-glass space-y-4 text-center">
                      <FolderLock className="h-10 w-10 text-brand-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-200">Compliance & Guardrails</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                        This system operates under secure TLS v1.3 encryption. Similarity thresholding is locked at **0.75** for general users. Administrative overrides and vector purges are captured in security audit records.
                      </p>
                      <div className="text-[9px] bg-slate-950 p-2.5 rounded-xl border border-slate-900 font-mono text-slate-600 text-left leading-normal">
                        <strong>Security Standards:</strong>
                        <br />
                        - AES-256 Vector Metadata Encryption
                        <br />- Auto-Trimming Conversation History
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TOKEN MONITORING TAB */}
              {activeTab === 'analytics' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
                  <AnalyticsCharts />
                </div>
              )}

              {/* 5. USER MANAGEMENT TAB */}
              {activeTab === 'users' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Active User Base</h2>
                      <p className="text-[10px] text-slate-500">Manage identity role credentials and suspension codes</p>
                    </div>

                    {/* Search user */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full py-2 pl-9 pr-4 rounded-xl glass-input text-xs text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-glass">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900/20">
                            <th className="py-4 px-4.5">User Identity</th>
                            <th className="py-4 px-4">Role Context</th>
                            <th className="py-4 px-4 text-center">Status</th>
                            <th className="py-4 px-4">Joined Date</th>
                            <th className="py-4 px-4.5 text-right">Access Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/40 text-xs text-slate-300">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-900/10">
                              <td className="py-3.5 px-4.5">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white ${user.avatarColor}`}>
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-200">{user.name}</div>
                                    <div className="text-[10px] text-slate-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <select
                                  value={user.role}
                                  onChange={(e) => changeUserRole(user.id, e.target.value as any)}
                                  className="bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[10px] text-slate-300 cursor-pointer focus:border-brand-500 outline-none"
                                >
                                  <option value="User">User Access</option>
                                  <option value="Moderator">Moderator Access</option>
                                  <option value="Admin">System Administrator</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  user.status === 'Active' 
                                    ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-950/80 border border-rose-500/20 text-rose-400'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-500">{user.joinedDate}</td>
                              <td className="py-3.5 px-4.5 text-right">
                                {user.status === 'Active' ? (
                                  <button
                                    onClick={() => suspendUser(user.id)}
                                    className="text-[10px] font-bold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-300 transition-all cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => activateUser(user.id)}
                                    className="text-[10px] font-bold bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 transition-all cursor-pointer"
                                  >
                                    Activate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. MODEL SETTINGS TAB */}
              {activeTab === 'model' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
                  <div className="glass-panel border border-slate-900 rounded-2xl p-6 shadow-glass space-y-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">AI Model &amp; Retrieval Tuning</h2>
                      <p className="text-[10px] text-slate-500">Fine-tune generative limits, sliding chunk spans, and cosine searches</p>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Model selector */}
                      <div>
                        <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Gemini Model Selection</label>
                        <select
                          value={modelSettings.modelName}
                          onChange={(e) => updateModelSettings({ modelName: e.target.value })}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 focus:border-brand-500 outline-none cursor-pointer"
                        >
                          <option value="models/gemini-2.5-flash">Gemini 2.5 Flash (Production Default)</option>
                          <option value="models/gemini-2.0-flash">Gemini 2.0 Flash (Beta Sandbox)</option>
                          <option value="models/gemini-3.5-flash">Gemini 3.5 Flash (Futuristic Workspace)</option>
                        </select>
                      </div>

                      {/* Temperature Slider */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-semibold text-slate-400 font-mono uppercase tracking-wider text-[10px]">Temperature (Randomness)</label>
                          <span className="font-mono text-brand-400 font-bold">{modelSettings.temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.1"
                          value={modelSettings.temperature}
                          onChange={(e) => updateModelSettings({ temperature: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                      </div>

                      {/* Retrieval similarity Threshold */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-semibold text-slate-400 font-mono uppercase tracking-wider text-[10px]">Cosine Similarity Threshold</label>
                          <span className="font-mono text-emerald-400 font-bold">{(modelSettings.retrievalThreshold * 100).toFixed(0)}% Match</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="0.95"
                          step="0.05"
                          value={modelSettings.retrievalThreshold}
                          onChange={(e) => updateModelSettings({ retrievalThreshold: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                        <span className="text-[10px] text-slate-500 leading-normal block mt-1">
                          Calculations are executed as 1.0 - Cosine Distance. Queries yielding similarity scores below {modelSettings.retrievalThreshold} trigger immediate search failure safeguards.
                        </span>
                      </div>

                      {/* Chunk size and overlap */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Chunk character size</label>
                          <input
                            type="number"
                            value={modelSettings.chunkSize}
                            onChange={(e) => updateModelSettings({ chunkSize: parseInt(e.target.value) || 500 })}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Chunk overlap</label>
                          <input
                            type="number"
                            value={modelSettings.chunkOverlap}
                            onChange={(e) => updateModelSettings({ chunkOverlap: parseInt(e.target.value) || 50 })}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300 font-mono"
                          />
                        </div>
                      </div>

                      {/* Top P & Top K */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Top P Nucleus</label>
                          <input
                            type="number"
                            step="0.05"
                            value={modelSettings.topP}
                            onChange={(e) => updateModelSettings({ topP: parseFloat(e.target.value) || 0.95 })}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Top K Candidates</label>
                          <input
                            type="number"
                            value={modelSettings.topK}
                            onChange={(e) => updateModelSettings({ topK: parseInt(e.target.value) || 40 })}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300 font-mono"
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                        <button
                          onClick={resetModelSettings}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all font-semibold cursor-pointer"
                        >
                          Reset Defaults
                        </button>
                        <button
                          onClick={() => alert('Model parameters updated successfully in active context.')}
                          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md hover:shadow-brand-500/10 transition-all cursor-pointer"
                        >
                          Commit Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SYSTEM MONITORING TAB */}
              {activeTab === 'system' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
                  <div className="glass-panel border border-slate-900 rounded-2xl p-6 shadow-glass space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-200">Real-time Gateway Status</h2>
                        <p className="text-[10px] text-slate-500">Audit system connectivity and degraded services</p>
                      </div>
                      <button
                        onClick={triggerSystemHealthRefresh}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                        <span>Refresh Metrics</span>
                      </button>
                    </div>

                    {/* Indicators list */}
                    <div className="space-y-3.5 text-xs">
                      {[
                        { label: 'Gateway API Router Services', status: systemHealth.api },
                        { label: 'SQLite Relation Memory Database', status: systemHealth.database },
                        { label: 'ChromaDB Persistent Vector Repository', status: systemHealth.vectorDb },
                        { label: 'Google text-embedding-004 Wrapper', status: systemHealth.embeddings },
                        { label: 'Gemini LLM Active Thread Services', status: systemHealth.llm }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-900">
                          <span className="font-semibold text-slate-300">{item.label}</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'online'
                              ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-950/80 border border-amber-500/20 text-amber-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-[10px] leading-relaxed text-slate-500">
                      <strong>Audit Connection Protocol:</strong> TLS v1.3 // Host gateway binds on port 8000. Relational history commits locally to SQLite on startup. Seeder vector embeddings require active API authorizations.
                    </div>
                  </div>
                </div>
              )}

              {/* 8. PROFILE SETTINGS TAB */}
              {activeTab === 'profile' && (
                <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
                  <div className="glass-panel border border-slate-900 rounded-2xl p-6 shadow-glass space-y-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Account Credentials &amp; Security</h2>
                      <p className="text-[10px] text-slate-500">Maintain corporate identities, theme preferences, and credentials</p>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">User Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Corporate Email</label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full p-2.5 rounded-xl glass-input text-slate-300"
                          />
                        </div>
                      </div>

                      {/* Password Change */}
                      <div>
                        <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Change Security Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={profilePass}
                          onChange={(e) => setProfilePass(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-slate-300"
                        />
                      </div>

                      {/* Preferences */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Language Context</label>
                          <select
                            value={profileLang}
                            onChange={(e) => setProfileLang(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 outline-none cursor-pointer"
                          >
                            <option value="English">English (US Standard)</option>
                            <option value="Deutsch">Deutsch (German)</option>
                            <option value="Français">Français (French)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider text-[10px]">Workspace Theme</label>
                          <select
                            value={profileTheme}
                            onChange={(e) => setProfileTheme(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 outline-none cursor-pointer"
                          >
                            <option value="Dark">Enterprise Dark Mode</option>
                            <option value="Light">Corporate Light Mode</option>
                          </select>
                        </div>
                      </div>

                      {/* Security Parameters */}
                      <div className="pt-2">
                        <label className="flex items-center gap-2.5 font-semibold text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profile2FA}
                            onChange={(e) => setProfile2FA(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500/20"
                          />
                          <span>Enable Two-Factor PIN Check (Fingerprint / OTP) on startup</span>
                        </label>
                      </div>

                      {/* Active Sessions list */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-2.5 font-mono text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-400 uppercase tracking-wide block">Active Secure Sessions</span>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                          <span className="text-slate-300 font-semibold">Windows 11 // Google Chrome</span>
                          <span className="text-brand-400 font-bold uppercase">Current Session</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-slate-500">macOS Sonoma // Apple Safari</span>
                          <span>Last Activity: May 29, 2026</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-md hover:shadow-brand-500/15 transition-all cursor-pointer"
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- MOBILE SIDEBAR DRAWER OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            className="w-64 bg-slate-950 border-r border-slate-900 p-5 flex flex-col h-full relative"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 pb-5 mb-5 border-b border-slate-900">
              <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
              <span className="font-bold text-sm text-slate-200">AeroRAG Console</span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {visibleNavItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border ${
                      isActive 
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 shadow-glass' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Venkat Raman</span>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }} 
                className="text-[10px] font-bold text-red-400 hover:underline"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
export default DashboardPage;
