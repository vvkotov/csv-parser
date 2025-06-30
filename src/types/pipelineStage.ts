export type PipelineStage =
  | "target"
  | "prospect"
  | "engaged"
  | "evaluating"
  | "allocated"
  | "dormant"
  | "lost";

export const PIPELINE_STAGES: PipelineStage[] = [
  "target",
  "prospect",
  "engaged",
  "evaluating",
  "allocated",
  "dormant",
  "lost",
];
