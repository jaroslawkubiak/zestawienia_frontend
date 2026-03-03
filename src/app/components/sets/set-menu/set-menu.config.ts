import { MenuItem } from 'primeng/api';
import { ISetMenuParams } from './types/ISetMenuParams';

export function buildSetMenu(
  params: ISetMenuParams,
  showAllComments: boolean,
): MenuItem[] {
  const {
    set,
    suppliersFromSet,
    emailsList,
    isEdited,
    isGeneratingPdf,
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
    toggleShowAllComments,
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

  const CommentsMenuItem =
    getCommentsBadgeValue() === 0
      ? {
          label: 'Komentarze',
          icon: 'pi pi-comments',
          command: toggleShowAllComments,
        }
      : {
          label: 'Komentarze',
          icon: 'pi pi-comments',
          badgeStyleClass: getCommentsBadgeSeverity(),
          badge: getCommentsBadgeValue().toString(),
          command: toggleShowAllComments,
        };

  const commentsOrPositionsMenuItem = showAllComments
    ? {
        label: 'Pokaż pozycje',
        icon: 'pi pi-table',
        command: toggleShowAllComments,
      }
    : {
        ...CommentsMenuItem,
      };

  const attachmentsMenuItem =
    set?.files?.length === 0
      ? {
          label: 'Załączniki',
          icon: 'pi pi-cloud',
          command: showAttachedFiles,
        }
      : {
          label: 'Załączniki',
          icon: 'pi pi-cloud',
          badge: String(set?.files?.length || 0),
          badgeStyleClass: set?.files?.length
            ? 'p-badge-contrast'
            : 'p-badge-secondary',
          command: showAttachedFiles,
        };

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
      disabled: isEdited || isGeneratingPdf,
      command: generatePDF,
    },
    {
      ...attachmentsMenuItem,
    },
    {
      label: 'Prześlij pliki',
      icon: 'pi pi-cloud-upload',
      command: openSendFilesDialog,
    },
    { ...commentsOrPositionsMenuItem },
  ];
}
