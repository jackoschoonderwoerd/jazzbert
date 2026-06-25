import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-concert-info-dialog',
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './concert-info-dialog.html',
    styleUrl: './concert-info-dialog.scss',
})
export class ConcertInfoDialog implements OnInit {

    mapUrl?: SafeResourceUrl;
    private sanitizer = inject(DomSanitizer)
    data = inject(MAT_DIALOG_DATA) as { iframe: string };

    // constructor(public dialogRef: MatDialogRef<ConcertInfoDialog>) {
    //     const src = this.data.link
    //     this.src = this.sanitizer.bypassSecurityTrustResourceUrl(src)
    // }

    ngOnInit(): void {
        const src = this.extractSrc(this.data.iframe);
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(src);
    }

    private extractSrc(iframe: string): string {
        const match = iframe.match(/src="([^"]+)"/);
        return match ? match[1] : '';
    }

}
