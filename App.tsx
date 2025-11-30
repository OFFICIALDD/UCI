import React, { useState, useEffect } from 'react';
import { 
  AppMode, 
  LANGUAGES, 
  CodeAnalysisResult, 
  GeneratedCodeResult,
  DiffResult
} from './types';
import Sidebar from './components/Sidebar';
import QualityChart from './components/QualityChart';
import { 
  generateCode, 
  analyzeCode, 
  convertCode, 
  generateFlowchartSvg,
  simulateRunner,
  compareVersions
} from './services/geminiService';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Zap,
  Terminal,
  ShieldCheck,
  GitCompare,
  ArrowRight
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [inputCode, setInputCode] = useState<string>('');
  const [secondaryCode, setSecondaryCode] = useState<string>(''); // For Diff mode
  const [prompt, setPrompt] = useState<string>('');
  const [language, setLanguage] = useState<string>('Python');
  const [targetLang, setTargetLang] = useState<string>('JavaScript');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCodeResult | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [flowchartSvg, setFlowchartSvg] = useState<string>('');
  const [runnerOutput, setRunnerOutput] = useState<string>('');

  // Clear states when mode changes
  useEffect(() => {
    setAnalysisResult(null);
    setGeneratedResult(null);
    setDiffResult(null);
    setFlowchartSvg('');
    setRunnerOutput('');
    if (mode === AppMode.GENERATOR) setInputCode('');
  }, [mode]);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (mode === AppMode.GENERATOR) {
        const res = await generateCode(prompt, language);
        setGeneratedResult(res);
        setInputCode(res.code); // Sync input for potential analysis later
      } 
      else if (mode === AppMode.ANALYZER) {
        if (!inputCode) return;
        const res = await analyzeCode(inputCode, language);
        setAnalysisResult(res);
      }
      else if (mode === AppMode.CONVERTER) {
        if (!inputCode) return;
        const res = await convertCode(inputCode, language, targetLang);
        setGeneratedResult(res);
      }
      else if (mode === AppMode.DIFF) {
        if (!inputCode || !secondaryCode) return;
        const res = await compareVersions(inputCode, secondaryCode);
        setDiffResult(res);
      }
      else if (mode === AppMode.FLOWCHART) {
        if (!inputCode) return;
        const svg = await generateFlowchartSvg(inputCode);
        setFlowchartSvg(svg);
      }
      else if (mode === AppMode.RUNNER) {
        if (!inputCode) return;
        const output = await simulateRunner(inputCode, language);
        setRunnerOutput(output);
      }
    } catch (e) {
      alert("An error occurred. Please check your API Key and connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      <Sidebar currentMode={mode} setMode={setMode} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Area */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">
              {mode.toLowerCase().replace('_', ' ')}
            </h2>
            <div className="h-4 w-[1px] bg-gray-700"></div>
            
            {/* Language Selectors (Hidden in Diff/Flowchart mostly, but good to keep) */}
            <div className="flex items-center gap-2">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              
              {mode === AppMode.CONVERTER && (
                <>
                  <span className="text-gray-500">→</span>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleAction}
            disabled={loading}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-white shadow-lg transition-all
              ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/20 active:transform active:scale-95'}
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              mode === AppMode.DIFF ? <GitCompare size={18} /> : <Sparkles size={18} />
            )}
            <span>
              {mode === AppMode.GENERATOR ? 'Generate' : 
               mode === AppMode.ANALYZER ? 'Analyze' :
               mode === AppMode.CONVERTER ? 'Convert' :
               mode === AppMode.DIFF ? 'Compare' :
               mode === AppMode.RUNNER ? 'Run Simulation' :
               'Visualize'}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className={`grid gap-6 h-full min-h-[500px] ${mode === AppMode.DIFF ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            
            {/* LEFT COLUMN: INPUT / CODE (Or Split view for Diff) */}
            {mode === AppMode.DIFF ? (
              // DIFF VIEW LAYOUT
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="flex flex-col gap-2 h-full">
                   <label className="text-xs font-mono text-gray-400">Original Version</label>
                   <textarea 
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="// Paste original code..."
                      className="flex-1 w-full bg-[#0d1117] text-gray-300 p-4 font-mono text-sm outline-none resize-none border border-gray-800 rounded-lg"
                      spellCheck={false}
                   />
                </div>
                <div className="flex flex-col gap-2 h-full">
                   <label className="text-xs font-mono text-gray-400">New / Modified Version</label>
                   <textarea 
                      value={secondaryCode}
                      onChange={(e) => setSecondaryCode(e.target.value)}
                      placeholder="// Paste new code to compare..."
                      className="flex-1 w-full bg-[#0d1117] text-gray-300 p-4 font-mono text-sm outline-none resize-none border border-gray-800 rounded-lg"
                      spellCheck={false}
                   />
                </div>
              </div>
            ) : (
              // STANDARD LAYOUT
              <div className="flex flex-col gap-4 h-full">
                {mode === AppMode.GENERATOR && (
                   <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                     <label className="block text-sm font-medium text-gray-400 mb-2">Natural Language Prompt</label>
                     <textarea
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                       placeholder="e.g., Create a secure login API with JWT..."
                       className="w-full h-32 bg-gray-950 border border-gray-700 rounded-md p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                     />
                   </div>
                )}

                <div className="flex-1 flex flex-col bg-gray-900 rounded-lg border border-gray-800 overflow-hidden relative shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800">
                    <span className="text-xs font-mono text-gray-400">Input Code / Source</span>
                    <div className="flex gap-2">
                       <button onClick={() => navigator.clipboard.writeText(inputCode)} className="p-1 hover:text-white text-gray-500"><Copy size={14}/></button>
                    </div>
                  </div>
                  <textarea 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="// Paste or write your code here..."
                    className="flex-1 w-full bg-[#0d1117] text-gray-300 p-4 font-mono text-sm outline-none resize-none border-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* RIGHT COLUMN: OUTPUT / ANALYSIS (Or Bottom for Diff Result) */}
            <div className={`flex flex-col h-full gap-4 overflow-y-auto pr-2 ${mode === AppMode.DIFF ? 'h-auto mt-4' : ''}`}>
              
              {/* --- GENERATOR / CONVERTER OUTPUT --- */}
              {(mode === AppMode.GENERATOR || mode === AppMode.CONVERTER) && generatedResult && (
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="px-4 py-2 bg-purple-900/20 border-b border-purple-500/20 flex items-center justify-between">
                      <span className="text-purple-300 text-xs font-bold uppercase">Generated Result</span>
                      <Copy size={14} className="text-purple-300 cursor-pointer" onClick={() => navigator.clipboard.writeText(generatedResult.code)}/>
                    </div>
                    <pre className="p-4 bg-[#0d1117] text-sm text-green-400 font-mono overflow-auto max-h-[400px]">
                      {generatedResult.code}
                    </pre>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400"/> Explanation
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{generatedResult.explanation}</p>
                  </div>
                </div>
              )}

              {/* --- DIFF RESULT --- */}
              {mode === AppMode.DIFF && diffResult && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
                   <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><GitCompare size={20}/></div>
                      <h3 className="text-lg font-bold text-white">Comparison Report</h3>
                   </div>
                   
                   <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                     <p className="text-gray-300 text-sm leading-relaxed">{diffResult.summary}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-green-900/30">
                        <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wide">Key Changes</h4>
                        <ul className="space-y-2">
                           {diffResult.changes.map((c, i) => (
                             <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                               <ArrowRight size={14} className="mt-1 text-green-500 shrink-0"/> {c}
                             </li>
                           ))}
                        </ul>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-orange-900/30">
                         <h4 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wide">Risk Assessment</h4>
                         <p className="text-sm text-gray-400">{diffResult.riskAssessment}</p>
                      </div>
                   </div>
                </div>
              )}

              {/* --- ANALYZER OUTPUT --- */}
              {mode === AppMode.ANALYZER && analysisResult && (
                <div className="space-y-6">
                  {/* Score Chart */}
                  <QualityChart metrics={analysisResult.qualityScore} />

                  {/* Complexity & Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-500 uppercase">Time Complexity</p>
                      <p className="text-xl font-bold text-blue-400 font-mono">{analysisResult.timeComplexity}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs text-gray-500 uppercase">Space Complexity</p>
                      <p className="text-xl font-bold text-pink-400 font-mono">{analysisResult.spaceComplexity}</p>
                    </div>
                  </div>

                  {/* Logic Explanation */}
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                     <h4 className="text-sm font-semibold text-white mb-2">Code Logic</h4>
                     <p className="text-sm text-gray-400">{analysisResult.explanation}</p>
                  </div>

                  {/* Security */}
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-red-900/30">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <ShieldCheck size={16}/> Security Vulnerabilities
                    </h4>
                    {analysisResult.securityIssues.length > 0 ? (
                       <ul className="space-y-2">
                         {analysisResult.securityIssues.map((issue, i) => (
                           <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                             <AlertTriangle size={14} className="text-red-500 mt-1 shrink-0"/>
                             {issue}
                           </li>
                         ))}
                       </ul>
                    ) : (
                      <p className="text-sm text-green-500 flex items-center gap-2"><CheckCircle2 size={14}/> No critical issues found.</p>
                    )}
                  </div>

                  {/* Improvements */}
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-900/30">
                     <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                       <Sparkles size={16}/> Suggested Optimizations
                     </h4>
                     <ul className="space-y-2">
                        {analysisResult.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-blue-500 mt-1">•</span>
                            {imp}
                          </li>
                        ))}
                     </ul>
                  </div>
                </div>
              )}

              {/* --- FLOWCHART OUTPUT --- */}
              {mode === AppMode.FLOWCHART && flowchartSvg && (
                <div className="h-full bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
                  <div className="p-3 border-b border-gray-800 text-xs text-gray-400 uppercase font-semibold">
                    Visual Logic Graph
                  </div>
                  <div 
                    className="flex-1 p-4 flex items-center justify-center overflow-auto bg-[#1e1e2e]"
                    dangerouslySetInnerHTML={{ __html: flowchartSvg }} 
                  />
                  <div className="p-2 text-center text-xs text-gray-600">
                     SVG Generated by AI
                  </div>
                </div>
              )}

              {/* --- RUNNER OUTPUT --- */}
              {mode === AppMode.RUNNER && runnerOutput && (
                <div className="h-full flex flex-col">
                   <div className="bg-black rounded-lg border border-gray-800 overflow-hidden flex-1 font-mono">
                      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
                        <Terminal size={14} /> Console Output (Simulated)
                      </div>
                      <pre className="p-4 text-green-400 text-sm whitespace-pre-wrap">
                        {runnerOutput}
                      </pre>
                   </div>
                </div>
              )}

              {/* --- EMPTY STATE --- */}
              {!generatedResult && !analysisResult && !flowchartSvg && !runnerOutput && !diffResult && !loading && (
                 <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                       <Zap size={32} />
                    </div>
                    <p className="text-sm">Ready to process code</p>
                 </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;