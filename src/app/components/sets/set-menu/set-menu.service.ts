// import { Injectable } from '@angular/core';
// import { AuthService } from '../../../login/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class SetMenuService {
//   authorizationToken = () => this.authService.getAuthorizationToken();
//   userId = () => this.authService.getUserId();

//   constructor(private authService: AuthService) {}

//     // create and update menu items
//     updateMenuItems() {
//       const suppleirsList: { label: string; icon: string }[] =
//         this.suppliersFromSet.map((supplier) => {
//           return {
//             label: `${supplier.firma}<br/><strong>${supplier.email}</strong>`,
//             icon: 'pi pi-truck',
//           };
//         });
  
//       this.menuItems = [
//         {
//           label: 'Edytuj nagłówek',
//           icon: 'pi pi-file-edit',
//           command: () => this.setMenuComponent.editHeader(),
//         },
//         {
//           label: 'Wyślij email',
//           icon: 'pi pi-envelope',
//           subtitle: '7 nieprzeczytanych',
//           items: [
//             {
//               label: `Do klienta - <strong>${this.set.clientId.email}</strong>`,
//               icon: 'pi pi-user',
//               command: () => this.setMenuComponent.sendSetToClientViaEmail(),
//             },
//             {
//               label: 'Do dostawców',
//               icon: 'pi pi-users',
//               badge: String(suppleirsList.length),
//               items: suppleirsList,
//             },
//           ],
//         },
//         {
//           label: 'Stwórz PDF',
//           icon: 'pi pi-file-pdf',
//           disabled: this.setIsEdited,
//           command: () => this.setMenuComponent.generatePDF(),
//         },
//         {
//           label: 'Załączniki',
//           icon: 'pi pi-paperclip',
//           command: () => this.setMenuComponent.showAttachedFiles(),
//         },
//         {
//           label: 'Prześlij pliki',
//           icon: 'pi pi-upload',
//           command: () => this.setMenuComponent.openSendFilesDialog(),
//         },
//       ];
//     }
  
  
// }
