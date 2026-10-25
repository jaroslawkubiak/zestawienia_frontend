import { MenuItem } from 'primeng/api';
import { pluralizePL } from '../../../shared/helpers/pluralizePL';
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
    getCommentsForPositionsBadgeSeverity,
    getCommentsForPositionsBadgeValue,
    getCommentsForFilesBadgeSeverity,
    getCommentsForFilesBadgeValue,
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
    getCommentsForPositionsBadgeValue() === 0
      ? {
          label: 'Komentarze',
          icon: 'pi pi-comments',
          command: toggleShowAllComments,
        }
      : {
          label: 'Komentarze',
          icon: 'pi pi-comments',
          badgeStyleClass: getCommentsForPositionsBadgeSeverity(),
          badge: getCommentsForPositionsBadgeValue().toString(),
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

  const filesCount = set?.files?.length ?? 0;
  const commentsBadgeValue = getCommentsForFilesBadgeValue();
  const verbAttachments = pluralizePL(
    filesCount,
    'Załącznik',
    'Załączniki',
    'Załączników',
  );

  const attachmentsMenuItem = {
    label:
      filesCount > 0 ? `${filesCount} ${verbAttachments}` : 'Brak załączników',
    icon: 'pi pi-cloud',
    disabled: isEdited,
    command: showAttachedFiles,

    ...(commentsBadgeValue !== 0 && {
      badgeStyleClass: getCommentsForFilesBadgeSeverity(),
      badge: commentsBadgeValue.toString(),
      tooltip: 'opis',
    }),
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
