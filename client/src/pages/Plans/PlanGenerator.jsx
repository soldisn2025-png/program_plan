import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import ProgramPlanEditor from '../../components/ProgramPlanEditor';

export default function PlanGenerator() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan]           = useState(null);
  const [content, setContent]     = useState('');
  const [flags, setFlags]         = useState([]);
  const [status, setStatus]       = useState('idle'); // idle | generating | review | approved | error
  const [error, setError]         = useState(null);
  const [approving, setApproving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    setStatus('generating');
    setError(null);
    try {
      const res = await api.post(`/generate/plan/${id}`);
      setContent(res.data.content);
      setFlags(res.data.flags || []);
      setStatus('review');
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed. Please try again.');
      setStatus('error');
    }
  };

  // Load existing draft on mount; auto-generate if none exists yet
  useEffect(() => {
    api.get(`/plans/${id}`)
      .then(res => setPlan(res.data))
      .catch(() => toast.error('Failed to load plan'));

    api.get(`/generate/plan/${id}`)
      .then(res => {
        setContent(res.data.content);
        setFlags(res.data.flags || []);
        setStatus(res.data.status === 'approved' ? 'approved' : 'review');
      })
      .catch(() => {
        handleGenerate();
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContentChange = useCallback(async (newContent) => {
    setContent(newContent);
    try {
      await api.patch(`/generate/plan/${id}`, { content: newContent });
    } catch {
      // silently fail — content is still in state
    }
  }, [id]);

  const handleFlagDismiss = useCallback((index) => {
    setFlags(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.post(`/generate/plan/${id}/approve`);
      setStatus('approved');
      toast.success('Plan approved');
    } catch {
      toast.error('Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/generate/plan/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `program-plan-${plan?.child_name || id}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const childName = plan?.child_name || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/plans" className="hover:text-gray-700">Plans</Link>
          <span>›</span>
          <Link to={`/plans/${id}`} className="hover:text-gray-700">{plan?.name || '…'}</Link>
          <span>›</span>
          <span className="text-gray-900">AI Program Plan</span>
        </div>
        <div className="flex gap-2">
          {(status === 'review' || status === 'approved') && (
            <>
              {status !== 'approved' && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="btn-primary text-sm py-1.5"
                >
                  {approving ? 'Approving…' : 'Approve Plan'}
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-secondary text-sm py-1.5"
              >
                {downloading ? 'Downloading…' : 'Download .docx'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Page header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Program Plan Generator</h2>
            {childName && (
              <p className="text-sm text-gray-500 mt-0.5">Client: {childName}</p>
            )}
            {status === 'approved' && (
              <span className="inline-block mt-2 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Approved
              </span>
            )}
          </div>
          {status !== 'generating' && (
            <button
              onClick={handleGenerate}
              className="btn-primary flex-shrink-0"
            >
              {status === 'idle' ? 'Generate Plan' : 'Regenerate'}
            </button>
          )}
        </div>

        {status === 'generating' && (
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600 flex-shrink-0" />
            <span>Generating program plan with AI… this typically takes 30–60 seconds.</span>
          </div>
        )}

        {status === 'error' && error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {status === 'idle' && (
          <p className="mt-3 text-sm text-gray-500">
            Click <strong>Generate Plan</strong> to draft a complete, AI-written program plan for all goals in this plan.
            A second AI will review the draft and flag any clinical issues for your review before you approve and download.
          </p>
        )}
      </div>

      {/* Editor */}
      {(status === 'review' || status === 'approved') && content && (
        <ProgramPlanEditor
          content={content}
          flags={flags}
          onContentChange={handleContentChange}
          onFlagDismiss={handleFlagDismiss}
        />
      )}
    </div>
  );
}
