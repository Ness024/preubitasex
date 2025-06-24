import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, inject, Input, SimpleChanges } from '@angular/core';
import { DataService } from '../../service/data.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiResponse, Document } from '../../models/document';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../service/notification.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableRComponent, DialogData } from '../table-r/table-r.component';
import { TimeService } from '../../service/time.service';
import { PdfComponent } from "../../icons/pdf/pdf.component";
import { DocComponent } from "../../icons/doc/doc.component";
import { XlsxComponent } from "../../icons/xlsx/xlsx.component";
import { UdaService } from '../../service/uda.service';
import { ChangestatusComponent } from "../changestatus/changestatus.component";
export interface usuario {
  id: number;
  name: string;
}
export interface Comment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
  document_id: string;
  document: any | null;
  user_id: number;
  user: usuario;
  replies: Comment[];
}
interface ArchivoSubido {
  id: number;       // Identificador único (puede ser un timestamp o un UUID)
  nombre: string;   // Nombre del archivo (ej: "documento.pdf")
  tipo: string;     // Tipo MIME (ej: "sapplication/pdf")
  tamaño: number;   // Tamaño en bytes
  file: File;       // Objeto File original (opcional, si necesitas enviarlo luego)
}
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
  selector: 'app-document-details',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PdfComponent, DocComponent, XlsxComponent, ChangestatusComponent],
  templateUrl: './document-details.component.html',
  styleUrl: './document-details.component.css'
})

export class DocumentDetailsComponent {
  @Input() documentId?: string;
  commentForm = new FormGroup({
    comment: new FormControl('', { nonNullable: true })
  });
  postingComment = false;

