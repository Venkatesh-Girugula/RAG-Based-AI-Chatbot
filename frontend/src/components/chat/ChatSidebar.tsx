import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  MessageSquare, 
  Pin, 
  Edit3, 
  Trash2, 
  Share2, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ChatSidebar: React.FC = () => {
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSessionId, 
    createNewSession, 
    deleteSession, 
    renameSession,
    folders,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ f1: true, f2: true });

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Categorize pinned sessions (first 2 for demonstration, or if title starts with security/devops)
  const pinnedSessions = filteredSessions.slice(0, 1);
  const generalSessions = filteredSessions.slice(1);

  return (
    <div className="w-80 border-r border-slate-900 bg-slate-950/70 backdrop-blur-md flex flex-col z-10 shrink-0 h-full">
      
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-900/60 relative">
        <Search className="absolute left-7.5 top-7.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs text-slate-300"
        />
      </div>

      {/* New chat button */}
      <div className="px-4 py-3">
        <button
          onClick={() => createNewSession()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Scroller Content */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
        
        {/* Pinned Conversations */}
        {pinnedSessions.length > 0 && (
          <div>
            <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <Pin className="h-3 w-3 text-brand-400 rotate-45" />
              <span>Pinned Discussions</span>
            </div>
            <div className="space-y-0.5">
              {pinnedSessions.map(s => {
                const isActive = s.sessionId === currentSessionId;
                return (
                  <div
                    key={s.sessionId}
                    onClick={() => setCurrentSessionId(s.sessionId)}
                    className={`w-full group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left text-xs cursor-pointer ${
                      isActive 
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 shadow-glass' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="h-4 w-4 shrink-0 text-brand-400" />
                      {editingId === s.sessionId ? (
                        <form onSubmit={(e) => handleSaveRename(s.sessionId, e)} className="flex-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => setEditingId(null)}
                            autoFocus
                            className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-brand-500"
                          />
                        </form>
                      ) : (
                        <span className="truncate font-semibold">{s.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={(e) => handleStartRename(s.sessionId, s.title, e)}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-900"
                        title="Rename"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.sessionId); }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Folders Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Folders
          </div>
          <div className="space-y-1">
            {folders.map(folder => {
              const isOpen = openFolders[folder.id];
              return (
                <div key={folder.id} className="space-y-0.5">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold tracking-wide"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? <FolderOpen className="h-3.5 w-3.5 text-brand-400" /> : <Folder className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{folder.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">0</span>
                  </button>
                  {isOpen && (
                    <div className="pl-4 border-l border-slate-900/60 ml-4.5 space-y-0.5 py-1">
                      <span className="text-[10px] text-slate-600 block pl-3 italic">Empty folder</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* General Discussions History */}
        <div>
          <div className="px-3 mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Discussions
          </div>
          <div className="space-y-0.5">
            {generalSessions.map(s => {
              const isActive = s.sessionId === currentSessionId;
              return (
                <div
                  key={s.sessionId}
                  onClick={() => setCurrentSessionId(s.sessionId)}
                  className={`w-full group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left text-xs cursor-pointer ${
                    isActive 
                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-300 shadow-glass' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                    {editingId === s.sessionId ? (
                      <form onSubmit={(e) => handleSaveRename(s.sessionId, e)} className="flex-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-brand-500"
                        />
                      </form>
                    ) : (
                      <span className="truncate font-semibold">{s.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={(e) => handleStartRename(s.sessionId, s.title, e)}
                      className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-900"
                      title="Rename"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(s.sessionId); }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {generalSessions.length === 0 && (
              <span className="text-[10px] text-slate-600 block pl-3 italic py-2">No other discussions</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default ChatSidebar;
