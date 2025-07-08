import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { UdaService } from '../../service/uda.service';
import { NotificationService } from '../../service/notification.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';

export interface DialogData {
  id: string;
  name: string;
}

export interface usuario {
  id: number;
  name: string;
  username: string;
}

interface Department {
  id: number;
  name: string;
}

interface profileUser {
  id: number;
  name: string;
  username: string;
  department: Department;
  permissions: string[];
  profile_photo: string;
  roles: string[];
}
export interface User {
  name: string;
  username: string;
  password: string;
  role: string;
  permissions: Array<string>;
}

export const openClose = trigger('openClose', [
  state(
    'open',
    style({
      height: '*',
      opacity: 1,
      overflow: 'hidden',
    })
  ),
  state(
    'closed',
    style({
      height: '*',
      opacity: 0.8,
      overflow: 'hidden',
    })
  ),
  transition('void => open', [
    style({ height: '0', opacity: 0 }),
    animate('400ms ease-out'),
  ]),
  transition('open => closed', [
    animate('400ms ease-in', style({ height: '0', opacity: 0 })),
  ]),
  transition('closed => open', [animate('400ms ease-out')]),
]);
@Component({
  selector: 'app-table-users',
  imports: [MatTableModule, MatPaginatorModule, ReactiveFormsModule, FormInputErrorComponent],
  templateUrl: './table-users.component.html',
  styleUrl: './table-users.component.css',
  animations: [openClose],
})
export class TableUsersComponent {
  errorMessages = FORM_ERROR_MESSAGES;
  formSubmitted = false;

  constructor(
    private udaService: UdaService,
    private NotificationService: NotificationService,
    private router: Router
  ) { }
  permissionslist: { [key: string]: string } = {
    create: 'Crear',
    read: 'Leer',
    update: 'Actualizar',
    delete: 'Eliminar',
  };
  permisosKeys = Object.keys(this.permissionslist);

  userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(5)]),
    new_password: new FormControl('', [Validators.maxLength(30), Validators.minLength(8)]),
    new_password_confirmation: new FormControl('', [this.matchFields('new_password', 'new_password_confirmation')]),
    admin_password: new FormControl(''),
    role: new FormControl('', [Validators.required]),
    permissions: new FormArray([], [Validators.required]),
  });

  profileisview: boolean = false;
  userisedit: boolean = false;
  profile!: profileUser;
  isLoading = false;
  columnsToDisplay = ['Nombre', 'Alias', 'Acciones'];
  users: usuario[] = [];
  dataSource = new MatTableDataSource<usuario>();
  readonly dialog = inject(MatDialog);
  isOpen = false;

  ngOnInit() {
    this.getListUsers();
    this.setupPasswordValidation();
  }
  getListUsers() {
    this.udaService.getUsers().subscribe({
      next: (response) => {
        this.users = response.map((user: any) => ({
          id: user.id,
          name: user.name,
          username: user.username,
        }));
        this.dataSource.data = this.users;
        this.isLoading = true;
      },
      error: (error) => {
        this.router.navigate(['/main']);
      },
    });
  }

  delete(id: number): void {
    this.udaService.deleteUser(id).subscribe({
      next: (response) => {
        this.NotificationService.showSuccess('Usuario eliminado', '¡Éxito!');
        this.getListUsers();
        this.isOpen = false;
      },
      error: (error) => {
        this.NotificationService.showError(this.getFirstErrorMessage(error) || 'Error al eliminar el usuario', 'Error');
      },
    });
  }

  getUserData(id: number) {
    this.userisedit = false;
    this.isOpen = false;
    if (id) {
      this.udaService.infoUser(+id).subscribe({
        next: (response) => {
          this.profile = response;
          this.profileisview = true;
          this.isOpen = true;
          console.log(this.profile);
        },
          error: (error) => {
          this.NotificationService.showError(this.getFirstErrorMessage(error) || 'Error al obtener los datos del usuario', 'Error');
          this.router.navigate(['/main/mas_detalles']);
        },
      });
    } else {
      this.router.navigate(['/main/mas_detalles']);
    }
  }

  editUser(id: number) {
    this.userisedit = true;
    this.userForm.patchValue({
      name: this.profile.name,
      username: this.profile.username,
      role: this.profile.roles?.[0] || 'user',
    });
    this.setPermisosSeleccionados(this.profile.permissions);
    
    this.setupPasswordValidation();
  }

  setPermisosSeleccionados(permisos: string[]) {
    const permisosFormArray = this.userForm.get('permissions') as FormArray;
    permisosFormArray.clear();

    if (permisos && Array.isArray(permisos)) {
      permisos.forEach((permiso: string) => {
        permisosFormArray.push(new FormControl(permiso));
      });
    }
  }

  returnUserData() {
    this.userisedit = false;
    this.userForm.reset();
    this.formSubmitted = false;
  }

  openDialog(id_user: number, name: string): void {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      data: {
        id: id_user,
        name: name,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete(result);
      }
    });
  }

  traducirPermiso(permiso: string): string {
    switch (permiso) {
      case 'create':
        return 'Crear';
      case 'read':
        return 'Leer';
      case 'update':
        return 'Actualizar';
      case 'delete':
        return 'Eliminar';
      default:
        return permiso;
    }
  }

  onSubmit(id: number): void {
    this.formSubmitted = true;
    
    if (this.userForm.valid && id) {
      const formData = { ...this.userForm.value };

      // Si no hay nueva contraseña, eliminamos esos campos
      if (!formData.new_password) {
        delete formData.new_password;
        delete formData.new_password_confirmation;
        delete formData.admin_password;
      }

      this.udaService.editUser(+id, formData).subscribe({
        next: (response) => {
          this.NotificationService.showSuccess('Cambios guardados', '¡Éxito!');
          this.userisedit = false;
          this.userForm.reset();
          this.getUserData(id);
          this.setupPasswordValidation();
          this.formSubmitted = false;
          this.getListUsers();
        },
        error: (error) => {
          if (error.status === 422 && error.error?.errors) {
            this.handleBackendValidationErrors(error.error.errors);
            this.NotificationService.showWarning('Error al editar el usuario', 'Error');
          } else {
            const errorMessage = this.getFirstErrorMessage(error);
            this.NotificationService.showError( errorMessage  || 'Error al editar el usuario','Error');
          }
        },
      });
    } else {
      this.userForm.markAllAsTouched();
      this.NotificationService.showError('Complete los campos requeridos', 'Error');
    }
  }
  

  setupPasswordValidation(): void {
    this.userForm.get('new_password')?.valueChanges.subscribe((newPassword) => {
      const confirmControl = this.userForm.get('new_password_confirmation');
      const adminControl = this.userForm.get('admin_password');

      if (newPassword && newPassword.trim()) {
        confirmControl?.setValidators([
          Validators.required,
          this.matchFields('new_password', 'new_password_confirmation')
        ]);
        adminControl?.setValidators([Validators.required]);

        confirmControl?.markAsTouched();
        adminControl?.markAsTouched();
      } else {
        confirmControl?.clearValidators();
        adminControl?.clearValidators();

        confirmControl?.setValue('');
        adminControl?.setValue('');
        confirmControl?.markAsUntouched();
        adminControl?.markAsUntouched();
        confirmControl?.setErrors(null);
        adminControl?.setErrors(null);
      }

      confirmControl?.updateValueAndValidity();
      adminControl?.updateValueAndValidity();
    });
  }

  shouldShowConditionalError(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    const newPassword = this.userForm.get('new_password')?.value;

    if (newPassword && newPassword.trim()) {
      return control ? (control.invalid && (control.touched || this.formSubmitted)) : false;
    }

    return false;
  }

  isConditionalFieldRequired(fieldName: string): boolean {
    const newPassword = this.userForm.get('new_password')?.value;
    return !!(newPassword && newPassword.trim());
  }

  matchFields(field1: string, field2: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const field1Value = this.userForm?.get(field1)?.value;
      const field2Value = control.value;

      if (field1Value && field2Value && field1Value !== field2Value) {
        return { mismatch: true };
      }

      return null;
    };
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

  isChecked(permiso: string): boolean {
    const formArray = this.userForm.get('permissions') as FormArray;
    return formArray.value.includes(permiso);
  }

  getErrorMessages(fieldName: string): any {
    const msg = this.errorMessages[fieldName as keyof typeof this.errorMessages];
    if (typeof msg === 'string') {
      return { required: msg };
    }
    return msg || {};
  }
  private handleBackendValidationErrors(errors: any) {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    Object.keys(errors).forEach(fieldName => {
      const control = this.userForm.get(fieldName);
      if (control) {
        const errorMessages = errors[fieldName];
        const errorKey = this.getErrorKey(errorMessages[0]);
        control.setErrors({ [errorKey]: true });
      }
    });
  }

  private getErrorKey(errorMessage: string): string {
    if (errorMessage.includes('ya existe') || errorMessage.includes('ya está en uso')) {
      return 'unique';
    }
    if (errorMessage.includes('contraseña de administrador') || errorMessage.includes('incorrecta')) {
      return 'admin_password';
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

  getFirstErrorMessage(error: any): string {
    if (error?.error?.errors) {
      const errors = error.error.errors;
      const firstErrorField = Object.keys(errors)[0];
      const firstErrorMessage = errors[firstErrorField][0];
      return firstErrorMessage;
    }
    return '';
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-dialog.html',
  styleUrl: 'dialog-content-dialog.css',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentExampleDialog {
  readonly dialogRef = inject(MatDialogRef<TableUsersComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  eliminar(id: number): void {
    this.dialogRef.close(id);
  }
}
