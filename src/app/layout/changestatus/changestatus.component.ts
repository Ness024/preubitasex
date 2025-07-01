import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationService } from '../../service/notification.service';
import { DataService } from '../../service/data.service';

import { AddDocumentComponent } from '../add-document/add-document.component';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { ErrorComponent } from "../message/error/error.component";
import { EventsService } from '../../service/events.service';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';

interface StatusForm {
  status_id: string;
  comment?: string;
  form: {
    [key: string]: any;
    received_by?: string;
    received_date?: string;
    responsible?: string;
    department?: string;
    description?: string;
    sent_to?: string;
    position?: string;
    deadline_date?: string;
    concluded_by?: string;
    signing_date?: string;
    conclusion_notes?: string;
    archived_by?: string;
    archived_date?: string;
    delivered_by?: string;
    delivery_to?: string;
    delivery_date?: string;
    cancellation_reason?: string;
    cancellation_date?: string;
  };
  related_document_id?: string;
}

@Component({
  selector: 'app-changestatus',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatTooltipModule,
    FormInputErrorComponent
  ],
  templateUrl: './changestatus.component.html',
  styleUrl: './changestatus.component.css',
})

export class ChangestatusComponent implements OnChanges {

  @Output() closed = new EventEmitter<void>();
  @Input() documentId!: string;
  @Input() sendStatusId!: number;


  currentStatusId = '';
  departments: any[] = [];
  statusForm!: FormGroup;
  formSubmitted = false;
  errorMessages = FORM_ERROR_MESSAGES;

  contenidoModal = '';
  followUpOptionForm = new FormGroup({
    followUpOption: new FormControl('No')
  });

