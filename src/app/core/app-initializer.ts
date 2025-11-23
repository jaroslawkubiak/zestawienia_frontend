import { Observable, of } from 'rxjs';
import { AuthService } from '../login/auth.service';

export function initializeApp(authService: AuthService): () => Observable<any> {
  return () => {
    return authService.loadUserFromServer(true);
  };
}
