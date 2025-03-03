import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { AuthService } from '../../login/auth.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IMenu } from '../../types/Menu';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Tworzenie szpiegowskiego obiektu dla AuthService
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authServiceSpy.user.and.returnValue('admin');

    await TestBed.configureTestingModule({
      imports: [CommonModule, ButtonModule, RouterTestingModule],
      declarations: [MenuComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the MenuComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct number of menu items', () => {
    const menuItems = fixture.nativeElement.querySelectorAll('li');
    expect(menuItems.length).toBe(component.menuItems.length);
  });

  it('should display the user name from localStorage', () => {
    localStorage.setItem('user_name', 'admin');
    fixture.detectChanges();

    const userNameDisplay = fixture.nativeElement.querySelector('.user-name');
    expect(userNameDisplay.textContent).toContain('admin');
  });

  it('should call authService.logout() when logout is called', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should correctly display the user icon', () => {
    const userIcon = fixture.nativeElement.querySelector('.user-icon'); // Zmienna w szablonie
    expect(userIcon).toBeTruthy();
  });

  it('should display menu items with correct text and routes', () => {
    const menuItems = fixture.nativeElement.querySelectorAll('li');
    console.log(menuItems);
    const itemNames = Array.from(menuItems).map((item: any) =>
      item?.textContent.trim()
    );

    // Sprawdzamy, czy menuItems są prawidłowo wyświetlane
    expect(itemNames).toContain('Zestawienia');
    expect(itemNames).toContain('Ankiety');
    expect(itemNames).toContain('Ustawienia');
  });

  it('should have correct routes for menu items', () => {
    const menuItems = fixture.nativeElement.querySelectorAll('a');
    const routes = Array.from(menuItems).map((item: any) =>
      item.getAttribute('href')
    );

    expect(routes).toContain('/zestawienia');
    expect(routes).toContain('/ankiety');
    expect(routes).toContain('/ustawienia');
  });
});
