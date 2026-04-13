import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const alertMessages = {
  trip_alert: {
    subject: (name) => `🛫 ${name}'s birthday is in 21 days — start planning`,
    body: (name) => `What's up motherfucker.<br><br>
      Friend, lover, ex-lover, hater, brother, mother — whatever you are to ${name} — their birthday is in <strong>21 days</strong> and you should probably start giving a damn.<br><br>
      You wanna do something special? Book a trip. Look into flights. Plan a dinner. A little thought now makes a world of difference later.<br><br>
      Show up for your people. That's why we're here.<br><br>
      — Dunbar's Band 🔥`
  },
  gift_alert: {
    subject: (name) => `🎁 ${name}'s birthday is in 5 days — get something`,
    body: (name) => `Hey, what's up pimp!!!<br><br>
      ${name}'s birthday is in <strong>5 days</strong>. Time to order something.<br><br>
      Could be sex toys. Could be a TV. Could be a car, a cat, or a hat. Doesn't matter. What matters is you thought of them.<br><br>
      Get on Amazon. Spend $20. Ship it. Done.<br><br>
      Show up for your friends. That's the whole game.<br><br>
      — Dunbar's Band 🔥`
  },
  message_alert: {
    subject: (name) => `🎂 IT'S ${name.toUpperCase()}'S BIRTHDAY TODAY`,
    body: (name) => `Okay. It's ${name}'s birthday.<br><br>
      Send a message. Venmo them for a beer. Check where they are and actually show up.<br><br>
      No excuses. No "I'll do it later." Later is tomorrow and tomorrow it's not their birthday anymore.<br><br>
      You've got their number. You've got Venmo. You've got two thumbs.<br><br>
      <strong>Go. Now. Do it.</strong><br><br>
      — Dunbar's Band 🔥`
  },
};

export default async function handler(req, res) {
  const today = new Date().toISOString().split('T')[0];

  const { data: notifications, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('send_date', today)
  .eq('sent', false);

  if (error) return res.status(500).json({ error: error.message });
  if (!notifications.length) return res.status(200).json({ message: 'No notifications today' });

  for (const notif of notifications) {
   const { data: friendData } = await supabase
  .from('Users')
  .select('*')
  .eq('id', notif.friend_id)
  .single();
const friend = friendData;
    const template = alertMessages[notif.type];
    if (!template || !friend) continue;

    await resend.emails.send({
      from: 'Dunbars Band <onboarding@resend.dev>',
      to: process.env.NOTIFY_EMAIL,
      subject: template.subject(friend.name),
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#0d0a04;color:#e8c87a;">
          <h2 style="font-weight:400;margin:0 0 16px;">${template.subject}</h2>
          <p style="color:rgba(200,160,80,0.8);line-height:1.7;">${template.body(friend.name)}</p>
          <hr style="border:1px solid rgba(200,160,80,0.2);margin:24px 0;" />
          <p style="font-size:12px;color:rgba(200,160,80,0.4);">Dunbar's Band — 150 is the limit. make them count.</p>
        </div>
      `,
    });

    await supabase
      .from('notifications')
      .update({ sent: true })
      .eq('id', notif.id);
  }

  res.status(200).json({ sent: notifications.length });
}