  readonly dialog = inject(MatDialog);
  safeUrl: SafeResourceUrl = "";
  idDoc: string = "";
  coments: Comment[] = [];
  files: FileData[] = [];
  document!: Document;
  archivosSubidos: ArchivoSubido[] = [];
  FileArray: File[] = [];
  permissions = {
    create: false,
    read: false,
    update: false,
    delete: false
  };
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private NotificationService: NotificationService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private time: TimeService,
    public udaService: UdaService // Inyectar UdaService para comentarios
  ) { }
  previewisvisible: boolean = false;
  documentisEdit: boolean = false;
  filesform = new FormGroup({
    files: new FormControl<File[] | null>([])
  });

  ngOnInit(): void {
    this.loadPermissions();
    this.idDoc = this.route.snapshot.paramMap.get('id')!; // Obtiene el id del documento
    if (this.idDoc) {
      this.loadDocument();
    }
  }

  ngOnChanges(changes:SimpleChanges) {
    if (changes['documentId'] && this.documentId) {
      this.idDoc = this.documentId;
      this.loadDocument();
    }
  }

  loadDocument(){
    this.dataService.getDocumentbyId(this.idDoc).subscribe({
        next: (response) => {
          const doc = response.document as Document;
          this.document = {
            ...doc,
            issue_date: this.time.formatFullDate(doc.issue_date),
            received_date: this.time.formatFullDate(doc.received_date),
            created_at: this.time.formatFullDate(doc.created_at),
            updated_at: doc.updated_at ? this.time.formatFullDate(doc.updated_at) : null,
          };
          this.coments = (response.comments as any[]).map((c: any): Comment => ({
            ...c,
            id: Number(c.id),
            created_at: this.time.getRelativeTime(c.created_at),
            updated_at: c.updated_at ? this.time.getRelativeTime(c.updated_at) : null,
          }));
          this.files = response.document.files;
        },
        error: (error) => {
          this.router.navigate(['/main']);
          this.NotificationService.showError(error.error.message, error.error.message);
        }
      });
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

  descargafile(idarchivo: number) {
    this.dataService.downloadDocFile(this.idDoc, idarchivo).subscribe({
      next: (value) => {
        const blob = value.body!;
        const contentDisposition = value.headers.get('content-disposition');

        // Nombre por defecto (sin extensión o con una genérica)
        let filename = 'archivo_descargado';

        if (contentDisposition) {
          // Extrae el nombre del archivo de content-disposition
          const filenameRegex = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i;
          const matches = filenameRegex.exec(contentDisposition);

          if (matches != null && matches[1]) {
            filename = matches[1].trim();
          }
        }

        // Crear el enlace de descarga
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Limpieza
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        ;
        // Puedes manejar el error aquí, por ejemplo mostrando un mensaje al usuario
      }
    });
  }
  deletedoc() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.deleteDocument(id).subscribe({
        next: (response: ApiResponse) => {
          this.router.navigate(['/main']);
          this.NotificationService.showSuccess('Documento borrado con exito', `El documento ${id} fue borrado`); // Muestra la notificación de éxito
        },
        error: (error) => {
          this.router.navigate(['/main']);
          this.NotificationService.showSuccess("No tienes permiso para hacer esto", error);
        }
      });
    }
  }


  onFileArraySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const extension = file.name.split('.').pop()?.toLowerCase();
      const extensionesPermitidas = ['pdf', 'xlsx', 'docx'];
      if (!extension || !extensionesPermitidas.includes(extension)) {
        this.NotificationService.showError(
          'Formato incorrecto',
          'Solo se permiten archivos PDF, XLSX o DOCX'
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.NotificationService.showError(
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
      this.filesform.patchValue({
        files: this.FileArray
      });
    }
  }
  eliminarArchivo(id: number) {
    this.archivosSubidos = this.archivosSubidos.filter(archivo => archivo.id !== id);
  }
  closePreview() {
    this.previewisvisible = false;
  }

  postComment() {
    if (this.commentForm.invalid || this.postingComment) return;
    this.postingComment = true;
    const commentText = this.commentForm.get('comment')?.value?.trim();
    if (!commentText) {
      this.NotificationService.showError('El comentario no puede estar vacío', 'Error');
      this.postingComment = false;
      return;
    }
    const payload = {
      document_id: this.idDoc,
      comment: commentText
    };
    this.udaService.postComment(payload).subscribe({
      next: (resp: any) => {
        this.NotificationService.showSuccess('Comentario agregado', 'Éxito');
        this.commentForm.reset();
        this.refreshComments();
        this.postingComment = false;
      },
      error: (err: any) => {
        this.NotificationService.showError('Error al agregar comentario', err?.error?.message || '');
        this.postingComment = false;
      }
    });
  }

  deleteComment(commentId: string) {
    if (!commentId) return;
    this.udaService.deleteComment(Number(commentId)).subscribe({
      next: () => {
        this.NotificationService.showSuccess('Comentario eliminado', 'Éxito');
        this.refreshComments();
      },
      error: (err: any) => {
        this.NotificationService.showError('Error al eliminar comentario', err?.error?.message || '');
      }
    });
  }

  refreshComments() {
    if (this.idDoc) {
      this.dataService.getDocumentbyId(this.idDoc).subscribe({
        next: (response) => {
          this.coments = response.comments.map((c: any) => ({ ...c, id: Number(c.id) }));
        }
      });
    }
  }

  onSubmit() {
    const formData = new FormData();
    const archivos = this.filesform.get('files')?.value;
    if (archivos && Array.isArray(archivos)) {
      archivos.forEach((file: File) => {
        formData.append('files[]', file);  // 👈 nombre correcto
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.uploadFiles(id, formData).subscribe({
        next: (response) => {
          this.NotificationService.showSuccess('Archivos subidos con exito', `Los archivos fueron subidos`); // Muestra la notificación de éxito
          setTimeout(() => {
            window.location.reload();
          }, 500);
        },
        error: (error) => {
          this.NotificationService.showError('Error al subir archivos', error.error.message);
        }
      });
    }
  }
  changestatusopen = false;
  changestatus() {
    this.changestatusopen = true;
  }
  cerrarModal() {
    this.changestatusopen = false;
    this.loadDocument();
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletedoc();
      }
    });
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-dialog.html',
  styleUrl: 'dialog-content-dialog.css',
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentExampleDialog {
  readonly dialogRef = inject(MatDialogRef<TableRComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  eliminar(id: string): void {
    this.dialogRef.close(id);
  }
}
