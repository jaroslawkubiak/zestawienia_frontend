export interface IDeletedFileResponse {
  severity: 'success' | 'warn' | 'error';
  message: string;
  fileName: string;
}
