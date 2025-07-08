import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TableRComponent } from "../table-r/table-r.component";
import { ExcelExportService } from '../../service/excel-export.service';
import { MatMenuModule } from '@angular/material/menu';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../service/data.service';

export interface categorys {
  id: number,
  name: string
}

@Component({
  selector: 'app-document-list',
  imports: [MatSelectModule, CommonModule, MatButtonModule, MatMenuModule, MatButtonModule, TableRComponent, ReactiveFormsModule],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})

export class DocumentListComponent {

  filtersform = new FormGroup({
    category_id: new FormControl<string>(''),
    start_date: new FormControl<string>(''),
    end_date: new FormControl<string>('')
  });
  categorys: categorys[] = [];
  isOpen = false;
  buttonText = 'Menu';
  statusId: number = 0;
  constructor(
    private excelExportService: ExcelExportService,
    private elementRef: ElementRef,
    private dataService: DataService
  ) { }

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }


  ngOnInit() {
    this.dataService.getmetadata().subscribe({
      next: (next) => {
        this.categorys = next.categories;
        console.log(next)
      }
    })
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKey(event: KeyboardEvent): void {
    this.isOpen = false;
  }

  onExportClick() {
    this.excelExportService.requestExport();
  }
  setid(number: number) {
    this.statusId = number;
  }

  onSubmit() {
    const formData = this.filtersform.value;
  }

  resetFilters() {
    this.filtersform.reset();
  }
}
