import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {

    private swPush = inject(SwPush);

    private readonly vapidPublicKey = 'BIZuQcHOXz2WP3G5dJDaKmukM_VCq6MIb4sP2gr1JR7czHYxWoDX68_EtrWt2uXAB4GQzXLZrnlKDdawYT9UQa0';

    isSupported = this.swPush.isEnabled;
    readonly isSubscribed = signal(false);

    readonly isLoading = signal(false)

    constructor() {
        this.swPush.subscription
            .pipe(takeUntilDestroyed())
            .subscribe(subscription => {
                this.isSubscribed.set(!!subscription);
            });
    }

    async subscribe() {
        if (!this.isSupported) return;

        this.isLoading.set(true)
        try {
            const subscription =
                await this.swPush.requestSubscription({
                    serverPublicKey: this.vapidPublicKey
                });

            await this.saveSubscriptionFunction({
                subscription: subscription.toJSON()
            });

            console.log('Subscription saved to Firestore');

        } catch (error) {
            console.error('Subscription failed:', error);
        } finally {
            this.isLoading.set(false)

        }
    }

    async unsubscribe() {

        if (!this.isSupported || this.isLoading()) return;
        this.isLoading.set(true)
        try {
            const subscription = await firstValueFrom(
                this.swPush.subscription
            );

            if (!subscription) return;

            await this.deleteSubscriptionFunction({
                endpoint: subscription.endpoint
            });

            await this.swPush.unsubscribe();

            console.log('Unsubscribed successfully');

        } catch (error) {
            console.error('Unsubscribe failed:', error);
        } finally {
            this.isLoading.set(false)

        }
    }



    private functions = getFunctions(
        getApp(),
        'europe-west1'
    );

    private saveSubscriptionFunction = httpsCallable(
        this.functions,
        'savePushSubscription'
    );

    private deleteSubscriptionFunction = httpsCallable(
        this.functions,
        'deletePushSubscription'
    );

    async sendTestNotification() {
        try {
            const subscription = await firstValueFrom(
                this.swPush.subscription
            );

            if (!subscription) {
                console.error("No push subscription found");
                return;
            }

            const sendTest = httpsCallable(
                this.functions,
                "sendTestPushNotification"
            );

            const result = await sendTest({
                endpoint: subscription.endpoint
            });

            console.log("Test notification sent:", result.data);

        } catch (error) {
            console.error("Test push failed:", error);
        }
    }

    async sendNotification(title: string, body: string) {
        try {
            const send = httpsCallable<
                { title: string; body: string },
                {
                    success: boolean;
                    sent: number;
                    failed: number;
                    expired: number;
                }
            >(
                this.functions,
                "sendPushNotification"
            );

            const result = await send({ title, body });

            return result.data;

        } catch (error) {
            console.error("Sending notification failed:", error);
            throw error;
        }
    }
}
