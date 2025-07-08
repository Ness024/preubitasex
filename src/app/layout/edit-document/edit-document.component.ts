import { Component } from '@angular/core';
import { DataService } from '../../service/data.service';
import { ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { documentFormData, DocumentFormModel } from '../../models/trackingDocs';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import { ApiResponse, Document } from '../../models/document';
import { NotificationService } from '../../service/notification.service';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';
import { AuthService } from '../../service/auth.service';


export interface FileData {
  id: number;
  document_id: string;
  original_name: string;
  stored_name: string;
  file_extension: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-edit-document',
  imports: [CommonModule, ReactiveFormsModule, FormInputErrorComponent],
  templateUrl: './edit-document.component.html',
  styleUrl: './edit-document.component.css'
})
export class EditDocumentComponent {
  document!: Document;

  datosDocumento = new FormGroup({
  title: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
  reference_number: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
  category_id: new FormControl<any>('', [Validators.required]),
  status_id: new FormControl<any>('', [Validators.required]),
  sender_department_id: new FormControl<any | string>(0),
  new_sender_department: new FormControl<string | "">(''), // Nuevo campo opcional
  receiver_department_id: new FormControl<any>(null, [Validators.required]),
  issue_date: new FormControl<string>('', [Validators.required]),
  received_date: new FormControl<string>('', [Validators.required]),
  description: new FormControl<string>(''),
  }, );
  filesdata: FileData[] = [];
  newDocData = this.datosDocumento.value;
  formData: DocumentFormModel = documentFormData;
  selectedFiledata: FileData | null = null;
  typeText: boolean = false;
  docid: string = "";
  deleteFileId: number = 0;
  mostrarModal = false;
  errorMessages = FORM_ERROR_MESSAGES;
  formSubmitted = false;
  
  // Propiedades para el buscador de departamentos
  showDepartmentSearch = false;
  departmentSearchTerm = '';
  filteredDepartments: any[] = [];
  
  // Propiedades para el manejo del departamento receptor
  currentUser: any = null;
  isAdmin: boolean = false;
  isReceiverDepartmentDisabled: boolean = false;
  
  // Propiedades para permisos
  permissions = {
    create: false,
    read: false,
    update: false,
    delete: false
  };
  
  constructor(
    private dataService: DataService, 
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Cargar permisos del usuario
    this.loadPermissions();
    
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

    this.docid = this.route.snapshot.paramMap.get('id')!;
    if(this.docid){
              this.dataService.editDocument(this.docid).subscribe({
          next: (response) => {
            this.formData.categories = response.categories || [];
            this.formData.statuses = response.statuses || [];
            this.formData.senders_department = response.senders_department || [];
            this.formData.receivers_department = response.receivers_department || [];
            
            // Configurar departamento receptor por defecto si ya tenemos los datos del usuario
            if (this.currentUser) {
              this.setDefaultReceiverDepartment();
            }
          },
          error: (error) => {
            this.router.navigate(['/main']);
            this.notificationService.showError(error.statusText, '¡Oh no! Ocurrio un error inesperado');

          }
        });
      this.dataService.getDocumentbyId(this.docid).subscribe({  
        next: (response) => {
          this.document = response.document; 
          this.datosDocumento.patchValue({
            title: this.document.title,
            reference_number: this.document.reference_number,
            category_id: this.document.category?.id,
            status_id: this.document.status?.id ? Number(this.document.status.id) : null,
            sender_department_id: this.document.sender_department?.id,
            receiver_department_id: this.document.receiver_department?.id,
            issue_date: this.document.issue_date,
            received_date: this.document.received_date,
            description: this.document.description,
          });
          
          // Configurar el término de búsqueda si hay un departamento seleccionado
          if (this.document.sender_department?.id) {
            this.departmentSearchTerm = this.document.sender_department.name;
          }
          
          this.filesdata= response.document.files;
        },
        error: (error) => {
          this.router.navigate(['/main']);
          this.notificationService.showError(error.statusText, '¡Oh no! Ocurrio un error inesperado');
        }
      });
    } 
  }
  
