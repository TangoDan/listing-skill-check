"use client";

import { AnalysisResult } from "@/types/analysis";
import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Target, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, translations } from "@/lib/translations";
import jsPDF from "jspdf";

interface DashboardProps {
    data: AnalysisResult;
    lang: Language;
}

export function Dashboard({ data, lang }: DashboardProps) {
    const t = translations[lang];

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-500";
        if (score >= 5) return "text-yellow-500";
        return "text-red-500";
    };

    const getProgressColor = (score: number) => {
        if (score >= 8) return "bg-green-500";
        if (score >= 5) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getPhaseLabel = (key: string): string => {
        const labels: Record<string, string> = {
            qualification: t.qualification,
            trust_building: t.trust_building,
            closing: t.closing,
        };
        return labels[key] || key.replace("_", " ");
    };

    // --- Export Functions ---
    const handleExportMD = () => {
        const md = `# ${t.interviewPerformance}

**${t.aiAnalysis}**

## Score: ${data.overall_score}/100

---

## Phases

${Object.entries(data.phases || {}).map(([key, phase]) => `
### ${getPhaseLabel(key)} - ${phase.score}/10
${phase.summary}
${phase.missing_questions?.length ? `\n**${t.missedQuestions}:**\n${phase.missing_questions.map(q => `- ${q}`).join("\n")}` : ""}
`).join("\n")}

---

## ${t.recommendations}

${(data.recommendations || []).map(r => `- ${r}`).join("\n")}

---

## ${t.actionPlan}

${(data.action_plan || []).map(a => `- [ ] ${a}`).join("\n")}
`;

        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "interview_analysis.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        const lineHeight = 7;
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        // Title
        doc.setFontSize(20);
        doc.text(t.interviewPerformance, margin, y);
        y += lineHeight * 2;

        // Score
        doc.setFontSize(14);
        doc.text(`Score: ${data.overall_score}/100`, margin, y);
        y += lineHeight * 2;

        // Phases
        doc.setFontSize(12);
        Object.entries(data.phases || {}).forEach(([key, phase]) => {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.text(`${getPhaseLabel(key)}: ${phase.score}/10`, margin, y);
            y += lineHeight;
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(phase.summary || "", contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * lineHeight + 5;
        });

        // Recommendations
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(t.recommendations, margin, y);
        y += lineHeight;
        doc.setFont("helvetica", "normal");
        (data.recommendations || []).forEach(rec => {
            if (y > 270) { doc.addPage(); y = 20; }
            const lines = doc.splitTextToSize(`• ${rec}`, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * lineHeight;
        });

        // Action Plan
        y += 5;
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(t.actionPlan, margin, y);
        y += lineHeight;
        doc.setFont("helvetica", "normal");
        (data.action_plan || []).forEach(item => {
            if (y > 270) { doc.addPage(); y = 20; }
            const lines = doc.splitTextToSize(`☐ ${item}`, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * lineHeight;
        });

        doc.save("interview_analysis.pdf");
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
            className="w-full space-y-8"
        >
            {/* Export Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
                <button onClick={handleExportTranscript} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-sm">
                    <FileText size={16} /> {t.exportTranscript}
                </button>
                <button onClick={handleExportMD} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                    <FileText size={16} /> {t.exportMD}
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                    <Download size={16} /> {t.exportPDF}
                </button>
            </div>

            {/* Overall Score */}
            <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {t.interviewPerformance}
                    </h2>
                    <p className="text-slate-400">{t.aiAnalysis}</p>
                </div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-slate-800 fill-transparent" />
                        <circle
                            cx="64" cy="64" r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * (data.overall_score || 0)) / 100}
                            className={cn("fill-transparent transition-all duration-1000", getScoreColor((data.overall_score || 0) / 10))}
                        />
                    </svg>
                    <span className="absolute text-3xl font-bold">{data.overall_score || 0}</span>
                </div>
            </div>

            {/* Phases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(data.phases || {}).map(([key, phase], index) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-2xl p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold capitalize">{getPhaseLabel(key)}</h3>
                            <span className={cn("text-xl font-bold", getScoreColor(phase.score))}>
                                {phase.score}/10
                            </span>
                        </div>

                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", getProgressColor(phase.score))} style={{ width: `${phase.score * 10}%` }} />
                        </div>

                        <p className="text-sm text-slate-300 min-h-[60px]">{phase.summary}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recommendations */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Lightbulb className="text-yellow-400" /> {t.recommendations}
                    </h3>
                    <div className="space-y-3">
                        {(data.recommendations || []).map((rec, i) => (
                            <div key={i} className="glass-card p-4 rounded-xl flex gap-4 items-start">
                                <span className="bg-yellow-500/10 text-yellow-500 p-1 rounded-lg text-xs font-bold mt-1">TIP</span>
                                <p className="text-slate-300">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Plan */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Target className="text-blue-400" /> {t.actionPlan}
                    </h3>
                    <div className="space-y-3">
                        {(data.action_plan || []).map((item, i) => (
                            <div key={i} className="glass-card p-4 rounded-xl flex gap-4 items-center">
                                <div className="h-6 w-6 rounded-full border-2 border-slate-600 flex-shrink-0" />
                                <p className="text-slate-300">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
