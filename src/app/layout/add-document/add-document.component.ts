import { Component, Optional, Inject, Input } from '@angular/core';
import { documentFormData, DocumentFormModel } from '../../models/trackingDocs';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NotificationService } from '../../service/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { CommonModule } from '@angular/common';

interface ArchivoSubido {
  id: number;
  nombre: string;
  tipo: string;
  tamaño: number;
  file: File;
}

@Component({
  selector: 'app-add-document',
  imports: [ReactiveFormsModule, FormInputErrorComponent, CommonModule],
  templateUrl: './add-document.component.html',
  styleUrl: './add-document.component.css'
})
export class AddDocumentComponent {

  @Input() parentId: number | null = null;
  @Input() mode: 'main' | 'related' = 'main';

  datosDocumento = new FormGroup({
    title: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
    reference_number: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
    category_id: new FormControl<string>('', [Validators.required]),
    status_id: new FormControl<string>('', [Validators.required]),
    sender_department_id: new FormControl<number | string>('', [Validators.required]),
    new_sender_department: new FormControl<string | null>('', [Validators.required]),
    receiver_department_id: new FormControl<string>('', [Validators.required]),
    issue_date: new FormControl<string>('', [Validators.required]),
    received_date: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>(''),
    files: new FormControl<File[] | null>([])
  }, { validators: this.senderDepartmentValidator });

  formData: DocumentFormModel = documentFormData;
  selectedFile: File | null = null;
  fileName: string = '';
  typeText: boolean = false;
  archivosSubidos: ArchivoSubido[] = []; 
  FileArray: File[] = [];
  currentUser: any = null;
  isAdmin: boolean = false;
  isReceiverDepartmentDisabled: boolean = false;
  errorMessages = FORM_ERROR_MESSAGES;
  formSubmitted = false;
  
  // Propiedades para el buscador de departamentos
  showDepartmentSearch = false;
  departmentSearchTerm = '';
  filteredDepartments: any[] = [];
  
