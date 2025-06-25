import { Component, Optional, Inject, Input } from '@angular/core';
import { documentFormData, DocumentFormModel } from '../../models/trackingDocs';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { NotificationService } from '../../service/notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';

interface ArchivoSubido {
  id: number;
  nombre: string;
  tipo: string;
  tamaño: number;
  file: File;
}

@Component({
  selector: 'app-add-document',
  imports: [ReactiveFormsModule],
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
    sender_department_id: new FormControl<number | string>(0),
    new_sender_department: new FormControl<string | null>(''), // Nuevo campo opcional
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
  archivosSubidos: ArchivoSubido[] = [];  // Arreglo para guardar los archivos
  FileArray: File[] = [];
  currentUser: any = null;
  isAdmin: boolean = false;
  isReceiverDepartmentDisabled: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    @Optional() public dialogRef?: MatDialogRef<AddDocumentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    //console.log("aqui el parent nbb::",data)
}

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

      // 🔽 Actualiza el valor del FormControl en el formulario reactivo
      this.datosDocumento.patchValue({
        files: this.FileArray
      });
    }
  }
  eliminarArchivo(id: number) {
    this.archivosSubidos = this.archivosSubidos.filter(archivo => archivo.id !== id);
  }

  onSubmit() {
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
        },
        error: (error) => {
          this.notificationService.showError(error.error?.message || 'Falló la subida', 'Error');
        }
      });
    } else {
      const senderDept = this.datosDocumento.get('sender_department')?.value;
      const newSenderDept = this.datosDocumento.get('new_sender_department')?.value;
      if (!senderDept && !newSenderDept) {
        this.notificationService.showError('Seleccionar un remitente o agregar uno nuevo', 'Error');
        return;
      }

      this.datosDocumento.markAllAsTouched();
      this.notificationService.showError('Revisa los campos obligatorios', 'Error');
    }
  }

  SelecttoText(event: Event) {
    const select = this.datosDocumento.get('sender_department_id');
    if (select?.value === 'NewDep') {
      this.typeText = true;
      this.datosDocumento.patchValue({ sender_department_id: '' });
    } else {
      this.negTypeText();  // resetea el campo adicional si elige un departamento válido
    }
  }

  negTypeText() {
    this.typeText = false;
    this.datosDocumento.patchValue({ new_sender_department: '' });
  }

  senderDepartmentValidator(group: AbstractControl): ValidationErrors | null {
    const sender = group.get('sender_department_id')?.value;
    const newSender = group.get('new_sender_department')?.value;
    return sender || newSender ? null : { senderMissing: true };
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
}
