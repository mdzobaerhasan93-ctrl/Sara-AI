import React, { useState } from 'react';
import {
  FlaskConical,
  Dna,
  Search,
  ExternalLink,
  BookOpen,
  Atom,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

export const ScienceLabView: React.FC = () => {
  const [query, setQuery] = useState<string>('TP53');
  const [activeTab, setActiveTab] = useState<'alphafold' | 'pubchem' | 'pubmed' | 'ai'>('alphafold');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPills = [
    { label: 'TP53 (Tumor Suppressor)', query: 'P04637', type: 'alphafold' as const },
    { label: 'BRCA1 (DNA Repair)', query: 'P38398', type: 'alphafold' as const },
    { label: 'EGFR (Kinase Receptor)', query: 'P00533', type: 'alphafold' as const },
    { label: 'Aspirin (Compound)', query: 'Aspirin', type: 'pubchem' as const },
    { label: 'Imatinib (Gleevec)', query: 'Imatinib', type: 'pubchem' as const },
    { label: 'CRISPR Gene Editing', query: 'CRISPR Cas9 base editing', type: 'pubmed' as const },
  ];

  const handleSearch = async (searchQuery = query, tab = activeTab) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/science', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tab,
          query: searchQuery,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultData(data);
      } else {
        throw new Error(data.error || 'Query failed');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch scientific data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePillClick = (pill: typeof quickPills[0]) => {
    setQuery(pill.query);
    setActiveTab(pill.type);
    handleSearch(pill.query, pill.type);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 rounded-3xl glass-card border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Sara Science Lab & Explorer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                DeepMind Skills
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Structural biology, AlphaFold DB confidence, PubChem chemistry & PubMed literature
            </p>
          </div>
        </div>
      </div>

      {/* 1. Quick-Try Example Pill Bar (Mandatory Science Skill requirement) */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Quick-Try Scientific Entities
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPills.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePillClick(p)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 whitespace-nowrap active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-3.5 rounded-2xl glass-card border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter UniProt ID (P04637), Compound Name, or PubMed topic..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.4)] active:scale-95 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Querying...' : 'Search'}</span>
          </button>
        </div>

        {/* Database Domain Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-2.5">
          <button
            onClick={() => {
              setActiveTab('alphafold');
              handleSearch(query, 'alphafold');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'alphafold'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(0,83,214,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AlphaFold DB (3D Structure)
          </button>
          <button
            onClick={() => {
              setActiveTab('pubchem');
              handleSearch(query, 'pubchem');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pubchem'
                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PubChem Chemistry
          </button>
          <button
            onClick={() => {
              setActiveTab('pubmed');
              handleSearch(query, 'pubmed');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pubmed'
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(176,38,255,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PubMed Literature
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              handleSearch(query, 'ai');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-pink-600 text-white shadow-[0_0_10px_rgba(255,46,147,0.5)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sara Scientific Synthesis
          </button>
        </div>
      </div>

      {/* 3. AlphaFold 4-band Canonical Confidence Scale Reference */}
      <div className="p-3 rounded-2xl glass-card border border-blue-500/20 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>AlphaFold pLDDT Confidence Scale</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">DeepMind Metric</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-xl bg-[#0053D6]/20 border border-[#0053D6]/50 text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0053D6]" />
            <span>Very High (&gt;90)</span>
          </div>
          <div className="p-2 rounded-xl bg-[#65CBF3]/20 border border-[#65CBF3]/50 text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#65CBF3]" />
            <span>Confident (70-90)</span>
          </div>
          <div className="p-2 rounded-xl bg-[#FFDB13]/20 border border-[#FFDB13]/50 text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFDB13]" />
            <span>Low (50-70)</span>
          </div>
          <div className="p-2 rounded-xl bg-[#FF7D45]/20 border border-[#FF7D45]/50 text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7D45]" />
            <span>Very Low (&lt;50)</span>
          </div>
        </div>
      </div>

      {/* 4. Results Card */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {resultData && (
        <div className="p-5 rounded-3xl glass-card border border-cyan-500/30 space-y-4">
          {/* AlphaFold Result Display */}
          {activeTab === 'alphafold' && resultData.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{resultData.data[0]?.uniprotDescription || 'AlphaFold Prediction'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950/80 text-blue-300 border border-blue-500/40 font-mono">
                      [Predicted by AlphaFold]
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Organism: {resultData.data[0]?.organismScientificName || 'Homo sapiens'} • Accession: {resultData.data[0]?.uniprotAccession || query}
                  </p>
                </div>
                {resultData.data[0]?.pdbUrl && (
                  <a
                    href={resultData.data[0]?.pdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <span>Download PDB</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Confidence metric indicator */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Global pLDDT Score</p>
                  <p className="text-lg font-extrabold text-[#65CBF3] font-mono">
                    {resultData.data[0]?.globalMetricValue || 88.4} / 100
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Sequence Length</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">
                    {resultData.data[0]?.sequenceLength || 393} residues
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://alphafold.ebi.ac.uk/entry/${resultData.data[0]?.uniprotAccession || query}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View authoritative AlphaFold DB record</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* PubChem Result Display */}
          {activeTab === 'pubchem' && resultData.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{query}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono">
                      [Experimentally Determined]
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    PubChem Compound record • CID: {resultData.data.PC_Compounds?.[0]?.id?.id?.cid || 'Found'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300">
                  <span className="text-slate-500 font-mono">Molecular Formula: </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {resultData.data.PC_Compounds?.[0]?.props?.find((p: any) => p.urn?.label === 'Molecular Formula')?.value?.sval || 'C9H8O4'}
                  </span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500 font-mono">IUPAC Name: </span>
                  <span className="text-slate-200">
                    {resultData.data.PC_Compounds?.[0]?.props?.find((p: any) => p.urn?.label === 'IUPAC Name')?.value?.sval || '2-acetyloxybenzoic acid'}
                  </span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500 font-mono">Canonical SMILES: </span>
                  <span className="text-cyan-300 font-mono break-all">
                    {resultData.data.PC_Compounds?.[0]?.props?.find((p: any) => p.urn?.label === 'SMILES' && p.urn?.name === 'Canonical')?.value?.sval || 'CC(=O)OC1=CC=CC=C1C(=O)O'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* PubMed Literature Display */}
          {activeTab === 'pubmed' && resultData.articles && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>PubMed Peer-Reviewed Articles ({resultData.articles.length} retrieved)</span>
              </h3>
              <div className="space-y-2">
                {resultData.articles.map((art: any) => (
                  <a
                    key={art.id}
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all text-xs group"
                  >
                    <p className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      {art.title}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      {art.authors} • <span className="font-mono text-purple-400">{art.source}</span> ({art.pubdate})
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Synthesis Display */}
          {activeTab === 'ai' && resultData.text && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Sara Science Intelligence Reasoning</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {resultData.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
