import {
  ClientEmailTemplateName,
  SupplierEmailTemplateName,
} from './types/EmailTemplates.type';
import { EmailDetails } from './types/IEmailDetails';

export const HTMLDetails = {
  client: {
    welcomeEmail: {
      audience: 'client',
      name: 'welcomeEmail',
      subject: 'Inwestycja',
      message: () => 'Przesyłamy link do inwestycji',
    },
  },

  supplier: {
    supplierOffer: {
      audience: 'supplier',
      name: 'supplierOffer',
      subject: 'Oferta',
      message: () =>
        'Prosimy o przygotowanie oferty, poniżej załączamy link do zestawienia',
    },

    supplierOrder: {
      audience: 'supplier',
      name: 'supplierOrder',
      subject: 'Zamówienie',
      message: ({ client }) => `
Proszę o realizację zamówienia zgodnie z przesłanym zestawieniem.
Prosimy o wystawienie proformy na poniższe dane:

${client?.firstName} ${client?.lastName}
${client?.company}
`,
    },
  },
} satisfies {
  client: Record<ClientEmailTemplateName, EmailDetails<'client'>>;
  supplier: Record<SupplierEmailTemplateName, EmailDetails<'supplier'>>;
};
