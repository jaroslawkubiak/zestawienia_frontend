import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DostawcyComponent } from './dostawcy.component';

describe('DostawcyComponent', () => {
  let component: DostawcyComponent;
  let fixture: ComponentFixture<DostawcyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DostawcyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DostawcyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
