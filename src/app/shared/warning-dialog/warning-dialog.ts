import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-warning-dialog',
    imports: [MatButtonModule],
    templateUrl: './warning-dialog.html',
    styleUrl: './warning-dialog.scss',
    standalone: true
})
export class WarningDialog {
    data = inject(MAT_DIALOG_DATA)
    dialogRef = inject(MatDialogRef<WarningDialog>)

    constructor() {
        console.log(this.data)
    }

    ok() {
        this.dialogRef.close(true)
    }
    cancel() {
        this.dialogRef.close(false)
    }
}