  onSubmit() {
    this.formSubmitted = true;
    
    // Verificar permisos antes de actualizar
    if (!this.permissions.update && !this.isAdmin) {
      this.notificationService.showError( 'No tienes permisos para actualizar documentos', 'Sin permisos');
      return;
    }
  
  if (this.datosDocumento.valid) {
    const senderDept = this.datosDocumento.get('sender_department_id')?.value;
    const newSenderDept = this.datosDocumento.get('new_sender_department')?.value;

    const jsonData: any = {};

    Object.keys(this.datosDocumento.controls).forEach(key => {
      const control = this.datosDocumento.get(key);
      if (!control || control.value === null || control.value === undefined) return;

      // Excluir sender_department_id si se está usando un nuevo departamento
      if (key === 'sender_department_id' && newSenderDept) return;

      // Excluir new_sender_department si NO se está usando un nuevo departamento
      if (key === 'new_sender_department' && !newSenderDept) return;

      // Para controles deshabilitados, usar el valor actual
      if (control.disabled) {
        jsonData[key] = control.value;
      } else {
        jsonData[key] = control.value;
      }
    });

    this.dataService.updateDocument(this.document.id, jsonData).subscribe({
      next: (response) => {
        this.router.navigate(['/main']);
        this.notificationService.showSuccess('Documento actualizado con éxito', 'Actualizado');
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message, 'Error en la actualización');
      }
    });

  } else {
    this.datosDocumento.markAllAsTouched(); 
    this.notificationService.showError('Los Campos obligatorios no pueden estar vacíos', 'Error al rellenar los datos');
  }
}

deleteFile() {
  // Verificar permisos antes de eliminar
  if (!this.permissions.delete && !this.isAdmin) {
    this.notificationService.showError('No tienes permisos para eliminar archivos', 'Sin permisos');
    this.mostrarModal = false;
    return;
  }

  this.mostrarModal = false;
  this.dataService.deleteFile(this.docid, this.deleteFileId).subscribe({
    next: (response) => {
      this.filesdata = this.filesdata.filter(file => file.id !== this.deleteFileId);
      this.notificationService.showSuccess('El archivo ha sido eliminado con éxito', 'Archivo eliminado');
    },
    error: (error) => {
      this.notificationService.showError(error.error?.message, 'Error al eliminar el archivo');
    }
  });
}

SelecttoText(event: Event) {
  const select = this.datosDocumento.get('sender_department_id');
  if (select?.value === 'NewDep') {
    this.typeText = true;
    this.updateSenderValidators();
    this.datosDocumento.patchValue({ sender_department_id: 0 });
  } else {
    this.negTypeText();  // resetea el campo adicional si elige un departamento válido
  }
}
updateSenderValidators(): void {
  if (this.typeText) {
    // Nuevo departamento
    this.datosDocumento.get('new_sender_department')?.setValidators([Validators.required, Validators.maxLength(255)]);
    this.datosDocumento.get('sender_department_id')?.clearValidators();
    this.datosDocumento.get('sender_department_id')?.setValue(null); // opcional, para limpiar
  } else {
    // Selección desde dropdown
    this.datosDocumento.get('sender_department_id')?.setValidators([Validators.required]);
    this.datosDocumento.get('new_sender_department')?.clearValidators();
    this.datosDocumento.get('new_sender_department')?.setValue(''); // opcional
  }

  this.datosDocumento.get('new_sender_department')?.updateValueAndValidity();
  this.datosDocumento.get('sender_department_id')?.updateValueAndValidity();
}
negTypeText() {
  this.typeText = false;
  this.datosDocumento.patchValue({ new_sender_department: '' });
  this.updateSenderValidators();
  // Cerrar el buscador
  this.showDepartmentSearch = false;
  this.departmentSearchTerm = '';
}

  senderDepartmentValidator(group: AbstractControl): ValidationErrors | null {
  const sender = group.get('sender_department_id')?.value;
  const newSender = group.get('new_sender_department')?.value;
  return sender || newSender ? null : { senderMissing: true };
}


abrirModal(id: number) {
    const archivo = this.filesdata .find(file => file.id === id);
    this.selectedFiledata = archivo || null;
    this.mostrarModal = true;
    this.deleteFileId = id;
}

  cerrarModal() {
    this.mostrarModal = false;
  }

  getErrorMessages(fieldName: string): any {
    const msg = this.errorMessages[fieldName as keyof typeof this.errorMessages];
    if (typeof msg === 'string') {
      return { required: msg };
    }
    return msg || {};
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

  loadPermissions(): void {
    try {
      const storedPermissions = localStorage.getItem('permissions');
      if (storedPermissions) {
        this.permissions = JSON.parse(storedPermissions);
      }
    } catch (error) {
      // Fallback to default permissions if there's an error
      this.permissions = {
        create: false,
        read: false,
        update: false,
        delete: false
      };
    }
  }

}

