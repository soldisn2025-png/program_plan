import React from 'react';

const severityStyles = {
  error: {
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    bg: 'bg-red-50',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
  },
};

export default function ProgramPlanEditor({ content, flags, onContentChange, onFlagDismiss }) {
  const activeFlags = flags || [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      {/* Plan Editor — left / full width on mobile */}
      <div className="flex-1 min-w-0 border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500">Edit the plan directly in the text area below before approving.</p>
        </div>
        <textarea
          className="w-full p-4 text-sm text-gray-800 leading-relaxed font-mono resize-y focus:outline-none"
          rows={30}
          value={content}
          onChange={e => onContentChange(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* AI Verification Panel — right sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">AI Verification</h3>
              <p className="text-xs text-gray-400 mt-0.5">2nd AI review of the generated plan</p>
            </div>
            {activeFlags.length > 0 ? (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                {activeFlags.length} issue{activeFlags.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                All clear
              </span>
            )}
          </div>
        </div>

        {activeFlags.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500">
            No issues found. The plan looks clinically accurate.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeFlags.map((flag, i) => {
              const styles = severityStyles[flag.severity] || severityStyles.warning;
              return (
                <div key={i} className={`px-4 py-3 ${styles.bg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-gray-700 truncate">{flag.goalName}</span>
                        <span className="text-gray-300 text-xs">›</span>
                        <span className="text-xs font-medium text-gray-600">{flag.section}</span>
                      </div>
                      <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded mb-1 ${styles.badge}`}>
                        {flag.severity}
                      </span>
                      <p className="text-xs text-gray-700 mb-1">{flag.issue}</p>
                      <p className="text-xs text-gray-500 italic">Suggestion: {flag.suggestion}</p>
                    </div>
                    <button
                      onClick={() => onFlagDismiss(i)}
                      aria-label="Dismiss"
                      className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
