import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZestawieniaComponent } from './zestawienia.component';

describe('ZestawieniaComponent', () => {
  let component: ZestawieniaComponent;
  let fixture: ComponentFixture<ZestawieniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZestawieniaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZestawieniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
