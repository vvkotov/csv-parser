export interface InvestorData {
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  pipeline_stage: PipelineStage;
  phone: string | null;
}

export type PipelineStage =
  | "target"
  | "prospect"
  | "engaged"
  | "evaluating"
  | "allocated"
  | "dormant"
  | "lost";
