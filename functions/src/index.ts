
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as webpush from "web-push";
import { defineSecret } from "firebase-functions/params";


export const ping = onCall((request) => {
    const name = typeof request.data?.name === "string" ? request.data.name : "world";

    if (!name.trim()) {
        throw new HttpsError("invalid-argument", "name must not be empty");
    }

    return {
        message: `pong, ${name}!`,
        at: new Date().toISOString(),
    };
});

import { initializeApp, getApps } from "firebase-admin/app";
import {
    getFirestore,
    FieldValue,
    Timestamp,
} from "firebase-admin/firestore";


import { createHash } from "crypto";

interface FeaturedArtist {
    name: string;
    instruments: string[];
}

interface ConcertArtistEntry {
    artistId: string;
    featured: boolean;
    sortOrder: number;
}

// import { createHash } from 'node:crypto';

if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();


interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

function subscriptionId(endpoint: string): string {
    return createHash("sha256")
        .update(endpoint)
        .digest("hex");
}

function validateSubscription(
    value: unknown
): PushSubscriptionData {
    if (
        !value ||
        typeof value !== "object"
    ) {
        throw new HttpsError(
            "invalid-argument",
            "Invalid subscription"
        );
    }

    const data = value as Partial<PushSubscriptionData>;

    if (
        typeof data.endpoint !== "string" ||
        data.endpoint.length > 2048 ||
        !data.endpoint.startsWith("https://") ||
        typeof data.keys?.p256dh !== "string" ||
        typeof data.keys?.auth !== "string" ||
        !data.keys.p256dh ||
        !data.keys.auth ||
        data.keys.p256dh.length > 256 ||
        data.keys.auth.length > 256
    ) {
        throw new HttpsError(
            "invalid-argument",
            "Invalid subscription data"
        );
    }

    return data as PushSubscriptionData;
}

export const savePushSubscription = onCall(
    {
        region: "europe-west1",
        invoker: "public",
        enforceAppCheck: false,
    },
    async (request) => {
        console.log("App Check verified:", !!request.app);
        const subscription =
            validateSubscription(request.data.subscription);

        const id = subscriptionId(
            subscription.endpoint
        );

        await db
            .collection("push-subscriptions")
            .doc(id)
            .set({
                ...subscription,
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });

        return { success: true };
    }
);

export const deletePushSubscription = onCall(
    {
        region: "europe-west1",
        invoker: "public",
        enforceAppCheck: false,
    },
    async (request) => {
        console.log("FUNCTION STARTED");

        const endpoint = request.data?.endpoint;

        if (
            typeof endpoint !== "string" ||
            endpoint.length > 2048 ||
            !endpoint.startsWith("https://")
        ) {
            throw new HttpsError(
                "invalid-argument",
                "Invalid endpoint"
            );
        }

        const id = subscriptionId(endpoint);

        console.log("STARTING FIRESTORE DELETE");

        await db
            .collection("push-subscriptions")
            .doc(id)
            .delete();

        console.log("FIRESTORE DELETE COMPLETED");

        return { success: true };
    }
);

const vapidPublicKey = "BIZuQcHOXz2WP3G5dJDaKmukM_VCq6MIb4sP2gr1JR7czHYxWoDX68_EtrWt2uXAB4GQzXLZrnlKDdawYT9UQa0";
const adminUid = "zB0AwDsLcAhjcTjAWRA4PQRXnA23";
const vapidPrivateKey = defineSecret("VAPID_PRIVATE_KEY");

export const sendTestPushNotification = onCall(
    {
        region: "europe-west1",
        invoker: "public",
        secrets: [vapidPrivateKey],
        enforceAppCheck: false,
    },
    async (request) => {
        if (request.auth?.uid !== adminUid) {
            throw new HttpsError(
                "permission-denied",
                "Administrator access required"
            );
        }

        const endpoint = request.data?.endpoint;

        if (typeof endpoint !== "string") {
            throw new HttpsError(
                "invalid-argument",
                "Invalid endpoint"
            );
        }

        const id = subscriptionId(endpoint);

        const document = await db
            .collection("push-subscriptions")
            .doc(id)
            .get();

        if (!document.exists) {
            throw new HttpsError(
                "not-found",
                "Subscription not found"
            );
        }

        const subscription = document.data();

        if (!subscription) {
            throw new HttpsError(
                "not-found",
                "Subscription data not found"
            );
        }

        webpush.setVapidDetails(
            "mailto:jackoboes@gmail.com",
            vapidPublicKey,
            vapidPrivateKey.value()
        );

        const payload = JSON.stringify({
            notification: {
                title: "Jazzbert",
                body: "Congratulations! Push notifications work!",
                icon: "/icons/icon-192x192.png",
            },
        });

        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
            payload
        );

        return { success: true };
    }
);

