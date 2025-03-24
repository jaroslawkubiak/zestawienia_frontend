export interface IConfirmationMessage {
  message: string;
  header: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept: () => any;
  reject?: () => any;
}
