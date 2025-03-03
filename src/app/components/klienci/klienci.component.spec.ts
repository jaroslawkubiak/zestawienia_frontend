import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlienciComponent } from './klienci.component';

describe('KlienciComponent', () => {
  let component: KlienciComponent;
  let fixture: ComponentFixture<KlienciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlienciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlienciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
