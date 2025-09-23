import nodemailer from "nodemailer";
import db from "../../db/postgres.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.MAIL_FROM ?? "no-reply@ecoride.local";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString("fr-FR");
  } catch {
    return String(d);
  }
}

function renderReminderEmail(p) {
  const subject = `Rappel: votre covoiturage ${p.depart_ville} → ${p.arrivee_ville}`;
  const text = `Bonjour ${p.passager_pseudo},

Petit rappel: votre covoiturage ${p.depart_ville} → ${p.arrivee_ville}
avec ${p.chauffeur_pseudo} part le ${fmtDate(p.depart_ts)}.

À tout à l’heure !
L’équipe EcoRide`;

  const html = `
  <p>Bonjour <b>${p.passager_pseudo}</b>,</p>
  <p>Petit rappel: votre covoiturage <b>${p.depart_ville} → ${p.arrivee_ville}</b><br/>
  avec <b>${p.chauffeur_pseudo}</b> part le <b>${fmtDate(p.depart_ts)}</b>.</p>
  <p>À tout à l’heure !<br/>L’équipe EcoRide</p>`;

  return { subject, text, html };
}

function renderFeedbackEmail(p) {
  const subject = `Covoiturage terminé — donnez votre avis`;
  const text = `Bonjour ${p.passager_pseudo},

Le trajet ${p.depart_ville} → ${p.arrivee_ville} est marqué comme "terminé".
Pouvez-vous laisser un avis au chauffeur ${p.chauffeur_pseudo} ?

Ouvrez l’application et suivez la bannière "Donner mon avis".
Merci !
L’équipe EcoRide`;

  const html = `
  <p>Bonjour <b>${p.passager_pseudo}</b>,</p>
  <p>Le trajet <b>${p.depart_ville} → ${p.arrivee_ville}</b> est marqué comme « terminé ».</p>
  <p>Pouvez-vous laisser un avis au chauffeur <b>${p.chauffeur_pseudo}</b> ?</p>
  <p><a href="${process.env.APP_URL ?? "http://localhost:5173"}/avis">Donner mon avis</a></p>
  <p>Merci !<br/>L’équipe EcoRide</p>`;

  return { subject, text, html };
}

class MailerService {
  /**
   * Wysyła MAILE do POTWIERDZONYCH pasażerów tego kursu (status 'confirmé')
   * – prośba o wystawienie opinii (po "terminer").
   */
  async sendTripFinishedEmails(trajetId) {
    const rows = await db.any(
      `
      SELECT 
        u.email  AS passager_email,
        u.pseudo AS passager_pseudo,
        d.pseudo AS chauffeur_pseudo,
        tr.depart_ville, tr.arrivee_ville, tr.depart_ts
      FROM participations p
      JOIN users u   ON u.id_user = p.id_passager
      JOIN trajets tr ON tr.id_trajet = p.id_trajet
      JOIN users d   ON d.id_user = tr.id_chauffeur
      WHERE p.id_trajet = $1
        AND p.status = 'confirmé'
      `,
      [trajetId]
    );

    for (const r of rows) {
      const { subject, text, html } = renderFeedbackEmail(r);
      await transporter.sendMail({
        from: FROM,
        to: r.passager_email,
        subject,
        text,
        html,
      });
    }
    return rows.length;
  }
  async sendTripReminderEmails(trajetId) {
    const rows = await db.any(
      `
      SELECT 
        u.email  AS passager_email,
        u.pseudo AS passager_pseudo,
        d.pseudo AS chauffeur_pseudo,
        tr.depart_ville, tr.arrivee_ville, tr.depart_ts
      FROM participations p
      JOIN users u   ON u.id_user = p.id_passager
      JOIN trajets tr ON tr.id_trajet = p.id_trajet
      JOIN users d   ON d.id_user = tr.id_chauffeur
      WHERE p.id_trajet = $1
        AND p.status = 'confirmé'
      `,
      [trajetId]
    );

    for (const r of rows) {
      const { subject, text, html } = renderReminderEmail(r);
      await transporter.sendMail({
        from: FROM,
        to: r.passager_email,
        subject,
        text,
        html,
      });
    }
    return rows.length;
  }
}

export default new MailerService();
