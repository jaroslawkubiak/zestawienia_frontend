export type TUploadButton = {
  severity: ButtonSeverity;
  label: string;
  size: 'large' | 'small';
};

export type TChooseButton = {
  severity: ButtonSeverity;
  label: string;
  size: 'large' | 'small';
  disabled: boolean;
};

export type ButtonSeverity =
  | 'success'
  | 'primary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'contrast';
