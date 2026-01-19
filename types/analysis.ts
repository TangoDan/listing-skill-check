export interface PhaseAnalysis {
    score: number;
    summary: string;
    missing_questions?: string[];
}

export interface AnalysisResult {
    overall_score: number;
    phases: {
        qualification: PhaseAnalysis;
        trust_building: PhaseAnalysis;
        closing: PhaseAnalysis;
    };
    recommendations: string[];
    action_plan: string[];
    transcript?: string;
    labeled_transcript?: string;
}
