export type TFileUploadButton = {
  severity: TButtonSeverity;
  label: string;
  size: 'large' | 'small';
  disabled: boolean;
};

export type TButtonSeverity =
  | 'success'
  | 'primary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'contrast';
