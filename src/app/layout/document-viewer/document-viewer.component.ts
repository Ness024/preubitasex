import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DocumentDetailsComponent } from '../document-details/document-details.component';
import { DocumentStatusTimelineComponent } from '../document-status-timeline/document-status-timeline.component';


@Component({
  selector: 'app-document-viewer',
  imports: [
    MatTabsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DocumentDetailsComponent,
    DocumentStatusTimelineComponent
],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent {

}

