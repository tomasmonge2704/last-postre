import webpush from "web-push";
import { pool } from "@/lib/db";

webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function saveSubscription(guestId: string, sub: PushSub) {
  await pool.query(
    `insert into push_subscriptions (endpoint, guest_id, p256dh, auth) values ($1, $2, $3, $4)
     on conflict (endpoint) do update set guest_id = excluded.guest_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    [sub.endpoint, guestId, sub.keys.p256dh, sub.keys.auth],
  );
}

export async function removeSubscription(endpoint: string) {
  await pool.query(`delete from push_subscriptions where endpoint = $1`, [endpoint]);
}

// Manda a todos los dispositivos del invitado; las suscripciones muertas se borran.
export async function sendPush(guestId: string, payload: { title: string; body: string; url: string; icon?: string }) {
  const { rows } = await pool.query<{ endpoint: string; p256dh: string; auth: string }>(
    `select endpoint, p256dh, auth from push_subscriptions where guest_id = $1`,
    [guestId],
  );
  await Promise.all(
    rows.map((r) =>
      webpush
        .sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(payload))
        .catch((err: { statusCode?: number }) => {
          if (err.statusCode === 404 || err.statusCode === 410) return removeSubscription(r.endpoint);
          console.error("push falló", err);
        }),
    ),
  );
}
