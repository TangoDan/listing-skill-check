"use client";

import { AnalysisResult } from "@/types/analysis";
import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Target, Download, FileText, CheckCircle2, XCircle, BarChart3, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, translations } from "@/lib/translations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DashboardProps {
    data: AnalysisResult;
    lang: Language;
}

export function Dashboard({ data, lang }: DashboardProps) {
    const t = translations[lang];

    const getScoreColor = (score: number) => {
        if (score >= 2) return "text-green-500";
        if (score >= 1) return "text-yellow-500";
        return "text-red-500";
    };

    const getClassificationColor = (classification: string) => {
        switch (classification) {
            case "Reliable Agent": return "text-green-400 border-green-400/30 bg-green-400/10";
            case "Trainable Potential": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
            case "High Risk": return "text-red-400 border-red-400/30 bg-red-400/10";
            default: return "text-slate-400 border-slate-400/30 bg-slate-400/10";
        }
    };

    const getDimensionLabel = (key: string): string => {
        return (t as any)[key] || key.replace("_", " ");
    };

    // --- Export Functions ---
    const handleExportMD = () => {
        const md = `### Listing Interview Skill Evaluation
**Broker Report — Standard v1.0**

**Interview Type:** Listing interview  
**Evaluation Basis:** Observable commercial behaviors

---

### Executive Result
**Overall Skill Score:** ${data.overall_score} / 21  
**Classification:** ${data.classification}

---

### Dimension Evaluation
| Dimension | Score (0–3) | Observed Evidence |
|---------|------------|------------------|
${Object.entries(data.dimensions || {}).map(([key, dim]) => `| ${getDimensionLabel(key)} | ${dim.score} | ${dim.evidence} |`).join("\n")}

---

### Skill Gap Analysis
**Primary Weakness:** ${data.skill_gap.primary_weakness}

**Observed Pattern:**
${data.skill_gap.observed_pattern}

**Commercial Impact:**
${data.skill_gap.commercial_impact}

---

### Training Recommendation
**Priority Training Focus:**
${data.training_recommendation.priority_focus}

**What to train:**
${data.training_recommendation.what_to_train.map(item => `- ${item}`).join("\n")}

**What to observe in next interview:**
${data.training_recommendation.what_to_observe}

---

### Broker Decision Guide
- Suitable for focused training: ${data.broker_decision.suitable_for_training ? "Yes" : "No"}
- Suitable for high-value listings: ${data.broker_decision.suitable_for_high_value ? "Yes" : "No"}
- Recommended re-evaluation: ${data.broker_decision.recommended_reevaluation}

---

### Disclaimer
${t.disclaimer}
`;

        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "broker_report_v1.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        const margin = 15;
        const width = pageWidth - margin * 2;

        // Header
        doc.setFontSize(16);
        doc.text("Listing Interview Skill Evaluation", margin, y);
        y += 7;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Broker Report — Standard v1.0", margin, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Interview Type: Listing interview", margin, y);
        y += 5;
        doc.text("Evaluation Basis: Observable commercial behaviors", margin, y);
        y += 10;

        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Executive Result
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(t.executiveResult, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Overall Skill Score: ${data.overall_score} / 21`, margin, y);
        y += 5;
        doc.text(`Classification: ${data.classification}`, margin, y);
        y += 10;

        // Table
        const tableData = Object.entries(data.dimensions).map(([key, dim]) => [
            getDimensionLabel(key),
            dim.score.toString(),
            dim.evidence
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Dimension', 'Score (0-3)', 'Observed Evidence']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [51, 65, 85] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 'auto' }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;

        // Skill Gap
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(t.skillGapAnalysis, margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.text(`${t.primaryWeakness}: ${data.skill_gap.primary_weakness}`, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        const patternLines = doc.splitTextToSize(`${t.observedPattern}: ${data.skill_gap.observed_pattern}`, width);
        doc.text(patternLines, margin, y);
        y += patternLines.length * 5 + 5;

        const impactLines = doc.splitTextToSize(`${t.commercialImpact}: ${data.skill_gap.commercial_impact}`, width);
        doc.text(impactLines, margin, y);
        y += impactLines.length * 5 + 10;

        // Training Recommendation
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(t.trainingRecommendation, margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.text(`${t.priorityFocus}: ${data.training_recommendation.priority_focus}`, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.text(t.whatToTrain + ":", margin, y);
        y += 5;
        data.training_recommendation.what_to_train.forEach(item => {
            doc.text(`- ${item}`, margin + 5, y);
            y += 5;
        });
        y += 2;
        doc.text(`${t.whatToObserve}: ${data.training_recommendation.what_to_observe}`, margin, y);
        y += 15;

        // Decision Guide
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(t.brokerDecisionGuide, margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${t.suitableForTraining} ${data.broker_decision.suitable_for_training ? "Yes" : "No"}`, margin, y);
        y += 5;
        doc.text(`${t.suitableForHighValue} ${data.broker_decision.suitable_for_high_value ? "Yes" : "No"}`, margin, y);
        y += 5;
        doc.text(`${t.recommendedReevaluation} ${data.broker_decision.recommended_reevaluation}`, margin, y);

        y += 15;
        // Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(100);
        const disclaimerLines = doc.splitTextToSize(t.disclaimer, width);
        doc.text(disclaimerLines, margin, y);

        doc.save("broker_report_v1.pdf");
    };

    const handleExportTranscript = () => {
        const text = data.labeled_transcript || data.transcript || "";
        const blob = new Blob([text], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transcription.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8 pb-20"
        >
            {/* Export Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
                <button onClick={handleExportTranscript} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-sm">
                    <FileText size={16} /> {t.exportTranscript}
                </button>
                <button onClick={handleExportMD} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                    <FileText size={16} /> {t.exportMD}
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm text-white font-medium">
                    <Download size={16} /> {t.exportPDF}
                </button>
            </div>

            {/* Header Report Style */}
            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldAlert size={120} />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            Listing Interview Skill Evaluation
                        </h2>
                        <p className="text-slate-400 font-medium">Broker Report — Standard v1.0</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="font-semibold text-slate-300">Interview Type:</span> Listing interview
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <span className="font-semibold text-slate-300">Evaluation Basis:</span> Observable commercial behaviors
                        </div>
                    </div>
                </div>
            </div>

            {/* Executive Result */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{t.executiveResult}</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" className="text-slate-800 fill-transparent" />
                            <circle
                                cx="80" cy="80" r="72"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeDasharray={452.34}
                                strokeDashoffset={452.34 - (452.34 * (data.overall_score || 0)) / 21}
                                className={cn("fill-transparent transition-all duration-1000", (data.overall_score || 0) >= 15 ? "text-green-500" : (data.overall_score || 0) >= 8 ? "text-yellow-500" : "text-red-500")}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-white">{data.overall_score || 0}</span>
                            <span className="text-slate-500 text-xs font-bold">/ 21</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-card rounded-2xl p-8 flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                        <div className={cn("inline-flex px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-widest mb-2", getClassificationColor(data.classification))}>
                            {data.classification}
                        </div>
                        <h4 className="text-2xl font-bold text-white">Classification Status</h4>
                        <p className="text-slate-400 leading-relaxed">
                            {data.classification === "Reliable Agent" && "Consistent professional execution."}
                            {data.classification === "Trainable Potential" && "Acceptable base with clear execution gaps. Focused training is recommended to address identified gaps."}
                            {data.classification === "High Risk" && "Inconsistent execution of core commercial behaviors."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dimension Evaluation Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <BarChart3 className="text-blue-400" /> {t.dimensionEvaluation}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Dimension</th>
                                <th className="px-6 py-4 font-semibold text-center">Score (0–3)</th>
                                <th className="px-6 py-4 font-semibold">Observed Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Object.entries(data.dimensions || {}).map(([key, dim]) => (
                                <tr key={key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{getDimensionLabel(key)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn("text-lg font-bold", getScoreColor(dim.score))}>
                                            {dim.score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                                        {dim.evidence || "No evidence provided."}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gap Analysis & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-2xl p-8 space-y-6 bg-red-500/5 border-red-500/10">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-red-400">
                        <AlertTriangle size={24} /> {t.skillGapAnalysis}
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-red-400/60 uppercase">{t.primaryWeakness}</span>
                            <p className="text-white font-bold text-lg">{data.skill_gap.primary_weakness}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">{t.observedPattern}</span>
                            <p className="text-slate-300 text-sm leading-relaxed">{data.skill_gap.observed_pattern}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">{t.commercialImpact}</span>
                            <p className="text-slate-300 text-sm leading-relaxed">{data.skill_gap.commercial_impact}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-8 space-y-6 bg-blue-500/5 border-blue-500/10">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-blue-400">
                        <Lightbulb size={24} /> {t.trainingRecommendation}
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-blue-400/60 uppercase">{t.priorityFocus}</span>
                            <p className="text-white font-bold text-lg">{data.training_recommendation.priority_focus}</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">{t.whatToTrain}</span>
                            <div className="space-y-2">
                                {data.training_recommendation.what_to_train.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1 pt-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">{t.whatToObserve}</span>
                            <p className="text-slate-300 text-sm italic">"{data.training_recommendation.what_to_observe}"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Broker Decision Guide */}
            <div className="glass-card rounded-2xl p-8 border border-white/5">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                    <Target className="text-purple-400" /> {t.brokerDecisionGuide}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className={cn("p-4 rounded-full bg-slate-800", data.broker_decision.suitable_for_training ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
                            {data.broker_decision.suitable_for_training ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">{t.suitableForTraining}</p>
                            <p className="text-xs text-slate-500">{data.broker_decision.suitable_for_training ? "Recommended for immediate focus" : "Requires core training first"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className={cn("p-4 rounded-full bg-slate-800", data.broker_decision.suitable_for_high_value ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
                            {data.broker_decision.suitable_for_high_value ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">{t.suitableForHighValue}</p>
                            <p className="text-xs text-slate-500">{data.broker_decision.suitable_for_high_value ? "Authorized for top-tier listings" : "Hold for low-complexity cases"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500">
                            <BarChart3 size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">{t.recommendedReevaluation}</p>
                            <p className="text-xs text-slate-500">{data.broker_decision.recommended_reevaluation}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
