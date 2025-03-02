import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnkietyComponent } from './ankiety.component';

describe('AnkietyComponent', () => {
  let component: AnkietyComponent;
  let fixture: ComponentFixture<AnkietyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnkietyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnkietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
