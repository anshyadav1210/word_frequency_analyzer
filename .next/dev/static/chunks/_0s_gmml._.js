(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/words.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STOPWORDS",
    ()=>STOPWORDS,
    "countWords",
    ()=>countWords,
    "truncateForAI",
    ()=>truncateForAI
]);
const STOPWORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "if",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "shall",
    "can",
    "not",
    "no",
    "nor",
    "so",
    "yet",
    "both",
    "either",
    "neither",
    "this",
    "that",
    "these",
    "those",
    "i",
    "me",
    "my",
    "we",
    "our",
    "you",
    "your",
    "he",
    "she",
    "it",
    "they",
    "them",
    "his",
    "her",
    "its",
    "their",
    "what",
    "which",
    "who",
    "whom",
    "as",
    "than",
    "then",
    "when",
    "where",
    "how",
    "all",
    "each",
    "every",
    "more",
    "also",
    "about",
    "up",
    "out",
    "into",
    "just",
    "such",
    "after",
    "before",
    "between",
    "through",
    "during",
    "without",
    "within",
    "against",
    "there",
    "here",
    "now",
    "only",
    "very",
    "too",
    "much",
    "many",
    "any",
    "some",
    "other",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "s",
    "t",
    "re",
    "ll",
    "ve",
    "d",
    "m"
]);
function countWords(text) {
    const words = text.toLowerCase().match(/\b[a-z]{2,30}\b/g) || [];
    const freq = {};
    for (const w of words){
        if (!STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
    }
    return Object.entries(freq).map(([word, count])=>({
            word,
            count
        })).sort((a, b)=>b.count - a.count);
}
function truncateForAI(text, maxWords = 6000) {
    return text.split(/\s+/).slice(0, maxWords).join(' ');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/WordAnalyzer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordAnalyzer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/words.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// ── PDF extraction (client-side via pdf.js CDN) ────────────────────────────────
async function extractPDF(file, onProgress) {
    const pdfjsLib = window.pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;
    const total = pdf.numPages;
    let text = '';
    for(let i = 1; i <= total; i++){
        if (total > 20) onProgress(`Reading PDF… page ${i} of ${total}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item)=>item.str).join(' ') + '\n';
    }
    return text;
}
async function extractDOCX(file) {
    const mammoth = (await __turbopack_context__.A("[project]/node_modules/mammoth/lib/index.js [app-client] (ecmascript, async loader)")).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({
        arrayBuffer
    });
    return result.value;
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}
async function callAI(prompt) {
    const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI request failed');
    return data.result;
}
function WordAnalyzer() {
    _s();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusType, setStatusType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fileInfo, setFileInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [topN, setTopN] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(20);
    const [searchQ, setSearchQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [aiTab, setAITab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('summarize');
    const [aiResponses, setAIResponses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        summarize: '',
        explain: '',
        qa: ''
    });
    const [aiStatus, setAIStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        summarize: 'idle',
        explain: 'idle',
        qa: 'idle'
    });
    const [explainWord, setExplainWord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [qaInput, setQAInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const extractedText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── File handling ──────────────────────────────────────────────────────────
    const handleFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WordAnalyzer.useCallback[handleFile]": async (file)=>{
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (![
                'pdf',
                'docx',
                'txt'
            ].includes(ext || '')) {
                showStatus('Unsupported file type. Use .pdf, .docx, or .txt', 'error');
                return;
            }
            setFileInfo({
                name: file.name,
                size: formatBytes(file.size)
            });
            setResults([]);
            setAIResponses({
                summarize: '',
                explain: '',
                qa: ''
            });
            setAIStatus({
                summarize: 'idle',
                explain: 'idle',
                qa: 'idle'
            });
            extractedText.current = '';
            showStatus('Reading file…', 'loading');
            try {
                let text = '';
                if (ext === 'txt') {
                    text = await file.text();
                } else if (ext === 'pdf') {
                    text = await extractPDF(file, {
                        "WordAnalyzer.useCallback[handleFile]": (msg)=>showStatus(msg, 'loading')
                    }["WordAnalyzer.useCallback[handleFile]"]);
                } else if (ext === 'docx') {
                    text = await extractDOCX(file);
                }
                extractedText.current = text;
                showStatus('Counting words…', 'loading');
                const freq = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countWords"])(text);
                setResults(freq);
                showStatus('', '');
            } catch (err) {
                showStatus('Error reading file: ' + (err instanceof Error ? err.message : String(err)), 'error');
            }
        }
    }["WordAnalyzer.useCallback[handleFile]"], []);
    function showStatus(msg, type) {
        setStatus(msg);
        setStatusType(type);
    }
    const onDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WordAnalyzer.useCallback[onDrop]": (e)=>{
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        }
    }["WordAnalyzer.useCallback[onDrop]"], [
        handleFile
    ]);
    const onFileChange = (e)=>{
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };
    // ── Filtered results ───────────────────────────────────────────────────────
    const filtered = searchQ ? results.filter((r)=>r.word.includes(searchQ.toLowerCase())) : results.slice(0, topN);
    const maxCount = filtered[0]?.count || 1;
    const totalWords = results.reduce((s, r)=>s + r.count, 0);
    // ── Export ─────────────────────────────────────────────────────────────────
    function exportCSV() {
        const rows = results.slice(0, topN);
        const csv = 'Rank,Word,Count\n' + rows.map((r, i)=>`${i + 1},${r.word},${r.count}`).join('\n');
        dl('word_frequency.csv', csv, 'text/csv');
    }
    function exportTXT() {
        const rows = results.slice(0, topN);
        const txt = rows.map((r, i)=>`${String(i + 1).padStart(3)}. ${r.word.padEnd(20)} ${r.count}`).join('\n');
        dl('word_frequency.txt', txt, 'text/plain');
    }
    function dl(name, content, type) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([
            content
        ], {
            type
        }));
        a.download = name;
        a.click();
    }
    // ── AI ─────────────────────────────────────────────────────────────────────
    async function runAI(tab, prompt) {
        if (!extractedText.current) return;
        setAIStatus((s)=>({
                ...s,
                [tab]: 'loading'
            }));
        setAIResponses((s)=>({
                ...s,
                [tab]: ''
            }));
        try {
            const result = await callAI(prompt);
            setAIResponses((s)=>({
                    ...s,
                    [tab]: result
                }));
            setAIStatus((s)=>({
                    ...s,
                    [tab]: 'done'
                }));
        } catch (err) {
            setAIResponses((s)=>({
                    ...s,
                    [tab]: '❌ ' + (err instanceof Error ? err.message : String(err))
                }));
            setAIStatus((s)=>({
                    ...s,
                    [tab]: 'error'
                }));
        }
    }
    function getContext() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$words$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["truncateForAI"])(extractedText.current);
    }
    function runSummarize(type) {
        const ctx = getContext();
        const prompts = {
            brief: `Summarize the following text in 3-4 sentences:\n\n${ctx}`,
            detailed: `Write a detailed summary in 2-3 paragraphs:\n\n${ctx}`,
            bullets: `List the 6-8 most important key points as bullet points:\n\n${ctx}`,
            topic: `In one sentence, what is the main topic of this text?\n\n${ctx}`
        };
        runAI('summarize', prompts[type]);
    }
    function runExplain(word) {
        const w = word || explainWord.trim();
        if (!w) return;
        if (word) {
            setExplainWord(word);
            setAITab('explain');
        }
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
                async: true
            }, void 0, false, {
                fileName: "[project]/components/WordAnalyzer.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                dangerouslySetInnerHTML: {
                    __html: `window.pdfjsLibReady = true;`
                }
            }, void 0, false, {
                fileName: "[project]/components/WordAnalyzer.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: 900,
                    margin: '0 auto',
                    padding: '2rem 1rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        style: {
                            textAlign: 'center',
                            marginBottom: '2.5rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'inline-block',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: '.12em',
                                    textTransform: 'uppercase',
                                    color: 'var(--accent2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 99,
                                    padding: '4px 14px',
                                    marginBottom: '1rem'
                                },
                                children: "IIT Mandi Mini Project"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: 'clamp(1.8rem,5vw,2.8rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-.03em',
                                    marginBottom: '.5rem'
                                },
                                children: [
                                    "Word Frequency ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'var(--accent2)'
                                        },
                                        children: "Analyzer"
                                    }, void 0, false, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 200,
                                        columnNumber: 28
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--muted)',
                                    fontSize: '.95rem'
                                },
                                children: "Upload any file · See word frequencies · Ask AI anything about the text"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onDragOver: (e)=>{
                            e.preventDefault();
                            setIsDragging(true);
                        },
                        onDragLeave: ()=>setIsDragging(false),
                        onDrop: onDrop,
                        onClick: ()=>fileInputRef.current?.click(),
                        style: {
                            border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 16,
                            padding: '2.5rem 2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: isDragging ? '#1e2035' : 'var(--surface)',
                            marginBottom: '1.2rem',
                            transition: 'all .2s'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: ".txt,.pdf,.docx",
                                style: {
                                    display: 'none'
                                },
                                onChange: onFileChange
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '2.2rem',
                                    marginBottom: '.8rem'
                                },
                                children: "📄"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '.3rem'
                                },
                                children: "Drop your file here or click to browse"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--muted)',
                                    fontSize: '.85rem'
                                },
                                children: "Supports PDF, DOCX, and plain text files of any size"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 8,
                                    justifyContent: 'center',
                                    marginTop: '.8rem',
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    '.pdf',
                                    '.docx',
                                    '.txt'
                                ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: '3px 10px',
                                            borderRadius: 6,
                                            border: '1px solid var(--border)',
                                            color: 'var(--muted)'
                                        },
                                        children: t
                                    }, t, false, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 226,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 10,
                            marginBottom: '1.2rem',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    fontSize: '.875rem',
                                    color: 'var(--muted)'
                                },
                                children: "Show top"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 233,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                value: topN,
                                min: 1,
                                max: 500,
                                onChange: (e)=>setTopN(Number(e.target.value)),
                                style: {
                                    width: 70,
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    fontSize: '.875rem'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    fontSize: '.875rem',
                                    color: 'var(--muted)'
                                },
                                children: "words"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 237,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: exportCSV,
                                disabled: results.length === 0,
                                style: {
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--muted)',
                                    fontSize: '.85rem',
                                    cursor: 'pointer'
                                },
                                children: "Export CSV"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: exportTXT,
                                disabled: results.length === 0,
                                style: {
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--muted)',
                                    fontSize: '.85rem',
                                    cursor: 'pointer'
                                },
                                children: "Export TXT"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '11px 15px',
                            borderRadius: 10,
                            fontSize: '.85rem',
                            marginBottom: '1.2rem',
                            border: `1px solid ${statusType === 'error' ? '#7f1d1d' : 'var(--accent)'}`,
                            background: statusType === 'error' ? '#1c0a0a' : 'var(--surface)',
                            color: statusType === 'error' ? '#f87171' : 'var(--accent2)'
                        },
                        children: status
                    }, void 0, false, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 250,
                        columnNumber: 11
                    }, this),
                    fileInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 14px',
                            background: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            marginBottom: '1.2rem',
                            fontSize: '.85rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "📎"
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 261,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: 600,
                                    color: 'var(--accent2)'
                                },
                                children: fileInfo.name
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 262,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--muted)'
                                },
                                children: fileInfo.size
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 260,
                        columnNumber: 11
                    }, this),
                    results.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))',
                                    gap: 10,
                                    marginBottom: '1.2rem'
                                },
                                children: [
                                    {
                                        label: 'Total Words',
                                        value: totalWords.toLocaleString()
                                    },
                                    {
                                        label: 'Unique Words',
                                        value: results.length.toLocaleString()
                                    },
                                    {
                                        label: 'Top Word',
                                        value: results[0]?.word || '—'
                                    },
                                    {
                                        label: 'Top Count',
                                        value: results[0]?.count.toLocaleString() || '—'
                                    }
                                ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 12,
                                            padding: '1rem 1.2rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    letterSpacing: '.08em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--muted)',
                                                    marginBottom: 4
                                                },
                                                children: s.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 279,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '1.6rem',
                                                    fontWeight: 700,
                                                    fontFamily: 'monospace'
                                                },
                                                children: s.value
                                            }, void 0, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 280,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, s.label, true, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 278,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 10,
                                    marginBottom: '1rem',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: searchQ,
                                        onChange: (e)=>setSearchQ(e.target.value),
                                        placeholder: "Search a word in results…",
                                        style: {
                                            flex: 1,
                                            padding: '9px 14px',
                                            borderRadius: 8,
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)',
                                            color: 'var(--text)',
                                            fontSize: '.875rem'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '.8rem',
                                            color: 'var(--muted)',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: searchQ ? `${filtered.length} found` : `${filtered.length} words shown`
                                    }, void 0, false, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 286,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    style: {
                                        width: '100%',
                                        borderCollapse: 'collapse'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                style: {
                                                    background: 'var(--surface2)'
                                                },
                                                children: [
                                                    'Rank',
                                                    'Word (click to explain)',
                                                    'Count',
                                                    'Frequency'
                                                ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            padding: '11px 16px',
                                                            textAlign: 'left',
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            letterSpacing: '.08em',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--muted)',
                                                            borderBottom: '1px solid var(--border)'
                                                        },
                                                        children: h
                                                    }, h, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 301,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: filtered.map((r, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    style: {
                                                        borderBottom: '1px solid var(--border)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '10px 16px',
                                                                color: 'var(--muted)',
                                                                fontFamily: 'monospace',
                                                                fontSize: '.8rem',
                                                                width: 48
                                                            },
                                                            children: idx + 1
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '10px 16px'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setAITab('explain');
                                                                    runExplain(r.word);
                                                                },
                                                                style: {
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: 'var(--accent2)',
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '.88rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    textDecoration: 'underline dotted',
                                                                    padding: 0
                                                                },
                                                                children: r.word
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 312,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                                            lineNumber: 311,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '10px 16px',
                                                                fontFamily: 'monospace',
                                                                fontSize: '.875rem',
                                                                width: 80
                                                            },
                                                            children: r.count.toLocaleString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                                            lineNumber: 317,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: '10px 16px',
                                                                width: 180
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    background: 'var(--surface2)',
                                                                    borderRadius: 99,
                                                                    height: 7,
                                                                    overflow: 'hidden',
                                                                    border: '1px solid var(--border)'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        height: '100%',
                                                                        borderRadius: 99,
                                                                        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                                                                        width: `${(r.count / maxCount * 100).toFixed(1)}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/WordAnalyzer.tsx",
                                                                    lineNumber: 320,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 319,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                                            lineNumber: 318,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, r.word, true, {
                                                    fileName: "[project]/components/WordAnalyzer.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/WordAnalyzer.tsx",
                                            lineNumber: 307,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/WordAnalyzer.tsx",
                                    lineNumber: 299,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 298,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 16,
                                    overflow: 'hidden'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'var(--surface2)',
                                            padding: '1rem 1.2rem',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: 'var(--accent2)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 334,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '.95rem',
                                                    fontWeight: 600
                                                },
                                                children: "AI Assistant — powered by Claude"
                                            }, void 0, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 335,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 333,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 6,
                                            padding: '.8rem 1.2rem',
                                            borderBottom: '1px solid var(--border)',
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            'summarize',
                                            'explain',
                                            'qa'
                                        ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setAITab(tab),
                                                style: {
                                                    padding: '6px 14px',
                                                    borderRadius: 8,
                                                    fontSize: '.82rem',
                                                    cursor: 'pointer',
                                                    fontFamily: 'system-ui',
                                                    border: aiTab === tab ? '1px solid var(--accent)' : '1px solid var(--border)',
                                                    background: aiTab === tab ? 'var(--accent)' : 'transparent',
                                                    color: aiTab === tab ? '#fff' : 'var(--muted)'
                                                },
                                                children: tab === 'summarize' ? '📝 Summarize' : tab === 'explain' ? '💡 Explain a Word' : '❓ Ask Anything'
                                            }, tab, false, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 341,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '1.2rem'
                                        },
                                        children: [
                                            aiTab === 'summarize' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            flexWrap: 'wrap',
                                                            marginBottom: '1rem'
                                                        },
                                                        children: [
                                                            {
                                                                label: 'Brief summary',
                                                                type: 'brief'
                                                            },
                                                            {
                                                                label: 'Detailed summary',
                                                                type: 'detailed'
                                                            },
                                                            {
                                                                label: 'Key bullet points',
                                                                type: 'bullets'
                                                            },
                                                            {
                                                                label: 'Main topic only',
                                                                type: 'topic'
                                                            }
                                                        ].map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>runSummarize(b.type),
                                                                style: {
                                                                    padding: '5px 12px',
                                                                    borderRadius: 6,
                                                                    border: '1px solid var(--border)',
                                                                    background: 'transparent',
                                                                    color: 'var(--muted)',
                                                                    fontSize: '.78rem',
                                                                    cursor: 'pointer',
                                                                    fontFamily: 'system-ui'
                                                                },
                                                                children: b.label
                                                            }, b.type, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 365,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 358,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIResponse, {
                                                        text: aiResponses.summarize,
                                                        status: aiStatus.summarize,
                                                        placeholder: "Click a button above to summarize the uploaded text."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 357,
                                                columnNumber: 19
                                            }, this),
                                            aiTab === 'explain' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            marginBottom: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: explainWord,
                                                                onChange: (e)=>setExplainWord(e.target.value),
                                                                onKeyDown: (e)=>e.key === 'Enter' && runExplain(),
                                                                placeholder: "Type a word to explain (or click one in the table)…",
                                                                style: {
                                                                    flex: 1,
                                                                    padding: '9px 14px',
                                                                    borderRadius: 8,
                                                                    border: '1px solid var(--border)',
                                                                    background: 'var(--bg)',
                                                                    color: 'var(--text)',
                                                                    fontSize: '.875rem'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 379,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>runExplain(),
                                                                style: {
                                                                    padding: '9px 20px',
                                                                    borderRadius: 8,
                                                                    border: 'none',
                                                                    background: 'var(--accent)',
                                                                    color: '#fff',
                                                                    fontSize: '.875rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                },
                                                                children: "Explain"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 383,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIResponse, {
                                                        text: aiResponses.explain,
                                                        status: aiStatus.explain,
                                                        placeholder: "Enter a word above — or click any word in the table — to get its meaning in context of the document."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 388,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 377,
                                                columnNumber: 19
                                            }, this),
                                            aiTab === 'qa' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            flexWrap: 'wrap',
                                                            marginBottom: '1rem'
                                                        },
                                                        children: [
                                                            'What is the main topic of this document?',
                                                            'Who is the author or subject?',
                                                            'What are the most important facts?',
                                                            'What conclusions are mentioned?'
                                                        ].map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setQAInput(q);
                                                                    setTimeout(runQA, 50);
                                                                },
                                                                style: {
                                                                    padding: '5px 12px',
                                                                    borderRadius: 6,
                                                                    border: '1px solid var(--border)',
                                                                    background: 'transparent',
                                                                    color: 'var(--muted)',
                                                                    fontSize: '.78rem',
                                                                    cursor: 'pointer',
                                                                    fontFamily: 'system-ui'
                                                                },
                                                                children: q
                                                            }, q, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 402,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            marginBottom: '1rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: qaInput,
                                                                onChange: (e)=>setQAInput(e.target.value),
                                                                onKeyDown: (e)=>e.key === 'Enter' && runQA(),
                                                                placeholder: "Ask anything about the document…",
                                                                style: {
                                                                    flex: 1,
                                                                    padding: '9px 14px',
                                                                    borderRadius: 8,
                                                                    border: '1px solid var(--border)',
                                                                    background: 'var(--bg)',
                                                                    color: 'var(--text)',
                                                                    fontSize: '.875rem'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 409,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: runQA,
                                                                style: {
                                                                    padding: '9px 20px',
                                                                    borderRadius: 8,
                                                                    border: 'none',
                                                                    background: 'var(--accent)',
                                                                    color: '#fff',
                                                                    fontSize: '.875rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer'
                                                                },
                                                                children: "Ask"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                                lineNumber: 413,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 408,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIResponse, {
                                                        text: aiResponses.qa,
                                                        status: aiStatus.qa,
                                                        placeholder: "Ask any question about the uploaded document."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                                        lineNumber: 418,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/WordAnalyzer.tsx",
                                                lineNumber: 394,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/WordAnalyzer.tsx",
                                        lineNumber: 353,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/WordAnalyzer.tsx",
                                lineNumber: 330,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        style: {
                            textAlign: 'center',
                            marginTop: '2.5rem',
                            color: 'var(--muted)',
                            fontSize: '.78rem'
                        },
                        children: "IIT Mandi Mini Project · API key stays on the server · No file data stored"
                    }, void 0, false, {
                        fileName: "[project]/components/WordAnalyzer.tsx",
                        lineNumber: 426,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WordAnalyzer.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(WordAnalyzer, "BEgr1JJUjWLQcvWlR8rxP2gNY1g=");
_c = WordAnalyzer;
// ── AI Response box ────────────────────────────────────────────────────────────
function AIResponse({ text, status, placeholder }) {
    const isLoading = status === 'loading';
    const isEmpty = !text && status === 'idle';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: 80,
            padding: '1rem',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: '.875rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            color: isLoading ? 'var(--accent2)' : isEmpty ? 'var(--muted)' : 'var(--text)',
            fontStyle: isEmpty ? 'italic' : 'normal'
        },
        children: isLoading ? 'Thinking…' : text || placeholder
    }, void 0, false, {
        fileName: "[project]/components/WordAnalyzer.tsx",
        lineNumber: 439,
        columnNumber: 5
    }, this);
}
_c1 = AIResponse;
var _c, _c1;
__turbopack_context__.k.register(_c, "WordAnalyzer");
__turbopack_context__.k.register(_c1, "AIResponse");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_0s_gmml._.js.map