export const sendPushNotification = onCall(
    {
        region: "europe-west1",
        invoker: "public",
        enforceAppCheck: false,
        secrets: [vapidPrivateKey],
        timeoutSeconds: 120,
    },
    async (request) => {
        // Only the administrator can send notifications
        if (request.auth?.uid !== adminUid) {
            throw new HttpsError(
                "permission-denied",
                "Administrator access required"
            );
        }

        const title = request.data?.title;
        const body = request.data?.body;

        if (
            typeof title !== "string" ||
            typeof body !== "string" ||
            !title.trim() ||
            !body.trim() ||
            title.length > 100 ||
            body.length > 500
        ) {
            throw new HttpsError(
                "invalid-argument",
                "Invalid notification"
            );
        }

        webpush.setVapidDetails(
            "mailto:jackoboes@gmail.com",
            vapidPublicKey,
            vapidPrivateKey.value()
        );

        const payload = JSON.stringify({
            notification: {
                title: title.trim(),
                body: body.trim(),
                icon: "/icons/icon-192x192.png",
                data: {
                    onActionClick: {
                        default: {
                            operation: "openWindow",
                            url: "/",
                        },
                    },
                },
            },
        });

        const snapshot = await db
            .collection("push-subscriptions")
            .get();

        let sent = 0;
        let failed = 0;
        let expired = 0;

        // Small batches to avoid overwhelming the push services
        const batchSize = 20;

        for (let i = 0; i < snapshot.docs.length; i += batchSize) {
            const batch = snapshot.docs.slice(i, i + batchSize);

            await Promise.all(batch.map(async (doc) => {
                const subscription = doc.data();

                try {
                    await webpush.sendNotification(
                        {
                            endpoint: subscription.endpoint,
                            keys: subscription.keys,
                        },
                        payload
                    );

                    sent++;
                } catch (error: unknown) {
                    const statusCode =
                        (error as { statusCode?: number }).statusCode;

                    if (statusCode === 404 || statusCode === 410) {
                        expired++;

                        await doc.ref.delete();
                    } else {
                        failed++;
                        console.error(
                            "Push failed:",
                            doc.id,
                            error
                        );
                    }
                }
            }));
        }

        console.log({ sent, failed, expired });

        return {
            success: failed === 0,
            sent,
            failed,
            expired,
        };
    }
);


async function getFeaturedArtists(
    artistEntries: ConcertArtistEntry[]
): Promise<FeaturedArtist[]> {
    const featuredEntries = artistEntries
        .filter((entry: ConcertArtistEntry) => entry.featured)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const artists = await Promise.all(
        featuredEntries.map(async (entry: ConcertArtistEntry) => {
            const doc = await db
                .collection("jazzbert-artists")
                .doc(entry.artistId)
                .get();

            if (!doc.exists) return null;

            const artist = doc.data();

            if (!artist) return null;

            return {
                name: artist["name"] as string,
                instruments: artist["instruments"] as string[] ?? [],
            };
        })
    );

    return artists.filter(
        (artist): artist is FeaturedArtist => artist !== null
    );
}
// getFeaturedArtistsText = helper; not exported
function getFeaturedArtistsText(
    artists: FeaturedArtist[]
): string {
    if (!artists.length) {
        return "Live jazz";
    }

    return artists
        .map((artist: FeaturedArtist) => {
            const instruments = artist.instruments.join(", ");

            return instruments ?
                `${artist.name} (${instruments})` : artist.name;
        })
        .join(" & ");
}