  constructor(
    private dataService: DataService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    @Optional() public dialogRef?: MatDialogRef<AddDocumentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  ngOnInit(): void {
    this.data = this.data || {};
    
    // Obtener información del usuario actual
    this.authService.getUserData().subscribe({
      next: (userData) => {
        this.currentUser = userData;
        this.isAdmin = this.authService.isAdminUser();
        this.isReceiverDepartmentDisabled = !this.isAdmin;
        
        // Habilitar o deshabilitar el control del departamento receptor
        if (this.isReceiverDepartmentDisabled) {
          this.datosDocumento.get('receiver_department_id')?.disable();
        } else {
          this.datosDocumento.get('receiver_department_id')?.enable();
        }

        // Configurar departamento receptor por defecto después de obtener datos del usuario
        this.setDefaultReceiverDepartment();
      },
      error: (error) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    });

    this.dataService.createDocument().subscribe({
      next: (response) => {

        this.formData.categories = response.categories || [];
        this.formData.statuses = response.statuses || [];
        this.formData.senders_department = response.senders_department || [];
        this.formData.receivers_department = response.receivers_department || [];
        this.datosDocumento.patchValue({ sender_department_id: '' });

        // Seleccionar automáticamente la categoría "oficio" si existe
        const oficioCategory = this.formData.categories.find(cat => 
          cat.name.toLowerCase().includes('oficio')
        );
        if (oficioCategory) {
          this.datosDocumento.patchValue({ category_id: oficioCategory.id.toString() });
        }

        // Configurar departamento receptor por defecto si ya tenemos los datos del usuario
        if (this.currentUser) {
          this.setDefaultReceiverDepartment();
        }

      },
      error: (error) => {
        this.router.navigate(['/main']);
        this.notificationService.showError('Error', error.error?.message || 'Error al cargar los datos');
      }
    });
  }

  onFileArraySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const extension = file.name.split('.').pop()?.toLowerCase();
      const extensionesPermitidas = ['pdf', 'xlsx', 'docx'];
      if (!extension || !extensionesPermitidas.includes(extension)) {
        this.notificationService.showError(
          'Formato incorrecto',
          'Solo se permiten archivos PDF, XLSX o DOCX'
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError(
          'Archivo demasiado grande',
          'El tamaño máximo permitido es 5MB'
        );
        return;
      }

      const nuevoArchivo: ArchivoSubido = {
        id: Date.now(),
        nombre: file.name,
        tipo: extension,
        tamaño: file.size,
        file: file
      };

      this.archivosSubidos.push(nuevoArchivo);
      this.FileArray.push(nuevoArchivo.file);

      //  Actualiza el valor del FormControl en el formulario reactivo
      this.datosDocumento.patchValue({
        files: this.FileArray
      });
    }
  }
  eliminarArchivo(id: number) {
    this.archivosSubidos = this.archivosSubidos.filter(archivo => archivo.id !== id);
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.datosDocumento.valid) {
      const formData = new FormData();
      const senderDept = this.datosDocumento.get('sender_department_id')?.value;
      const newSenderDept = this.datosDocumento.get('new_sender_department')?.value;

      // 1. Agregar campos del formulario (excepto 'files' y los condicionales)
      Object.keys(this.datosDocumento.controls).forEach(key => {
        const control = this.datosDocumento.get(key);
        if (!control || control.value === null || control.value === undefined) return;

        // Excluir sender_department_id si se está usando un nuevo departamento
        if (key === 'sender_department_id' && newSenderDept) return;

        // Excluir new_sender_department si NO se está usando un nuevo departamento
        if (key === 'new_sender_department' && !newSenderDept) return;

        formData.append(key, control.value);

      });

      if (this.data.parentId && this.data.mode==='related') {
          formData.append('parent_id', this.data.parentId.toString());
      }

      // 2. Agregar archivos como 'files[]'
      const archivos = this.datosDocumento.get('files')?.value;
      if (archivos && Array.isArray(archivos)) {
        archivos.forEach((file: File) => {
          formData.append('files[]', file);
        });
      }

      // 2. Enviar al backend
      this.dataService.storeDocument(formData).subscribe({
        next: (response) => {
          if (this.data.mode === 'related') {
            if (this.dialogRef) {
            this.dialogRef.close({
              result:'success',
              newDocumentId: response.document.id,
            });
            }
          } else {
            this.router.navigate(['/main']);
            this.notificationService.showSuccess('Documento creado exitosamente', 'Éxito');
          }
          this.formSubmitted = false;
        },
        error: (error) => {
          this.notificationService.showError(error.error?.message || 'Fallo la conexión con el servidor', 'Error');
        }
      });
    } else {
      this.notificationService.showError('Complete todos los campos requeridos', 'Error');
    }
  }

  SelecttoText(event: Event) {
    const select = this.datosDocumento.get('sender_department_id');
    const selectedValue = select?.value;
    
    if (selectedValue === 'NewDep') {
      // Activar modo texto para nuevo departamento
      this.typeText = true;
      // Limpiar el campo de texto y sus errores
      this.datosDocumento.get('new_sender_department')?.reset();
      this.datosDocumento.get('new_sender_department')?.setErrors(null);
      this.datosDocumento.get('new_sender_department')?.markAsUntouched();
      // Limpiar el select y sus errores
      this.datosDocumento.patchValue({ sender_department_id: '' });
      this.datosDocumento.get('sender_department_id')?.setErrors(null);
      this.datosDocumento.get('sender_department_id')?.markAsUntouched();
      // Marcar el campo de texto como requerido
      this.datosDocumento.get('new_sender_department')?.setValidators([Validators.required]);
      this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
      // Quitar validación del select
      this.datosDocumento.get('sender_department_id')?.clearValidators();
      this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
    } else if (selectedValue && selectedValue !== '') {
      // Se seleccionó un departamento existente, desactivar modo texto
      this.typeText = false;
      // Limpiar el campo de texto y sus errores
      this.datosDocumento.patchValue({ new_sender_department: '' });
      this.datosDocumento.get('new_sender_department')?.setErrors(null);
      this.datosDocumento.get('new_sender_department')?.markAsUntouched();
      // Quitar validación del campo de texto
      this.datosDocumento.get('new_sender_department')?.clearValidators();
      this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
      // Marcar el select como requerido
      this.datosDocumento.get('sender_department_id')?.setValidators([Validators.required]);
      this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
    }
  }

  negTypeText() {
    this.typeText = false;
    // Limpiar el campo de texto y sus errores
    this.datosDocumento.patchValue({ new_sender_department: '' });
    this.datosDocumento.get('new_sender_department')?.setErrors(null);
    this.datosDocumento.get('new_sender_department')?.markAsUntouched();
    // Limpiar el select y sus errores
    this.datosDocumento.patchValue({ sender_department_id: '' });
    this.datosDocumento.get('sender_department_id')?.setErrors(null);
    this.datosDocumento.get('sender_department_id')?.markAsUntouched();
    // Quitar validación del campo de texto
    this.datosDocumento.get('new_sender_department')?.clearValidators();
    this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
    // Marcar el select como requerido
    this.datosDocumento.get('sender_department_id')?.setValidators([Validators.required]);
    this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
    // Cerrar el buscador
    this.showDepartmentSearch = false;
    this.departmentSearchTerm = '';
  }

  // Métodos para el buscador de departamentos
  onDepartmentSearchFocus() {
    this.showDepartmentSearch = true;
    this.filteredDepartments = [...this.formData.senders_department];
  }

  onDepartmentSearchBlur() {
    // Pequeño delay para permitir que el clic en las opciones se registre
    setTimeout(() => {
      this.showDepartmentSearch = false;
    }, 200);
  }

  onDepartmentSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.departmentSearchTerm = searchTerm;
    
    if (!searchTerm) {
      this.filteredDepartments = [...this.formData.senders_department];
    } else {
      this.filteredDepartments = this.formData.senders_department.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  onDepartmentSelect(department: any) {
    this.datosDocumento.patchValue({ sender_department_id: department.id.toString() });
    this.departmentSearchTerm = department.name;
    this.showDepartmentSearch = false;
    this.typeText = false;
    
    // Limpiar el campo de texto y sus errores
    this.datosDocumento.patchValue({ new_sender_department: '' });
    this.datosDocumento.get('new_sender_department')?.setErrors(null);
    this.datosDocumento.get('new_sender_department')?.markAsUntouched();
    // Quitar validación del campo de texto
    this.datosDocumento.get('new_sender_department')?.clearValidators();
    this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
    // Marcar el select como requerido
    this.datosDocumento.get('sender_department_id')?.setValidators([Validators.required]);
    this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
  }

  onAddNewDepartment() {
    this.typeText = true;
    this.showDepartmentSearch = false;
    this.departmentSearchTerm = '';
    // Limpiar el campo de texto y sus errores
    this.datosDocumento.get('new_sender_department')?.reset();
    this.datosDocumento.get('new_sender_department')?.setErrors(null);
    this.datosDocumento.get('new_sender_department')?.markAsUntouched();
    // Limpiar el select y sus errores
    this.datosDocumento.patchValue({ sender_department_id: '' });
    this.datosDocumento.get('sender_department_id')?.setErrors(null);
    this.datosDocumento.get('sender_department_id')?.markAsUntouched();
    // Marcar el campo de texto como requerido
    this.datosDocumento.get('new_sender_department')?.setValidators([Validators.required]);
    this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
    // Quitar validación del select
    this.datosDocumento.get('sender_department_id')?.clearValidators();
    this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
  }

  getSelectedDepartmentName(): string {
    const selectedId = this.datosDocumento.get('sender_department_id')?.value;
    if (!selectedId) return '';
    
    const department = this.formData.senders_department.find(dept => dept.id.toString() === selectedId);
    return department ? department.name : '';
  }

  senderDepartmentValidator(group: AbstractControl): ValidationErrors | null {
    const sender = group.get('sender_department_id')?.value;
    const newSender = group.get('new_sender_department')?.value;
    
    // Si no hay ningún valor, retornar error
    if (!sender && !newSender) {
      return { senderMissing: true };
    }
    
    // Si hay valores en ambos campos, limpiar errores
    if (sender && newSender) {
      group.get('sender_department_id')?.setErrors(null);
      group.get('new_sender_department')?.setErrors(null);
    }
    
    return null;
  }

  // Método para obtener mensajes de error específicos según el campo activo
  getSenderDepartmentErrorMessages(): any {
    if (this.typeText) {
      // Si está en modo texto, mostrar errores del campo de texto
      return this.getErrorMessages('new_sender_department');
    } else {
      // Si está en modo select, mostrar errores del select
      return this.getErrorMessages('sender_department_id');
    }
  }

  // Método para verificar si debe mostrar error en el campo activo
  shouldShowSenderDepartmentError(): boolean {
    if (this.typeText) {
      const control = this.datosDocumento.get('new_sender_department');
      return control ? (control.invalid && (control.touched || this.formSubmitted)) : false;
    } else {
      const control = this.datosDocumento.get('sender_department_id');
      return control ? (control.invalid && (control.touched || this.formSubmitted)) : false;
    }
  }

  setDefaultReceiverDepartment() {
    // Si el usuario no es administrador y tiene un departamento, seleccionarlo por defecto
    if (!this.isAdmin && this.currentUser?.department?.id) {
      const userDepartment = this.formData.receivers_department.find(dept => 
        dept.id === this.currentUser.department.id
      );
      
      if (userDepartment) {
        // Habilitar temporalmente el control para establecer el valor
        const receiverControl = this.datosDocumento.get('receiver_department_id');
        const wasDisabled = receiverControl?.disabled;
        
        if (wasDisabled) {
          receiverControl?.enable();
        }
        
        receiverControl?.setValue(userDepartment.id.toString());
        
        // Deshabilitar nuevamente si estaba deshabilitado
        if (wasDisabled) {
          receiverControl?.disable();
        }
      }
    }
  }

  onCancel() {
    if (this.dialogRef) {
      this.dialogRef.close('cancelled');
    }
  }

  getErrorMessages(fieldName: string): any {
    const msg = this.errorMessages[fieldName as keyof typeof this.errorMessages];
    if (typeof msg === 'string') {
      return { required: msg };
    }
    return msg || {};
  }
}
