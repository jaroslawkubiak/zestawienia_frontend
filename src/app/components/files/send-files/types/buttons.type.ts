import { TButtonSeverity } from "../../../settings/types/TButtonSeverity";

export type TFileUploadButton = {
  severity: TButtonSeverity;
  label: string;
  size: 'large' | 'small';
  disabled: boolean;
};
