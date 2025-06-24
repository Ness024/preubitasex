import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabGroup } from '@angular/material/tabs';

import { DocumentDetailsComponent } from '../document-details/document-details.component';
import { DocumentStatusTimelineComponent } from '../document-status-timeline/document-status-timeline.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-document-viewer',
  imports: [
    MatTabsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DocumentDetailsComponent,
    DocumentStatusTimelineComponent,
],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  // El id del documento que se está mostrando
  currentDocumentId: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Si currentDocumentId aún no está definido (por ejemplo, no vienes de un tab)
    if (!this.currentDocumentId) {
      this.currentDocumentId = this.route.snapshot.paramMap.get('id') || '';
    }
  }

  // Método para cambiar el documento y el tab activo
  showDocumentDetails(documentId: string) {
    this.currentDocumentId = documentId;
    // Cambia al primer tab (índice 0)
    this.tabGroup.selectedIndex = 0;
    this.router.navigate(['/main/detalles', documentId]);
  }

}

