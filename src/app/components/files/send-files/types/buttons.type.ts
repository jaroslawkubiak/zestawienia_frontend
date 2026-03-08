import { TButtonAllSeverity } from "../../../settings/types/TButtonAllSeverity.type.";

export type TFileUploadButton = {
  severity: TButtonAllSeverity;
  label: string;
  size: 'large' | 'small';
  disabled: boolean;
};
