import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduktyComponent } from './produkty.component';

describe('ProduktyComponent', () => {
  let component: ProduktyComponent;
  let fixture: ComponentFixture<ProduktyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduktyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduktyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
