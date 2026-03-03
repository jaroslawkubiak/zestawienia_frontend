import { TEmailAudience } from '../../../sended-emails/types/EmailAudience.type';
import { ISendedEmails } from '../../../sended-emails/types/ISendedEmails';
import { ISupplier } from '../../../suppliers/types/ISupplier';
import { ISet } from '../../types/ISet';

export interface ISetMenuParams {
  set: ISet;
  suppliersFromSet: ISupplier[];
  emailsList: ISendedEmails[];
  isEdited: boolean;
  isGeneratingPdf: boolean;
  clientHash: string;
  sendSetToClient: () => void;
  sendSetToSupplier: (supplier: ISupplier) => void;
  openLink: (type: TEmailAudience, hash: string) => void;
  copyLink: (type: TEmailAudience, hash: string) => void;
  editHeader: () => void;
  generatePDF: () => void;
  showAttachedFiles: () => void;
  openSendFilesDialog: () => void;
  getCommentsBadgeSeverity: () => string;
  getCommentsBadgeValue: () => number;
  toggleShowAllComments: () => void;
}
