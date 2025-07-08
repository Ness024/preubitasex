import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UdaService } from '../../service/uda.service';
import { NotificationService } from '../../service/notification.service';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';

interface profileUser {
  name: string;
  username: string;
  email: string;
  profile_photo: File;
}
@Component({
  selector: 'app-edit-my-user',
  imports: [ReactiveFormsModule, CommonModule, FormInputErrorComponent],
  templateUrl: './edit-my-user.component.html',
  styleUrl: './edit-my-user.component.css',
})
export class EditMyUserComponent {
  formSubmitted = false;
  errorMessages = FORM_ERROR_MESSAGES;

  user: profileUser = {
    name: '',
    username: '',
    email: '',
    profile_photo: new File([], ''),
  };
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  profileForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
    username: new FormControl<string>('', [Validators.required, Validators.maxLength(30), Validators.minLength(5)]),
    new_password: new FormControl<string>('', [Validators.maxLength(30), Validators.minLength(8)]),
    new_password_confirmation: new FormControl<string>('', [Validators.maxLength(30), Validators.minLength(8), this.matchFields('new_password', 'new_password_confirmation')]),
    current_password: new FormControl<string>('', [Validators.maxLength(30), Validators.minLength(8)]),
    profile_photo: new FormControl<File | null>(null),
  });

  constructor(
    private udaService: UdaService,
    private notificationService: NotificationService,
    private router: Router,
    private authsService: AuthService
  ) { }

  ngOnInit(): void {
    this.udaService.profile().subscribe({
      next: (response) => {
        this.user = response;
        this.previewUrl = response.profile_photo;
        this.profileForm.patchValue({
          name: this.user.name,
          username: this.user.username,
        });
        this.setupPasswordValidation();
      },
      error: () => { },
    });
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.profileForm.valid) {
      const formData = new FormData();
      formData.append('_method', 'PATCH');

      Object.keys(this.profileForm.controls).forEach((key) => {
        const control = this.profileForm.get(key);
        if (control?.dirty && control.value) {
          if (key !== 'profile_photo') {
            formData.append(key, control.value);
          }
        }
      });

      if (this.selectedFile) {
        formData.append('profile_photo', this.selectedFile);
      }

      this.udaService.updateProfile(formData).subscribe({
        next: (response) => {
          if (response.status === 'no-changes') {
            this.notificationService.showWarning(response?.message || 'No hay cambios para actualizar', 'Atención');
          } else {
            const userData = { name: this.profileForm.value.name };
            this.authsService.setUser(userData);
            this.router.navigate(['/main']);
            this.notificationService.showSuccess('Usuario actualizado correctamente', 'Exito');
          }
        },
        error: (error) => {
          if (error.status === 422 && error.error?.errors) {
            this.handleBackendValidationErrors(error.error.errors);
          } else {
            this.notificationService.showError(error?.error?.error || error?.error || 'Error al actualizar el usuario', 'Error');
          }
        },
      });
    } else {
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

  setupPasswordValidation(): void {
    this.profileForm.get('new_password')?.valueChanges.subscribe((newPassword) => {
      const confirmControl = this.profileForm.get('new_password_confirmation');
      const currentControl = this.profileForm.get('current_password');

      if (newPassword && newPassword.trim()) {
        confirmControl?.setValidators([
          Validators.required,
          this.matchFields('new_password', 'new_password_confirmation')
        ]);
        currentControl?.setValidators([Validators.required]);

        confirmControl?.markAsTouched();
        currentControl?.markAsTouched();
      } else {
        confirmControl?.clearValidators();
        currentControl?.clearValidators();

        confirmControl?.setValue('');
        currentControl?.setValue('');
        confirmControl?.markAsUntouched();
        currentControl?.markAsUntouched();
        confirmControl?.setErrors(null);
        currentControl?.setErrors(null);
      }

      confirmControl?.updateValueAndValidity();
      currentControl?.updateValueAndValidity();
    });
  }

  shouldShowConditionalError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    const newPassword = this.profileForm.get('new_password')?.value;

    if (newPassword && newPassword.trim()) {
      return control ? (control.invalid && (control.touched || this.formSubmitted)) : false;
    }

    return false;
  }

  isConditionalFieldRequired(fieldName: string): boolean {
    const newPassword = this.profileForm.get('new_password')?.value;
    return !!(newPassword && newPassword.trim());
  }

  matchFields(field1: string, field2: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const field1Value = this.profileForm?.get(field1)?.value;
      const field2Value = control.value;

      if (field1Value && field2Value && field1Value !== field2Value) {
        return { mismatch: true };
      }

      return null;
    };
  }

  private handleBackendValidationErrors(errors: any) {
    // Limpiar errores previos
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    // Aplicar errores del backend
    Object.keys(errors).forEach(fieldName => {
      const control = this.profileForm.get(fieldName);
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

}