  estados = [
    { id: 'received', name: 'Recepcionado' },
    { id: 'in_process', name: 'En Trámite' },
    { id: 'in_signing', name: 'En Firma' },
    { id: 'in_signed', name: 'Firmado' },
    { id: 'completed', name: 'Concluido' },
    { id: 'delivered', name: 'Entregado' },
    { id: 'archived', name: 'Archivado' },
    { id: 'cancelled', name: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private eventsService: EventsService
  ) {
    this.initForms();
    this.loadDepartments();
  }

  private initForms() {
    this.statusForm = this.fb.group({
      status_id: ['', Validators.required],
      comment: [''],
      form: this.fb.group({}),
      related_document_id: [''],
    });
  }

  loadDepartments() {
    this.dataService.getmetadata().subscribe({
      next: (response) => {
        this.departments = response.receivers_department || [];
      },
      error: (error) => {
        this.notificationService.showError('Error', 'No se pudieron cargar los departamentos');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sendStatusId'] && this.sendStatusId !== undefined && this.sendStatusId !== null) {
      this.currentStatusId = this.sendStatusId.toString();
      if (this.statusForm) {
        this.statusForm.patchValue({ status_id: this.currentStatusId });
      }
    }
  }

  selectstatus(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contenidoModal = input.value;
    this.currentStatusId = input.value;

    this.resetFormState();
    this.updateFormControls();
  }

  updateFormControls() {
    const formGroup = this.statusForm.get('form') as FormGroup;

    Object.keys(formGroup.controls).forEach(control => {
      formGroup.removeControl(control);
    });

    // Agregamos controles según el estado seleccionado
    switch (this.currentStatusId) {
      case 'received':
        formGroup.addControl('received_by', new FormControl('', Validators.required));
        formGroup.addControl('received_date', new FormControl('', Validators.required));
        break;

      case 'in_process':
        formGroup.addControl('responsible', new FormControl('', Validators.required));
        formGroup.addControl('department', new FormControl('', Validators.required));
        formGroup.addControl('description', new FormControl(''));
        break;

      case 'in_signing':
        formGroup.addControl('sent_to', new FormControl('', Validators.required));
        formGroup.addControl('position', new FormControl('', Validators.required));
        formGroup.addControl('deadline_date', new FormControl('', Validators.required));
        break;

      case 'in_signed':
        formGroup.addControl('concluded_by', new FormControl('', Validators.required));
        formGroup.addControl('signing_date', new FormControl('', Validators.required));
        formGroup.addControl('conclusion_notes', new FormControl(''));
        break;

      case 'completed':
        formGroup.addControl('concluded_by', new FormControl('', Validators.required));
        formGroup.addControl('conclusion_date', new FormControl('', Validators.required));
        formGroup.addControl('conclusion_notes', new FormControl(''));
        break;

      case 'delivered':
        formGroup.addControl('delivered_by', new FormControl('', Validators.required));
        formGroup.addControl('delivery_to', new FormControl('', Validators.required));
        formGroup.addControl('delivery_date', new FormControl('', Validators.required));
        formGroup.addControl('delivery_notes', new FormControl(''));
        break;

      case 'archived':
        formGroup.addControl('archived_date', new FormControl('', Validators.required));
        formGroup.addControl('archived_by', new FormControl('', Validators.required));
        formGroup.addControl('archived_file_location', new FormControl(''));
        break;

      case 'cancelled':
        formGroup.addControl('cancellation_reason', new FormControl('', Validators.required));
        formGroup.addControl('cancellation_date', new FormControl('', Validators.required));
        formGroup.addControl('cancellation_notes', new FormControl(''));
        break;
    }

    this.statusForm.patchValue({
      status_id: this.currentStatusId,
      form: {}
    });
  }

  getFormControl(controlName: string): AbstractControl | null {
    return (this.statusForm.get(`form`) as FormGroup).get(controlName);
  }

  getErrorMessages(fieldName: string): any {
    const msg = this.errorMessages[fieldName as keyof typeof this.errorMessages];
    if (typeof msg === 'string') {
      return { required: msg };
    }
    return msg || {};
  }

  resetFormState(): void {
    this.formSubmitted = false;

    const formGroup = this.statusForm.get('form') as FormGroup;
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.controls[key].setErrors(null);
      formGroup.controls[key].markAsUntouched();
      formGroup.controls[key].markAsPristine();
    });

    this.statusForm.get('comment')?.reset();
    this.statusForm.get('comment')?.setErrors(null);
    this.statusForm.get('comment')?.markAsUntouched();
  }

  handleSave() {
    this.formSubmitted = true;

    Object.keys(this.statusForm.controls).forEach(key => {
      this.statusForm.get(key)?.markAsTouched();
    });

    if (this.statusForm.invalid) {
      this.notificationService.showError('Complete todos los campos requeridos', 'Error');
      return;
    }
    const statusData: StatusForm = {
      status_id: this.statusForm.value.status_id!,
      comment: this.statusForm.value.comment || undefined,
      form: this.statusForm.value.form || {},
      related_document_id: this.statusForm.value.related_document_id || null,
    };
    console.log('StatusData a enviar:', statusData);
    this.dataService.updateDocumentStatus(this.documentId, statusData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(response.message || 'Estado actualizado correctamente', 'Éxito');
        this.eventsService.notifyStatusChanged();
        this.closed.emit();
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || 'Error al actualizar el estado', 'Error');
      }
    });
  }

  continueToDocument() {
    this.formSubmitted = true;
    Object.keys(this.statusForm.controls).forEach(key => {
      this.statusForm.get(key)?.markAsTouched();
    });

    if (this.statusForm.invalid) {
      this.notificationService.showError('Complete todos los campos requeridos', 'Error');
      return;
    }
    const dialogRef = this.dialog.open(AddDocumentComponent, {

      width: 'fit-content',
      maxWidth: '40vw',
      maxHeight: '90vh',
      panelClass: 'status-dialog',

      autoFocus: false,
      disableClose: true,

      data: {
        parentId: this.documentId,
        mode: 'related',
      },
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result?.result === 'success' && result?.newDocumentId) {
        this.statusForm.patchValue({ related_document_id: result.newDocumentId });
        this.handleSave();
        this.notificationService.showSuccess('Documento relacionado creado', 'Exito');
        this.closed.emit();
      } else {
        this.notificationService.showSuccess('Documento Cancelado', 'Exito');
      }
    });
  }

  // Helper methods for status colors, tooltips and error messages
  getStatusColor(statusId: string): string {
    const colors: { [key: string]: string } = {
      'received': '#a0a0a0',
      'in_process': 'var(--color-theme-orange)',
      'in_signing': 'purple',
      'in_signed': 'var(--color-theme-green)',
      'completed': 'var(--color-theme-light-blue)',
      'delivered': 'var(--color-theme-blue)',
      'archived': 'var(--color-theme-dark-blue)',
      'cancelled': 'var(--color-theme-red)'
    };
    return colors[statusId] || '#a0a0a0';
  }

  getTooltipText(statusId: string): string {
    const tooltips: { [key: string]: string } = {
      'received': 'Documento recibido o registrado en el sistema',
      'in_process': 'Documento en proceso en revision o gestión',
      'in_signing': 'Documento enviado para firma',
      'in_signed': 'Documento firmado y/o aprobado',
      'completed': 'Documento concluido y cerrado',
      'delivered': 'Documento concluido y entregado',
      'archived': 'Documento concluido y archivado',
      'cancelled': 'Documento cancelado'
    };
    return tooltips[statusId] || ' ';
  }
  getStatusColorClass(statusId: string): string {
    return 'tooltip-' + statusId;
  }
}
