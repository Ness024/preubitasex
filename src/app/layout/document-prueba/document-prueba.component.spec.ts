import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPruebaComponent } from './document-prueba.component';

describe('DocumentPruebaComponent', () => {
  let component: DocumentPruebaComponent;
  let fixture: ComponentFixture<DocumentPruebaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPruebaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentPruebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
