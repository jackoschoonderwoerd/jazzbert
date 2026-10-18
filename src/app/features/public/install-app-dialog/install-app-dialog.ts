import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-install-app-dialog',
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule],
    templateUrl: './install-app-dialog.html',
    styleUrl: './install-app-dialog.scss',
})
export class InstallAppDialog {


}
