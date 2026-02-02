import { MenuItem } from 'primeng/api';
import { ISendedEmailsFromDB } from '../../emails/types/ISendedEmailsFromDB';
import { ISupplier } from '../../suppliers/ISupplier';
import { ISet } from '../types/ISet';

export interface SetMenuParams {
  set: ISet;
  suppliersFromSet: ISupplier[];
  emailsList: ISendedEmailsFromDB[];
  isEdited: boolean;
  clientHash: string;
  sendSetToClient: () => void;
  sendSetToSupplier: (supplier: ISupplier) => void;
  openLink: (type: 'client' | 'supplier', hash: string) => void;
  copyLink: (type: 'client' | 'supplier', hash: string) => void;
  editHeader: () => void;
  generatePDF: () => void;
  showAttachedFiles: () => void;
  openSendFilesDialog: () => void;
  getCommentsBadgeSeverity: () => string;
  getCommentsBadgeValue: () => number;
  showComments: () => void;
}

export function buildSetMenu(params: SetMenuParams): MenuItem[] {
  const {
    set,
    suppliersFromSet,
    emailsList,
    isEdited,
    clientHash,
    sendSetToClient,
    sendSetToSupplier,
    openLink,
    copyLink,
    editHeader,
    generatePDF,
    showAttachedFiles,
    openSendFilesDialog,
    getCommentsBadgeSeverity,
    getCommentsBadgeValue,
    showComments,
  } = params;

  const suppliersList: MenuItem[] = suppliersFromSet.map((supplier) => ({
    label: supplier.company,
    icon: 'pi pi-truck',
    email: supplier.email,
    preview: () => openLink('supplier', supplier.hash),
    copy: () => copyLink('supplier', supplier.hash),
    previewTooltip: `Podgląd zestawienia dla ${supplier.company}`,
    previewCopyTooltip: `Kopiuj link dla ${supplier.company}`,
    sendAt: (() => {
      const email = emailsList.find((e) => e.supplier?.id === supplier.id);
      return email ? `${email.sendAt} - ${email.sendBy.name}` : 'Nie wysłano';
    })(),
    command: () => sendSetToSupplier(supplier),
  }));

  const lastEmailToClient = (() => {
    const email = emailsList.find((e) => e.client?.id === set.clientId.id);
    return email ? `${email.sendAt} - ${email.sendBy.name}` : 'Nie wysłano';
  })();

  return [
    {
      label: 'Edytuj nagłowek zestawienia',
      icon: 'pi pi-file-edit',
      command: editHeader,
    },
    {
      label: 'Wyślij e-mail',
      icon: 'pi pi-envelope',
      disabled: isEdited,
      items: [
        {
          label: `Do klienta`,
          icon: 'pi pi-user',
          email: set.clientId.email,
          preview: () => openLink('client', clientHash),
          copy: () => copyLink('client', clientHash),
          previewTooltip: 'Podgląd zestawienia dla klienta',
          previewCopyTooltip: 'Kopiuj link dla klienta',
          sendAt: lastEmailToClient,
          command: sendSetToClient,
        },
        {
          label: 'Do dostawców',
          icon: 'pi pi-truck',
          badge: String(suppliersList.length),
          badgeStyleClass:
            suppliersList.length === 0
              ? 'p-badge-secondary'
              : 'p-badge-primary',
          items: suppliersList,
        },
      ],
    },
    {
      label: 'Stwórz PDF',
      icon: 'pi pi-file-pdf',
      disabled: isEdited,
      command: generatePDF,
    },
    {
      label: 'Załączniki',
      icon: 'pi pi-cloud',
      badge: String(set?.files?.length || 0),
      badgeStyleClass: set?.files?.length
        ? 'p-badge-contrast'
        : 'p-badge-secondary',
      command: showAttachedFiles,
    },
    {
      label: 'Prześlij pliki',
      icon: 'pi pi-paperclip',
      command: openSendFilesDialog,
    },
    {
      label: 'Komentarze',
      icon: 'pi pi-comments',
      badgeStyleClass: getCommentsBadgeSeverity(),
      badge: getCommentsBadgeValue().toString(),
      command: showComments,
    },
  ];
}
