export interface IConfirmationMessage {
  message: string;
  header: string;
  acceptLabel?: string;
  acceptIcon?: string;
  rejectLabel?: string;
  rejectVisible?: boolean;
  accept: () => any;
  reject?: () => any;
}
