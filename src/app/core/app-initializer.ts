import { Observable } from 'rxjs';
import { AuthService } from '../login/auth.service';

export function initializeApp(authService: AuthService): () => Observable<any> {
  return () => {
    console.log('[App Initializer] Loading user from server...');
    return authService.loadUserFromServer();
  };
}
