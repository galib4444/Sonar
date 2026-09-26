'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MechGodzillaLoader } from '@/components/ui/mechgodzilla-loader';
import { UploadIcon3D } from '@/components/ui/upload-icon-3d';

interface ResumeUploadProps {
  onResumeExtracted: (profile: any) => void;
  loading?: boolean;
}

export function ResumeUpload({ onResumeExtracted, loading }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, TXT, or DOCX file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('resume', file);

      // Upload and parse resume
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Extract detailed error message from server
        let errorMsg = 'Failed to parse resume';
        try {
          const errorData = await response.json();
          console.error('❌ [RESUME UPLOAD] Server error:', errorData);
          // Show both error and details if available
          if (errorData.details) {
            errorMsg = `${errorData.error}: ${errorData.details}`;
          } else {
            errorMsg = errorData.error || errorMsg;
          }
        } catch {
          // Failed to parse error JSON, use default message
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Only mark success after successful parse
      setFileName(file.name);
      onResumeExtracted(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard variant="cream" className="p-10">
      <style jsx>{`
        @keyframes shimmer-flow {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes shimmer-flow-active {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
            opacity: 0;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
            opacity: 0;
          }
        }

        .shimmer-overlay {
          animation: shimmer-flow 4s ease-in-out infinite;
        }

        .shimmer-overlay-active {
          animation: shimmer-flow-active 2s ease-in-out infinite;
        }
      `}</style>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Your Resume
          </h3>
          <p className="text-sm text-gray-700">
            Upload your full resume (1+ pages). We&apos;ll use it as your knowledge base to generate tailored 1-page resumes.
          </p>
        </div>

        <div
          className={`group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-500 ease-out ${
            dragActive
              ? 'backdrop-blur-2xl bg-gradient-to-br from-gold/15 via-white/8 to-transparent scale-[1.02] shadow-2xl'
              : uploading
              ? 'backdrop-blur-2xl bg-gradient-to-br from-white/12 via-white/6 to-transparent animate-glow-pulse'
              : 'backdrop-blur-2xl bg-gradient-to-br from-white/12 via-white/6 to-transparent hover:scale-[1.01] hover:shadow-xl'
          } ${uploading || loading ? 'cursor-not-allowed' : 'cursor-pointer hover:from-white/[0.15] hover:via-white/[0.08]'}`}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: dragActive
              ? '0 8px 32px rgba(212, 175, 103, 0.25), 0 1px 1px rgba(255, 255, 255, 0.4) inset, 0 -1px 1px rgba(0, 0, 0, 0.05) inset, 0 20px 40px rgba(212, 175, 103, 0.15)'
              : uploading
              ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(255, 255, 255, 0.5) inset, 0 -1px 1px rgba(0, 0, 0, 0.05) inset'
              : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(255, 255, 255, 0.5) inset, 0 -1px 1px rgba(0, 0, 0, 0.05) inset, 0 4px 16px rgba(0, 0, 0, 0.04)',
            background: dragActive
              ? 'linear-gradient(135deg, rgba(212, 175, 103, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Top light reflection - Apple-style */}
          <div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ pointerEvents: 'none' }}
          />

          {/* Animated shimmer overlay */}
          <div
            className={`${dragActive ? 'shimmer-overlay-active' : 'shimmer-overlay'} absolute inset-0 w-full h-full pointer-events-none`}
            style={{
              background: dragActive
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 215, 0, 0.7) 50%, rgba(255, 255, 255, 0.8) 60%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 40%, rgba(255, 215, 0, 0.5) 50%, rgba(255, 255, 255, 0.6) 60%, transparent 100%)',
              width: '200%',
              height: '200%',
              top: '-50%',
              left: '-50%',
              mixBlendMode: 'overlay'
            }}
          />

          <input
            type="file"
            id="resume-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".pdf,.txt,.docx"
            disabled={uploading || loading}
          />

          {uploading ? (
            <div className="space-y-4">
              <MechGodzillaLoader />
              <p className="text-gray-800 font-medium">Extracting your profile...</p>
            </div>
          ) : fileName ? (
            <div className="space-y-2">
              <div className="text-4xl">✓</div>
              <p className="font-medium text-green-800">{fileName}</p>
              <p className="text-sm text-gray-800">Resume uploaded successfully!</p>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              <div className="transition-all duration-300 group-hover:scale-110 group-hover:brightness-110">
                <UploadIcon3D />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 transition-all duration-300 group-hover:text-gray-950 group-hover:scale-105">
                  Drag & drop your resume here
                </p>
                <p className="text-sm text-gray-700 transition-all duration-300 group-hover:text-gray-800">
                  or click to browse (PDF, TXT, DOCX • Max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {fileName && !error && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
            ✓ Your resume has been processed and will be used to generate tailored versions
          </div>
        )}
      </div>
    </GlassCard>
  );
}
