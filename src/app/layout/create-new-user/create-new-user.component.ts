import { Component } from '@angular/core';
import { UdaService } from '../../service/uda.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';

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
export class CreateNewUserComponent {
  formSubmitted = false;
  errorMessages = FORM_ERROR_MESSAGES;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private udaService: UdaService,
  ) { }

  userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(8)]),
    role: new FormControl('', [Validators.required]),
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
      this.udaService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.router.navigate(['/main/panel']);
          this.notificationService.showSuccess('Usuario creado exitosamente', 'Exito');
        },
        error: (error) => {
          this.router.navigate(['/main/panel']);
          this.notificationService.showError('Error al crear el usuario', 'Error');
        }
      });
    } else {
      this.userForm.markAllAsTouched();
      this.notificationService.showError('Complete los campos requeridos', 'Error');
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
