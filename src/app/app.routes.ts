import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './layout/document-list/document-list.component';
import { AddDocumentComponent } from './layout/add-document/add-document.component';
import { ControlPanelComponent } from './layout/control-panel/control-panel.component';
import { DocumentDetailsComponent } from './layout/document-details/document-details.component';
import { MainComponent } from './layout/main/main.component';
import { EditDocumentComponent } from './layout/edit-document/edit-document.component';
import { LoginComponent } from './layout/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ConfigurationComponent } from './layout/configuration/configuration.component';
import { DocumentfoundComponent } from './layout/documentfound/documentfound.component';
import { CreateNewUserComponent } from './layout/create-new-user/create-new-user.component';
import { TableUsersComponent } from './layout/table-users/table-users.component';
import { UserDataComponent } from './layout/user-data/user-data.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { AdminEditUserComponent } from './layout/admin-edit-user/admin-edit-user.component';
import { NoAuthGuard } from './core/guards/noauth.guard';
import { EditMyUserComponent } from './layout/edit-my-user/edit-my-user.component';
import { ChangestatusComponent } from './layout/changestatus/changestatus.component';
import { DocumentStatusHistoriesComponent } from './layout/document-status-histories/document-status-histories.component';
import { DocumentStatusTimelineComponent } from './layout/document-status-timeline/document-status-timeline.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full',
    },
    {
        path: 'login',
        component:LoginComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'cambiar-estado/:id',
        component: ChangestatusComponent,
    },
    {
        path: 'main',
        component:MainComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            {
                path: '', redirectTo: 'lista', pathMatch: 'full',
            },
            {
                path: 'lista',
                component:DocumentListComponent,
            },
            {
                path: 'detalles/:id',
                component:DocumentDetailsComponent,
            },
            {
                path: 'agregar',
                component:AddDocumentComponent,

            },
            {
                path: 'panel',
                component:ControlPanelComponent,

            },
            {
                path: 'editar/:id',
                component:EditDocumentComponent,

            },
            {
                path: 'configuracion',
                component: ConfigurationComponent,
            },
            {
                path: 'busqueda',
                component: DocumentfoundComponent,
            },
            {
                path: 'nuevo_usuario',
                component: CreateNewUserComponent,
            },
            {
                path: 'mas_detalles',
                component: TableUsersComponent,
            },
            {
                path: 'usuario/:id',
                component: UserDataComponent,
            },
            {
                path: 'editarusuario/:id',
                component: AdminEditUserComponent,
            },
            {
                path: 'editarmiusuario',
                component: EditMyUserComponent,
            },
        ]
    },
     {
        path: 'histories',
        component: DocumentStatusHistoriesComponent,
    },
    {
        path: 'timeline',
        component: DocumentStatusTimelineComponent,
    },
    { path: '**', component: NotFoundComponent }

];
