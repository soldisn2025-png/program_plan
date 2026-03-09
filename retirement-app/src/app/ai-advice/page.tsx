'use client'

import { useState } from 'react'

const SUGGESTED_QUESTIONS = [
  'Am I on track to retire at 50 in 2035?',
  'How should I optimize my 401k vs Roth IRA contributions?',
  'What\'s the best Roth conversion ladder strategy for early retirement?',
  'How much should I have in taxable accounts vs retirement accounts?',
  'What healthcare options do I have between retiring at 50 and Medicare at 65?',
  'How will US-Korea tax treaties affect my retirement income?',
]

const DEMO_ADVICE = `## Retirement Analysis — March 2026

### Current Status: Cautiously On Track ⚠️

Based on your current net worth of **$287,500** and monthly contributions of **$3,200**, you're making solid progress but will need to maintain discipline to hit your 2035 target.

---

### 📊 The Numbers

| Metric | Value |
|--------|-------|
| Current Net Worth | $287,500 |
| FI Number (25× expenses) | $900,000 |
| Progress | 31.9% |
| Projected @ 2035 (7% return) | $1.04M |
| Monthly Korea Budget | $3,000 (~₩3,960,000) |

**Good news:** At your current savings rate, you're projected to reach ~$1.04M by 2035 — exceeding your $900K FI number.

---

### 🎯 Top 3 Action Items Right Now

**1. Start Roth Conversion Ladder Immediately**
Your Fidelity 401(k) ($112,400) is all pretax. To access it penalty-free before 59½, you need to start a Roth conversion ladder *at least 5 years before retirement* — meaning you should start converting in **2030**. But starting earlier (now) gives you more flexibility.
- Convert ~$15,000–$20,000/year to Roth from your 401k
- This fills the lower tax brackets and reduces your taxable RMDs later
- Watch the 12% → 22% bracket boundary (~$47K for single filers)

**2. Build Your "Bridge Account" in E*Trade**
You'll need taxable brokerage funds to live on from age 50–59½ (before penalty-free retirement account access). Target: **2 years of expenses = ~$72,000 in taxable accounts**. Your E*Trade has $63,900 — keep growing this.

**3. Maximize Roth IRA Contributions**
Your Robinhood Roth IRA at $48,200 is relatively small. Max contributions ($7,000/year in 2024) are your best tool — tax-free growth AND tax-free withdrawals in Korea. Prioritize this after your 401k match.

---

### 🇰🇷 Korea-Specific Considerations

**Healthcare:** National Health Insurance (NHI) in Korea costs roughly **$80–200/month** for foreigners on F-visa. This is dramatically cheaper than US ACA coverage ($400–800/month). This savings alone is worth ~$3,600/year.

**Tax Treaty:** Under the US-Korea tax treaty:
- Roth IRA withdrawals are generally tax-free in both countries
- 401k distributions are taxed in the US (not double-taxed in Korea)
- You'll still file US taxes annually as a citizen

**Living Cost Reality Check:** Your $3,000/month Korea budget is reasonable for the Seoul metro area (Bundang, Ilsan, Mapo). Seoul proper could run $3,500+. Consider: 서울 근교 is where the value is.

---

*Next step: Schedule a consultation with a fee-only advisor who specializes in expat retirement and US-Korea tax planning.*`

export default function AIAdvicePage() {
  const [question, setQuestion] = useState('')
  const [advice, setAdvice] = useState(DEMO_ADVICE)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (q?: string) => {
    const prompt = q ?? question
    if (!prompt.trim()) return
    setLoading(true)
    setAdvice('')

    try {
      const res = await fetch('/api/ai-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt }),
      })
      const data = await res.json()
      setAdvice(data.advice ?? data.error ?? 'No response received.')
    } catch {
      setAdvice('Failed to fetch advice. Please check your API key and try again.')
    } finally {
      setLoading(false)
      setQuestion('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Financial Advisor</h1>
        <p className="text-slate-500 mt-1">
          Powered by Claude — personalized advice for your Korea retirement plan
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Suggested Questions
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSubmit(q)}
              disabled={loading}
              className="text-sm px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Ask Your Own Question
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. How much should I have saved by 2030?"
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !question.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Thinking...
              </span>
            ) : 'Ask Claude'}
          </button>
        </div>
      </div>

      {/* AI Response */}
      {(advice || loading) && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Claude (claude-opus-4-6)</p>
              <p className="text-xs text-slate-400">Your personalized retirement advisor</p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Analyzing your financial data...</span>
            </div>
          ) : (
            <div
              className="prose prose-sm prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: advice
                  .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h2>')
                  .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-slate-800 mt-4 mb-1">$1</h3>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-700">$1</li>')
                  .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-slate-700"><strong>$1.</strong> $2</li>')
                  .replace(/\n\n/g, '</p><p class="text-slate-700 mb-3">')
                  .replace(/^---$/gm, '<hr class="border-slate-200 my-4">')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
