import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-form-input-error',
  imports: [
    CommonModule
  ],
   template: `
    @if (showErrors) {
      <div class="error-messages" @errorAnimation>
        @for (error of activeErrors; track error) {
          <div class="error-message">
            <span class="error-icon">!</span>
            {{ getMessage(error) }}
          </div>
        }
      </div>
    }
  `,
  styles: [`
  :host {
    --error-color: #dc3545;
    --error-bg-color: #f8d7da;
    --error-border-color: #f5c6cb;
  }

  .error-messages {
    margin-top: 0.5rem;
  }

  .error-message {
    color: var(--error-color);
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--error-bg-color);
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    background-color: var(--error-color);
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
    flex-shrink: 0;
  }
`],
animations: [
  trigger('errorAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-5px)' }),
      animate('200ms ease-out',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('150ms ease-in',
        style({ opacity: 0, transform: 'translateY(-5px)' }))
    ])
  ])
]
})
export class FormInputErrorComponent {
  @Input({ required: true }) control!: AbstractControl;
@Input() errorMessages: Record<string, string> = {};
@Input() showOnSubmit = false;

  private defaultErrorMessages: Record<string, string> = {
    required: 'Este campo es requerido',
    email: 'Ingrese un email válido',
    minlength: 'Longitud mínima no alcanzada',
    maxlength: 'Longitud máxima excedida',
    pattern: 'Formato incorrecto',
    min: 'Valor mínimo no alcanzado',
    max: 'Valor máximo excedido'
  };

  get showErrors(): boolean {
    if (!this.control) return false;
    return (this.control.dirty || this.control.touched || this.showOnSubmit) &&
           this.control.invalid;
  }

  get activeErrors(): string[] {
    return Object.keys(this.control.errors || {});
  }

getMessage(errorType: string): string {
  return this.errorMessages[errorType] ||
         this.defaultErrorMessages[errorType] ||
         `Error de validación (${errorType})`;
}
}
