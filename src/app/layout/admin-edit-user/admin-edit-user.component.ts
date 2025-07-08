import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { UdaService } from '../../service/uda.service';
import { FormInputErrorComponent } from '../../shared/form-input-error/form-input-error.component';
import { FORM_ERROR_MESSAGES } from '../../shared/constants/form-error-messages';

export interface User{
  name: string,
  username: string,
  password: string,
  role: string,
  permissions: Array<string>
}

@Component({
  selector: 'app-admin-edit-user',
  imports: [ReactiveFormsModule, FormInputErrorComponent],
  templateUrl: './admin-edit-user.component.html',
  styleUrl: './admin-edit-user.component.css'
})
export class AdminEditUserComponent {
  errorMessages = FORM_ERROR_MESSAGES;
  formSubmitted = false;
  user: User = {
    name: '',
    username: '',
    password: '',
    role: '',
    permissions: []
  };
  constructor(      
    private router: Router,
    private notificationService: NotificationService,   
    private route: ActivatedRoute,
    private udaService: UdaService,
  ){}
  userForm= new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]), 
    username: new FormControl('', [Validators.required,  Validators.maxLength(255)]),
    new_password: new FormControl('',[Validators.required, Validators.maxLength(255)]), 
    new_password_confirmation: new FormControl('',[Validators.required, Validators.maxLength(255)]), 
    admin_password: new FormControl('',[Validators.required, Validators.maxLength(255)]), 
    role: new FormControl('', [Validators.required, Validators.maxLength(255)]),//
    permissions: new FormArray([], [Validators.required])
  });
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if(id){
      this.udaService.infoUser(+id).subscribe({
        next: (response) => {
          this.user = response;
          this.userForm.patchValue({
            name: response.name,
            username: response.username,
            permissions: response.permissions
          })
        },
        error: (error) => {
          this.router.navigate(['/main']);
          this.notificationService.showError(error?.error?.message, '¡Oh no! Ocurrió un error inesperado');
        }
      });
    }
  }
  getFirstErrorMessage(error: any): string {
  if (error?.error?.errors) {
    const errors = error.error.errors;
    // Obtener el primer campo que tenga errores
    const firstErrorField = Object.keys(errors)[0];
    // Obtener el primer mensaje de error de ese campo
    const firstErrorMessage = errors[firstErrorField][0];
    return firstErrorMessage;
  }
  return 'Ocurrió un error desconocido';
}
  onSubmit():void{
    const id = this.route.snapshot.paramMap.get('id');
    if(id){
      this.udaService.editUser(+id, this.userForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/main']);
          this.notificationService.showSuccess('Usuario editado correctamente', '¡Exito!');
        },
        error: (error) => {
          const errorMessage = this.getFirstErrorMessage(error);
          this.notificationService.showError(errorMessage, '¡Oh no! Ocurrio un error inesperado');
        }
      });
    }
  }
  onCheckboxChange(event: Event) {
  const checkbox = event.target as HTMLInputElement;
  const permissionsArray = this.userForm.get('permissions') as FormArray;

  if (checkbox.checked) {
    permissionsArray.push(new FormControl(checkbox.value));
  } else {
    const index = permissionsArray.controls.findIndex(x => x.value === checkbox.value);
    if (index >= 0) {
      permissionsArray.removeAt(index);
    }
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
