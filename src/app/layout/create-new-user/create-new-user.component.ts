import { Component, OnInit } from '@angular/core';
import { UdaService } from '../../service/uda.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { DataService } from '../../service/data.service';

export interface User {
  name: string,
  username: string,
  password: string,
  role: string,
  permissions: Array<string>
}

@Component({
  selector: 'app-create-new-user',
  imports: [ReactiveFormsModule, FormInputErrorComponent],
  templateUrl: './create-new-user.component.html',
  styleUrl: './create-new-user.component.css'
})
export class CreateNewUserComponent implements OnInit {
  formSubmitted = false;
  errorMessages = FORM_ERROR_MESSAGES;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private udaService: UdaService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.loadDepartments();
    this.setupDepartmentValidation();
  }

  userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(8)]),
    role: new FormControl('', [Validators.required]),
    department: new FormControl('', []),
    permissions: new FormArray([], [Validators.required])
  });

  newU = this.userForm.value;
  user = [];
  selectedPhoto: string = '';
  permissionslist: { [key: string]: string } = {
    create: 'Crear',
    read: 'Leer',
    update: 'Actualizar',
    delete: 'Eliminar',
  };
  permisosKeys = Object.keys(this.permissionslist);
  departments: any[] = []; // Lista de departamentos disponibles

  selectPhoto(value: string) {
    this.selectedPhoto = value;
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const permissionsArray = this.userForm.get('permissions') as FormArray;

    if (checkbox.checked) {
      permissionsArray.push(new FormControl(checkbox.value));
    } else {
      const index = permissionsArray.controls.findIndex(
        (x) => x.value === checkbox.value
      );
      if (index >= 0) {
        permissionsArray.removeAt(index);
      }
    }
  }

  onSubmit() {
    this.newUser();
  }

  newUser() {
    this.formSubmitted = true;
    if (this.userForm.valid) {
      const formData = { ...this.userForm.value };
      
      // Si el rol es admin, eliminar el campo department del formulario
      if (formData.role === 'admin') {
        delete formData.department;
      }
      
      this.udaService.createUser(formData).subscribe({
        next: () => {
          this.router.navigate(['/main/panel']);
          this.notificationService.showSuccess('Usuario creado exitosamente', 'Exito');
        },
        error: (error) => {
          // Manejar errores de validación del backend
          if (error.status === 422 && error.error?.errors) {
            this.handleBackendValidationErrors(error.error.errors);
          } else {
            this.notificationService.showError(error.errors?.join(', ') || 'Error al crear el usuario', 'Error');
          }
        }
      });
    } else {
      this.userForm.markAllAsTouched();
      this.notificationService.showError('Complete los campos requeridos', 'Error');
    }
  }

  private handleBackendValidationErrors(errors: any) {
    // Limpiar errores previos
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    // Aplicar errores del backend
    Object.keys(errors).forEach(fieldName => {
      const control = this.userForm.get(fieldName);
      if (control) {
        const errorMessages = errors[fieldName];
        const errorKey = this.getErrorKey(errorMessages[0]);
        control.setErrors({ [errorKey]: true });
        
        // Agregar el mensaje personalizado al control
        if (errorKey === 'unique' && fieldName === 'username') {
          control.setErrors({ unique: 'El usuario ya existe' });
        }
      }
    });
  }

  private getErrorKey(errorMessage: string): string {
    if (errorMessage.includes('ya existe') || errorMessage.includes('ya está en uso')) {
      return 'unique';
    }
    if (errorMessage.includes('obligatorio') || errorMessage.includes('requerido')) {
      return 'required';
    }
    if (errorMessage.includes('máximo') || errorMessage.includes('max')) {
      return 'maxlength';
    }
    if (errorMessage.includes('mínimo') || errorMessage.includes('min')) {
      return 'minlength';
    }
    return 'custom';
  }

  getErrorMessages(fieldName: string): any {
    const msg = this.errorMessages[fieldName as keyof typeof this.errorMessages];
    if (typeof msg === 'string') {
      return { required: msg };
    }
    return msg || {};
  }

  isDepartmentRequired(): boolean {
    return this.userForm.get('role')?.value === 'user';
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

  setupDepartmentValidation() {
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      const departmentControl = this.userForm.get('department');
      
      if (role === 'admin') {
        // Si es admin, remover validadores y limpiar el valor
        departmentControl?.clearValidators();
        departmentControl?.setValue('');
        departmentControl?.markAsUntouched();
        departmentControl?.setErrors(null);
      } else if (role === 'user') {
        // Si es user, hacer el campo obligatorio
        departmentControl?.setValidators([Validators.required]);
        departmentControl?.markAsTouched();
      }
      
      departmentControl?.updateValueAndValidity();
    });
  }
}