export const sendConcertReminders = onSchedule(
    {
        schedule: "every 5 minutes",
        timeZone: "Europe/Amsterdam",
        region: "europe-west1",
        secrets: [vapidPrivateKey],
        timeoutSeconds: 300,
        retryCount: 0,
    },
    async () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // Concerts starting roughly 24 hours from now.
        // Allow recovery if a scheduled run was delayed.
        const start = Timestamp.fromMillis(
            now + oneDay - 10 * 60 * 1000
        );

        const end = Timestamp.fromMillis(
            now + oneDay
        );

        const concerts = await db
            .collection("jazzbert-concerts")
            .where("startAt", ">=", start)
            .where("startAt", "<=", end)
            .get();

        if (concerts.empty) {
            console.log("No concert reminders due");
            return;
        }

        webpush.setVapidDetails(
            "mailto:jackoboes@gmail.com",
            vapidPublicKey,
            vapidPrivateKey.value()
        );

        for (const doc of concerts.docs) {
            const concert = doc.data();

            // Adjust this to your actual publication status.
            if (concert.status !== "published") {
                continue;
            }

            const startAt = concert.startAt as Timestamp;

            // Unique reminder for concert + starting time.
            const reminderId =
                `${doc.id}_${startAt.toMillis()}`;

            const reminderRef = db
                .collection("concert-reminders")
                .doc(reminderId);

            try {
                // Atomic claim: only one invocation succeeds.
                await reminderRef.create({
                    concertId: doc.id,
                    startAt,
                    status: "sending",
                    createdAt: FieldValue.serverTimestamp(),
                });
            } catch (error: unknown) {
                const code = (error as { code?: number | string }).code;

                if (code === 6 || code === "already-exists") {
                    continue;
                }

                throw error;
            }

            try {
                const date = startAt.toDate();

                const time = new Intl.DateTimeFormat("nl-NL", {
                    timeZone: "Europe/Amsterdam",
                    hour: "2-digit",
                    minute: "2-digit",
                }).format(date);

                const featuredArtists = await getFeaturedArtists(
                    concert.artistEntries ?? []
                );

                const featuredArtistsText =
                    getFeaturedArtistsText(featuredArtists);

                const payload = JSON.stringify({
                    notification: {
                        title: "Parisius – Tomorrow!",
                        body:
                            `Tomorrow at ${time}: ${featuredArtistsText}. ` +
                            "Tap to view the concert!",
                        icon: "/icons/icon-192x192.png",
                        data: {
                            onActionClick: {
                                default: {
                                    operation: "openWindow",
                                    url: "/",
                                },
                            },
                        },
                    },
                });

                const subscriptions = await db
                    .collection("push-subscriptions")
                    .get();

                let sent = 0;
                let failed = 0;
                let expired = 0;

                const docs = subscriptions.docs;

                for (let i = 0; i < docs.length; i += 20) {
                    const batch = docs.slice(i, i + 20);

                    await Promise.all(batch.map(async (subDoc) => {
                        const subscription = subDoc.data();

                        try {
                            await webpush.sendNotification(
                                {
                                    endpoint: subscription.endpoint,
                                    keys: subscription.keys,
                                },
                                payload
                            );
                            sent++;
                        } catch (error: unknown) {
                            const statusCode =
                                (error as { statusCode?: number })
                                    .statusCode;

                            if (
                                statusCode === 404 ||
                                statusCode === 410
                            ) {
                                expired++;
                                await subDoc.ref.delete();
                            } else {
                                failed++;
                                console.error(
                                    "Reminder push failed",
                                    subDoc.id,
                                    error
                                );
                            }
                        }
                    }));
                }

                await reminderRef.update({
                    status: failed === 0 ? "sent" : "partial",
                    sent,
                    failed,
                    expired,
                    completedAt: FieldValue.serverTimestamp(),
                });

                console.log(
                    `Concert ${doc.id}: ${sent} reminders accepted`
                );
            } catch (error) {
                console.error(
                    `Concert reminder failed: ${doc.id}`,
                    error
                );

                await reminderRef.update({
                    status: "error",
                    error: String(error),
                    completedAt: FieldValue.serverTimestamp(),
                });
            }
        }
    }
);


/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.


// import {setGlobalOptions} from "firebase-functions";
// import * as logger from "firebase-functions/logger";
// setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// import {onRequest} from "firebase-functions/https";


