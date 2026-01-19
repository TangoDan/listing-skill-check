export interface DimensionScore {
    score: number; // 0-3
    evidence: string;
}

export interface SkillGapAnalysis {
    primary_weakness: string;
    observed_pattern: string;
    commercial_impact: string;
}

export interface TrainingRecommendation {
    priority_focus: string;
    what_to_train: string[];
    what_to_observe: string;
}

export interface BrokerDecisionGuide {
    suitable_for_training: boolean;
    suitable_for_high_value: boolean;
    recommended_reevaluation: string;
}

export interface AnalysisResult {
    overall_score: number; // 0-21
    classification: "High Risk" | "Trainable Potential" | "Reliable Agent";
    dimensions: {
        agenda_control: DimensionScore;
        commercial_authority: DimensionScore;
        seller_diagnosis: DimensionScore;
        objection_handling: DimensionScore;
        value_proposition: DimensionScore;
        process_closure: DimensionScore;
        discourse_consistency: DimensionScore;
    };
    skill_gap: SkillGapAnalysis;
    training_recommendation: TrainingRecommendation;
    broker_decision: BrokerDecisionGuide;
    transcript?: string;
    labeled_transcript?: string;
}
