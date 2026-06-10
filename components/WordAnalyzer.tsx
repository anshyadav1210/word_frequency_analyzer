'use client';

import { useState, useCallback, useRef } from 'react';
import { countWords, truncateForAI, WordFreq } from '@/lib/words';

// ── Types ──────────────────────────────────────────────────────────────────────
type AITab = 'summarize' | 'explain' | 'qa';
type AIStatus = 'idle' | 'loading' | 'done' | 'error';

// ── PDF extraction (client-side via pdf.js CDN) ────────────────────────────────
async function extractPDF(file: File, onProgress: (msg: string) => void): Promise<string> {
  const pdfjsLib = (window as unknown as { pdfjsLib: { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> }; GlobalWorkerOptions: { workerSrc: string } } }).pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  let text = '';
  for (let i = 1; i <= total; i++) {
    if (total > 20) onProgress(`Reading PDF… page ${i} of ${total}`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
  }
  return text;
}

async function extractDOCX(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

async function callAI(prompt: string): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI request failed');
  return data.result;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WordAnalyzer() {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'loading' | 'error' | ''>('');
  const [results, setResults] = useState<WordFreq[]>([]);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [topN, setTopN] = useState(20);
  const [searchQ, setSearchQ] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [aiTab, setAITab] = useState<AITab>('summarize');
  const [aiResponses, setAIResponses] = useState<Record<AITab, string>>({ summarize: '', explain: '', qa: '' });
  const [aiStatus, setAIStatus] = useState<Record<AITab, AIStatus>>({ summarize: 'idle', explain: 'idle', qa: 'idle' });
  const [explainWord, setExplainWord] = useState('');
  const [qaInput, setQAInput] = useState('');
  const extractedText = useRef('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      showStatus('Unsupported file type. Use .pdf, .docx, or .txt', 'error');
      return;
    }
    setFileInfo({ name: file.name, size: formatBytes(file.size) });
    setResults([]);
    setAIResponses({ summarize: '', explain: '', qa: '' });
    setAIStatus({ summarize: 'idle', explain: 'idle', qa: 'idle' });
    extractedText.current = '';
    showStatus('Reading file…', 'loading');

    try {
      let text = '';
      if (ext === 'txt') {
        text = await file.text();
      } else if (ext === 'pdf') {
        text = await extractPDF(file, (msg) => showStatus(msg, 'loading'));
      } else if (ext === 'docx') {
        text = await extractDOCX(file);
      }
      extractedText.current = text;
      showStatus('Counting words…', 'loading');
      const freq = countWords(text);
      setResults(freq);
      showStatus('', '');
    } catch (err) {
      showStatus('Error reading file: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  }, []);

  function showStatus(msg: string, type: 'loading' | 'error' | '') {
    setStatus(msg); setStatusType(type);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Filtered results ───────────────────────────────────────────────────────
  const filtered = searchQ
    ? results.filter(r => r.word.includes(searchQ.toLowerCase()))
    : results.slice(0, topN);
  const maxCount = filtered[0]?.count || 1;
  const totalWords = results.reduce((s, r) => s + r.count, 0);

  // ── Export ─────────────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = results.slice(0, topN);
    const csv = 'Rank,Word,Count\n' + rows.map((r, i) => `${i + 1},${r.word},${r.count}`).join('\n');
    dl('word_frequency.csv', csv, 'text/csv');
  }
  function exportTXT() {
    const rows = results.slice(0, topN);
    const txt = rows.map((r, i) => `${String(i + 1).padStart(3)}. ${r.word.padEnd(20)} ${r.count}`).join('\n');
    dl('word_frequency.txt', txt, 'text/plain');
  }
  function dl(name: string, content: string, type: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name; a.click();
  }

  // ── AI ─────────────────────────────────────────────────────────────────────
  async function runAI(tab: AITab, prompt: string) {
    if (!extractedText.current) return;
    setAIStatus(s => ({ ...s, [tab]: 'loading' }));
    setAIResponses(s => ({ ...s, [tab]: '' }));
    try {
      const result = await callAI(prompt);
      setAIResponses(s => ({ ...s, [tab]: result }));
      setAIStatus(s => ({ ...s, [tab]: 'done' }));
    } catch (err) {
      setAIResponses(s => ({ ...s, [tab]: '❌ ' + (err instanceof Error ? err.message : String(err)) }));
      setAIStatus(s => ({ ...s, [tab]: 'error' }));
    }
  }

  function getContext() { return truncateForAI(extractedText.current); }

  function runSummarize(type: string) {
    const ctx = getContext();
    const prompts: Record<string, string> = {
      brief: `Summarize the following text in 3-4 sentences:\n\n${ctx}`,
      detailed: `Write a detailed summary in 2-3 paragraphs:\n\n${ctx}`,
      bullets: `List the 6-8 most important key points as bullet points:\n\n${ctx}`,
      topic: `In one sentence, what is the main topic of this text?\n\n${ctx}`,
    };
    runAI('summarize', prompts[type]);
  }

  function runExplain(word?: string) {
    const w = word || explainWord.trim();
    if (!w) return;
    if (word) { setExplainWord(word); setAITab('explain'); }
    const ctx = getContext();
    const prompt = `The word "${w}" appears in the following document.\n1. Give the general meaning of the word.\n2. Explain how it is specifically used in this document's context.\n\nDocument:\n${ctx}`;
    runAI('explain', prompt);
  }

  function runQA() {
    const q = qaInput.trim();
    if (!q) return;
    const ctx = getContext();
    const prompt = `Answer the following question based only on the document below. If the answer is not in the document, say so clearly.\n\nQuestion: ${q}\n\nDocument:\n${ctx}`;
    runAI('qa', prompt);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Load PDF.js globally */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" async />
      <script dangerouslySetInnerHTML={{ __html: `window.pdfjsLibReady = true;` }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent2)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 14px', marginBottom: '1rem' }}>
            IIT Mandi Mini Project
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '.5rem' }}>
            Word Frequency <span style={{ color: 'var(--accent2)' }}>Analyzer</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.95rem' }}>
            Upload any file · See word frequencies · Ask AI anything about the text
          </p>
        </header>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center', cursor: 'pointer',
            background: isDragging ? '#1e2035' : 'var(--surface)', marginBottom: '1.2rem',
            transition: 'all .2s'
          }}
        >
          <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" style={{ display: 'none' }} onChange={onFileChange} />
          <div style={{ fontSize: '2.2rem', marginBottom: '.8rem' }}>📄</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '.3rem' }}>Drop your file here or click to browse</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Supports PDF, DOCX, and plain text files of any size</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '.8rem', flexWrap: 'wrap' }}>
            {['.pdf', '.docx', '.txt'].map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--muted)' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Show top</label>
          <input type="number" value={topN} min={1} max={500}
            onChange={e => setTopN(Number(e.target.value))}
            style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.875rem' }} />
          <label style={{ fontSize: '.875rem', color: 'var(--muted)' }}>words</label>
          <button onClick={exportCSV} disabled={results.length === 0}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer' }}>
            Export CSV
          </button>
          <button onClick={exportTXT} disabled={results.length === 0}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer' }}>
            Export TXT
          </button>
        </div>

        {/* Status */}
        {status && (
          <div style={{
            padding: '11px 15px', borderRadius: 10, fontSize: '.85rem', marginBottom: '1.2rem',
            border: `1px solid ${statusType === 'error' ? '#7f1d1d' : 'var(--accent)'}`,
            background: statusType === 'error' ? '#1c0a0a' : 'var(--surface)',
            color: statusType === 'error' ? '#f87171' : 'var(--accent2)'
          }}>{status}</div>
        )}

        {/* File info */}
        {fileInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: '1.2rem', fontSize: '.85rem' }}>
            <span>📎</span>
            <span style={{ fontWeight: 600, color: 'var(--accent2)' }}>{fileInfo.name}</span>
            <span style={{ color: 'var(--muted)' }}>{fileInfo.size}</span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: '1.2rem' }}>
              {[
                { label: 'Total Words', value: totalWords.toLocaleString() },
                { label: 'Unique Words', value: results.length.toLocaleString() },
                { label: 'Top Word', value: results[0]?.word || '—' },
                { label: 'Top Count', value: results[0]?.count.toLocaleString() || '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.2rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'monospace' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center' }}>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search a word in results…"
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '.875rem' }} />
              <span style={{ fontSize: '.8rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {searchQ
                  ? `${filtered.length} found`
                  : `${filtered.length} words shown`}
              </span>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Rank', 'Word (click to explain)', 'Count', 'Frequency'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={r.word} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '.8rem', width: 48 }}>{idx + 1}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => { setAITab('explain'); runExplain(r.word); }}
                          style={{ background: 'none', border: 'none', color: 'var(--accent2)', fontFamily: 'monospace', fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline dotted', padding: 0 }}>
                          {r.word}
                        </button>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '.875rem', width: 80 }}>{r.count.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', width: 180 }}>
                        <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 7, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', width: `${(r.count / maxCount * 100).toFixed(1)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

              {/* AI Header */}
              <div style={{ background: 'var(--surface2)', padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)' }} />
                <h3 style={{ fontSize: '.95rem', fontWeight: 600 }}>AI Assistant — powered by Claude</h3>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '.8rem 1.2rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {(['summarize', 'explain', 'qa'] as AITab[]).map(tab => (
                  <button key={tab} onClick={() => setAITab(tab)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: '.82rem', cursor: 'pointer', fontFamily: 'system-ui',
                      border: aiTab === tab ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: aiTab === tab ? 'var(--accent)' : 'transparent',
                      color: aiTab === tab ? '#fff' : 'var(--muted)'
                    }}>
                    {tab === 'summarize' ? '📝 Summarize' : tab === 'explain' ? '💡 Explain a Word' : '❓ Ask Anything'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1.2rem' }}>

                {/* Summarize */}
                {aiTab === 'summarize' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {[
                        { label: 'Brief summary', type: 'brief' },
                        { label: 'Detailed summary', type: 'detailed' },
                        { label: 'Key bullet points', type: 'bullets' },
                        { label: 'Main topic only', type: 'topic' },
                      ].map(b => (
                        <button key={b.type} onClick={() => runSummarize(b.type)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'system-ui' }}>
                          {b.label}
                        </button>
                      ))}
                    </div>
                    <AIResponse text={aiResponses.summarize} status={aiStatus.summarize} placeholder="Click a button above to summarize the uploaded text." />
                  </div>
                )}

                {/* Explain */}
                {aiTab === 'explain' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                      <input type="text" value={explainWord} onChange={e => setExplainWord(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runExplain()}
                        placeholder="Type a word to explain (or click one in the table)…"
                        style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '.875rem' }} />
                      <button onClick={() => runExplain()}
                        style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                        Explain
                      </button>
                    </div>
                    <AIResponse text={aiResponses.explain} status={aiStatus.explain} placeholder="Enter a word above — or click any word in the table — to get its meaning in context of the document." />
                  </div>
                )}

                {/* Q&A */}
                {aiTab === 'qa' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {[
                        'What is the main topic of this document?',
                        'Who is the author or subject?',
                        'What are the most important facts?',
                        'What conclusions are mentioned?',
                      ].map(q => (
                        <button key={q} onClick={() => { setQAInput(q); setTimeout(runQA, 50); }}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'system-ui' }}>
                          {q}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                      <input type="text" value={qaInput} onChange={e => setQAInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runQA()}
                        placeholder="Ask anything about the document…"
                        style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '.875rem' }} />
                      <button onClick={runQA}
                        style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                        Ask
                      </button>
                    </div>
                    <AIResponse text={aiResponses.qa} status={aiStatus.qa} placeholder="Ask any question about the uploaded document." />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <footer style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--muted)', fontSize: '.78rem' }}>
          IIT Mandi Mini Project · API key stays on the server · No file data stored
        </footer>
      </div>
    </>
  );
}

// ── AI Response box ────────────────────────────────────────────────────────────
function AIResponse({ text, status, placeholder }: { text: string; status: AIStatus; placeholder: string }) {
  const isLoading = status === 'loading';
  const isEmpty = !text && status === 'idle';
  return (
    <div style={{
      minHeight: 80, padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, fontSize: '.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
      color: isLoading ? 'var(--accent2)' : isEmpty ? 'var(--muted)' : 'var(--text)',
      fontStyle: isEmpty ? 'italic' : 'normal'
    }}>
      {isLoading ? 'Thinking…' : text || placeholder}
    </div>
  );
}
