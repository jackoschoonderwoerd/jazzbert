
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PushNotificationService } from "../../../services/push-notification.service";
import { MatIconModule } from "@angular/material/icon";




@Component({
    selector: 'app-send-notification',
    imports: [FormsModule, MatIconModule],
    templateUrl: './send-notification.html',
    styleUrl: './send-notification.scss',
})
export class SendNotification {
    pushService = inject(PushNotificationService);

    title = "Jazzbert";
    message = "";

    sending = signal(false);
    result = signal("");

    async send() {
        if (!this.title.trim() || !this.message.trim()) return;
        if (this.sending()) return;

        this.sending.set(true);
        this.result.set("");

        try {
            const response =
                await this.pushService.sendNotification(
                    this.title,
                    this.message
                );

            this.result.set(
                `Sent: ${response.sent}, ` +
                `Failed: ${response.failed}, ` +
                `Expired: ${response.expired}`
            );

            if (response.success) {
                this.message = "";
            }

        } catch (error) {
            console.error(error);
            this.result.set("Notification could not be sent");
        } finally {
            this.sending.set(false);
        }
    }

}
