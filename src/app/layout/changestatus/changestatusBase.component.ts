import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { DocumentStatus, StatusFormData, StatusConfig } from '../../models/documents.models';
import { DocumentStatusService } from '../../service/document-status.service';

@Component({
  template: '' // Componente base abstracto
})
export abstract class DocumentStatusBaseComponent {
  @Input() documentId!: string;
  @Output() statusChanged = new EventEmitter<void>();

  currentStatusId?: DocumentStatus;
  formSubmitted = false;
  statusForm: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected statusService: DocumentStatusService
  ) {
    this.statusForm = this.fb.group({
      status_id: ['', Validators.required],
      comment: [''],
      form: this.fb.group({})
    });
  }

  // Métodos reutilizables
  protected initializeFormForStatus(statusId: DocumentStatus): void {
    this.currentStatusId = statusId;
    this.statusForm.patchValue({ status_id: statusId });

    const formGroup = this.statusForm.get('form') as FormGroup;
    const statusConfig = this.statusService.getStatusConfig(statusId);

    // Limpiar controles existentes
    Object.keys(formGroup.controls).forEach(control => {
      formGroup.removeControl(control);
    });

    // Agregar nuevos controles según configuración
    statusConfig?.formFields.forEach(field => {
      const validators = statusConfig.requiredFields.includes(field)
        ? [Validators.required]
        : [];
      formGroup.addControl(field, new FormControl('', validators));
    });
  }

  getFormControl(controlName: string): AbstractControl | null {
    return (this.statusForm.get('form') as FormGroup).get(controlName);
  }

  protected resetFormState(): void {
    this.formSubmitted = false;
    const formGroup = this.statusForm.get('form') as FormGroup;
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.controls[key].setErrors(null);
      formGroup.controls[key].markAsUntouched();
    });
    this.statusForm.get('comment')?.reset();
  }

  protected prepareStatusData(): StatusFormData {
    return {
      status_id: this.statusForm.value.status_id,
      comment: this.statusForm.value.comment || undefined,
      form: this.statusForm.value.form || {}
    };
  }
}
