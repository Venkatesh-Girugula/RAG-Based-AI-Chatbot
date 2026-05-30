import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Database,
  Filter,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EnterpriseDocument } from '../../types/enterprise';

export const DocumentTable: React.FC = () => {
  const { documents, deleteDocument } = useStore();
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<EnterpriseDocument | null>(null);

  // Filter documents based on inputs
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          (doc.metadata.author || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: EnterpriseDocument['status']) => {
    switch (status) {
      case 'Indexed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Indexed</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-950/80 border border-brand-500/20 text-brand-400 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 border border-red-500/20 text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by name or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs text-slate-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 text-xs focus:border-brand-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Extension Types</option>
            <option value="PDF">PDF</option>
            <option value="TXT">TXT</option>
            <option value="DOCX">DOCX</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
      </div>

      {/* Docs Grid / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Document Listing Table Panel */}
        <div className="lg:col-span-2 glass-panel border border-slate-900/60 rounded-2xl overflow-hidden shadow-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/80 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900/20">
                  <th className="py-4 px-4.5">Document Details</th>
                  <th className="py-4 px-4">Upload Date</th>
                  <th className="py-4 px-4 text-center">Chunks</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-xs text-slate-300">
                {filteredDocs.map(doc => (
                  <tr 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`hover:bg-slate-900/20 cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0 font-bold">
                          {doc.type}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-slate-200">{doc.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{doc.uploadDate}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-200">
                      {doc.chunkCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3.5 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                          className="p-2 rounded-lg text-slate-500 hover:text-brand-300 hover:bg-slate-900/60 transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); if(selectedDoc?.id === doc.id) setSelectedDoc(null); }}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      No matching documents found in corporate index repository.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Detail & Retrieval Chunks Panel Drawer */}
        <div className="glass-panel border border-slate-900/60 rounded-2xl p-5 shadow-glass h-fit">
          {selectedDoc ? (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-900/60">
                <FileText className="h-5 w-5 text-brand-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-200 truncate max-w-[180px]">
                    {selectedDoc.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Metadata Details</span>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/80">
                  <span className="text-slate-500 block mb-1">Owner</span>
                  <span className="text-slate-300 font-semibold truncate block">{selectedDoc.metadata.author || 'Unknown'}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900/80">
                  <span className="text-slate-500 block mb-1">Index Vectors</span>
                  <span className="text-brand-300 font-bold block flex items-center gap-1">
                    <Database className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                    {selectedDoc.embeddingCount} Vectors
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase font-mono tracking-wider block mb-1.5">Description</span>
                <p className="text-slate-300 leading-normal">{selectedDoc.metadata.description || 'No description provided.'}</p>
              </div>

              {/* Chunks Retrieval Simulation Zone */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase font-mono tracking-wider block">Sliding Chunks Sample</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {[...Array(selectedDoc.chunkCount)].map((_, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 text-[10px] leading-relaxed text-slate-400 font-medium">
                      <span className="text-brand-400 font-bold font-mono block mb-1"># Chunk {i+1} Vector [{((1 - (i * 0.02)) * 100).toFixed(1)}% Match]</span>
                      "All company classifications map to Public, Internal, Confidential, or Restricted levels. Confidential data includes salaries..."
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-4">
              <BookOpen className="h-10 w-10 text-slate-700 mx-auto" />
              <div className="text-xs text-slate-500 italic max-w-xs mx-auto leading-normal">
                Select a document from the repository list to audit its chunk properties, author metadata, and embedding representations.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default DocumentTable;
