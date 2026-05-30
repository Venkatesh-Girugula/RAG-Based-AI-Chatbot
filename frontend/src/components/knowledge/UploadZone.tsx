import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const UploadZone: React.FC = () => {
  const { addDocument, isUploading, setUploading } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`Oversized File [${file.name}]. Keep attachments under 5MB.`);
      return;
    }

    // Validate type extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['pdf', 'docx', 'txt', 'json'];
    if (!ext || !validExts.includes(ext)) {
      setErrorMsg(`Invalid File Signature [.${ext?.toUpperCase()}]. Upload PDF, DOCX, TXT, or JSON.`);
      return;
    }

    // Simulate batch indexing pipeline
    setUploading(true, 10);
    
    // Simulate chunk calculations
    const estimatedChunks = Math.max(2, Math.floor(file.size / 4000));

    setTimeout(() => setUploading(true, 45), 300);
    setTimeout(() => setUploading(true, 75), 650);
    setTimeout(() => {
      setUploading(false);
      const newDoc = {
        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        chunkCount: estimatedChunks,
        embeddingCount: estimatedChunks,
        status: 'Indexed' as const,
        type: ext.toUpperCase() as any,
        metadata: { author: 'Secure Admin console', description: 'Uploaded into standard repository layer' }
      };
      addDocument(newDoc);
      setSuccessMsg(`Successfully Chunked and Indexed '${file.name}' into ChromaDB.`);
    }, 1100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndAddFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndAddFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Drag Target Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-8 px-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
          dragActive 
            ? 'border-brand-500 bg-brand-500/5 shadow-glass-hover' 
            : 'border-slate-800 bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.docx,.txt,.json"
          className="hidden"
          multiple={false}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="h-10 w-10 text-brand-400 animate-spin" />
            <div className="text-sm font-bold text-slate-200">Generating Vectors...</div>
            <p className="text-[10px] text-slate-500 leading-normal max-w-xs">
              Slicing chunks using sliding window (Size: 500 chars, Overlap: 50 chars) and committing to ChromaDB collections.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="h-12 w-12 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-400 transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                Drag and Drop corporate documents or <span className="text-brand-400 hover:underline">browse files</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Supports PDF, DOCX, TXT, or JSON (Max size 5.0 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications block */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/20 text-red-200 text-xs font-medium flex items-center gap-2.5 animate-slide-in">
          <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-slide-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
export default UploadZone;
