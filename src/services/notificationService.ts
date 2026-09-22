import {
  Booking,
  EmailNotification,
  WhatsAppNotification,
  AppNotificationItem,
  NotificationType,
} from '../types';
import { StorageService } from './storageService';

const STORAGE_KEYS = {
  EMAIL_LOGS: 'cloudheaven_email_logs_v1',
  WHATSAPP_LOGS: 'cloudheaven_whatsapp_logs_v1',
  APP_NOTIFICATIONS: 'cloudheaven_app_notifications_v1',
};

// Safe storage helpers
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (e) {
    console.error(`Failed to save key ${key} to localStorage`, e);
  }
}

// Subscription mechanism for live notifications
type Listener = () => void;
const subscribers: Set<Listener> = new Set();

export function subscribeToNotifications(listener: Listener): () => void {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notifySubscribers() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Notification subscriber callback error', e);
    }
  });
}

// Clean phone numbers for wa.me format (e.g. +91 94471 23456 -> 919447123456)
export function sanitizePhoneForWhatsApp(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default to India country code
  }
  return digits;
}

export const NotificationService = {
  // -------------------------------------------------------------
  // 1. DATA ACCESS METHODS
  // -------------------------------------------------------------
  getEmailLogs: (): EmailNotification[] => {
    return safeGet<EmailNotification[]>(STORAGE_KEYS.EMAIL_LOGS, []);
  },

  getEmailLogsByBookingId: (bookingId: string): EmailNotification[] => {
    const logs = NotificationService.getEmailLogs();
    return logs.filter((l) => l.bookingId === bookingId);
  },

  getEmailLogsByRecipient: (email: string): EmailNotification[] => {
    const clean = email.toLowerCase().trim();
    return NotificationService.getEmailLogs().filter(
      (l) => l.recipientEmail.toLowerCase().trim() === clean
    );
  },

  getWhatsAppLogs: (): WhatsAppNotification[] => {
    return safeGet<WhatsAppNotification[]>(STORAGE_KEYS.WHATSAPP_LOGS, []);
  },

  getWhatsAppLogsByBookingId: (bookingId: string): WhatsAppNotification[] => {
    return NotificationService.getWhatsAppLogs().filter((w) => w.bookingId === bookingId);
  },

  getWhatsAppLogsByPhone: (phone: string): WhatsAppNotification[] => {
    const cleanPhone = sanitizePhoneForWhatsApp(phone);
    return NotificationService.getWhatsAppLogs().filter((w) =>
      sanitizePhoneForWhatsApp(w.recipientPhone).includes(cleanPhone)
    );
  },

  getAppNotifications: (): AppNotificationItem[] => {
    return safeGet<AppNotificationItem[]>(STORAGE_KEYS.APP_NOTIFICATIONS, []);
  },

  addAppNotification: (notif: Omit<AppNotificationItem, 'id' | 'timestamp'>): AppNotificationItem => {
    const list = NotificationService.getAppNotifications();
    const item: AppNotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    safeSet(STORAGE_KEYS.APP_NOTIFICATIONS, list);
    return item;
  },

  // -------------------------------------------------------------
  // 2. WHATSAPP LINK GENERATOR
  // -------------------------------------------------------------
  createWhatsAppLink: (phone: string, text: string): string => {
    const cleanDigits = sanitizePhoneForWhatsApp(phone);
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanDigits}?text=${encodedText}`;
  },

  // -------------------------------------------------------------
  // 3. WHATSAPP MESSAGE FORMATTERS
  // -------------------------------------------------------------
  formatCustomerBookingWhatsApp: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();
    const villa = StorageService.getVillaDetails();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa (Up to 12 Pax)' : '2 BHK Luxury Villa (Up to 9 Pax)');

    const paymentStatusBadge =
      booking.paymentStatus === 'partially_paid'
        ? `⚠️ *PART PAYMENT:* Advance Paid ₹${(booking.advancePaid || 0).toLocaleString()} (Remaining Balance: *₹${(booking.balanceAmount || 0).toLocaleString()}* due at check-in)`
        : `✅ *PAYMENT STATUS:* Full Payment of ₹${booking.finalAmount.toLocaleString()} Received`;

    const paymentMethodLine = booking.paymentMode
      ? `\n💳 *Payment Mode:* ${booking.paymentMode.toUpperCase()}${booking.upiTransactionId ? ` (Ref / UTR: ${booking.upiTransactionId})` : ''}`
      : '';

    return `🌿 *CLOUD HEAVEN VAGAMON - BOOKING CONFIRMATION* 🌿
━━━━━━━━━━━━━━━━━━━━━
Dear *${booking.userName}*,
Thank you for choosing Cloud Heaven. Your private pool villa stay is confirmed!

🆔 *Booking Reference:* ${booking.id}
🏡 *Villa Type:* ${villaLabel}
📅 *Check-In:* ${booking.checkInDate} (Strictly from *${booking.checkInTime}*)
📅 *Check-Out:* ${booking.checkOutDate} (Until *${booking.checkOutTime}*)
🌙 *Duration:* ${booking.totalNights} ${booking.totalNights === 1 ? 'Night' : 'Nights'}
👥 *Party Size:* ${booking.guests.adults} Adults${booking.guests.children > 0 ? `, ${booking.guests.children} Children` : ''}
💰 *Total Tariff:* ₹${booking.finalAmount.toLocaleString()}
${paymentStatusBadge}${paymentMethodLine}
${booking.addons.length > 0 ? `✨ *Addons:* ${booking.addons.map((a) => a.name).join(', ')}\n` : ''}${booking.specialRequests ? `📝 *Special Request:* ${booking.specialRequests}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
🏊 *Villa Amenities Included:*
• Private Heated Infinity Pool overlooking misty valley
• Complimentary Breakfast & Kerala Spiced Welcome Tea
• High-speed Wi-Fi, Campfire & BBQ facility on request

📍 *Resort Location:*
${villa.name}, ${contact.address}, ${contact.landmark}, ${contact.city}, Kerala.
Google Maps: ${contact.googleMapsUrl || 'https://maps.google.com/?q=Vagamon+Pine+Forest+Kerala'}

📞 *Direct Support Hotlines:*
• Caretaker (Check-in & Gate Clearance): *${contact.caretakerPhone || '+91 73589 56101'}*
• Resort Manager / Front Desk: *${contact.phone || '+91 89250 14660'}*

We look forward to hosting you above the clouds in misty Vagamon! 🌄`;
  },

  formatCaretakerBookingAlertWhatsApp: (booking: Booking): string => {
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Villa' : '2 BHK Villa');

    const paymentDetail =
      booking.paymentStatus === 'partially_paid'
        ? `₹${(booking.advancePaid || 0).toLocaleString()} Paid Advance (⚠️ COLLECT BALANCE ₹${(booking.balanceAmount || 0).toLocaleString()} AT CHECK-IN)`
        : `₹${booking.finalAmount.toLocaleString()} (Paid in Full)`;

    const sourceTag = booking.bookingSource === 'offline_admin' ? 'Admin Offline Booking' : 'Website Online Booking';

    return `🔔 *NEW GUEST RESERVATION ALERT - CLOUD HEAVEN*
━━━━━━━━━━━━━━━━━━━━━
Attention Caretaker Babu / Team,

A new reservation has been confirmed (${sourceTag}):
• *Booking ID:* ${booking.id}
• *Lead Guest:* ${booking.userName}
• *Guest Mobile:* ${booking.userPhone}
• *Accommodation:* ${villaLabel}
• *Check-in Date:* ${booking.checkInDate} at 2:00 PM
• *Check-out Date:* ${booking.checkOutDate} at 11:00 AM
• *Pax:* ${booking.guests.adults} Adults, ${booking.guests.children} Children
• *Add-ons:* ${booking.addons.map((a) => a.name).join(', ') || 'None'}
• *Payment Status:* ${paymentDetail}
${booking.balanceAmount && booking.balanceAmount > 0 ? `⚠️ *REMINDER:* Collect balance ₹${booking.balanceAmount.toLocaleString()} upon guest arrival.` : ''}

👉 *Action Required:* Ensure infinity pool is sanitized, fresh linen ready, and prepare welcoming tea for 2:00 PM check-in.`;
  },

  formatCheckInReminderWhatsApp: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Villa' : '2 BHK Villa');

    return `🌄 *CHECK-IN REMINDER: YOUR STAY AT CLOUD HEAVEN STARTS SOON!*
━━━━━━━━━━━━━━━━━━━━━
Dear *${booking.userName}*,

We are getting everything ready for your misty getaway at *Cloud Heaven, Vagamon*!

🆔 *Reservation Ref:* ${booking.id} (${villaLabel})
📅 *Check-In Date:* ${booking.checkInDate}
⏰ *Check-In Time:* *${booking.checkInTime}* (2:00 PM)
📅 *Check-Out Date:* ${booking.checkOutDate} (*${booking.checkOutTime}*)

🏊 *Pool & Villa Readiness:*
Our team is currently preparing your private infinity pool so it is fresh and clean for your 2:00 PM arrival.

📍 *Route & Directions:*
${contact.address}, ${contact.landmark}, Vagamon.
Follow the scenic route via Kurisumala Ashram Road.
🗺️ Google Maps: ${contact.googleMapsUrl || 'https://maps.google.com/?q=Vagamon+Pine+Forest+Kerala'}

📞 *Caretaker Contact:*
Please call or WhatsApp Caretaker Babu at *${contact.caretakerPhone || '+91 73589 56101'}* when you are 30 minutes away for gate clearance and warm welcome tea!

Have a safe and scenic drive up the hills! 🚗💨`;
  },

  formatCheckOutReminderWhatsApp: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();

    return `🌤️ *CHECK-OUT REMINDER - CLOUD HEAVEN, VAGAMON*
━━━━━━━━━━━━━━━━━━━━━
Dear *${booking.userName}*,

We hope you had a magical and relaxing stay amidst the clouds and private infinity pool!

🆔 *Reservation Ref:* ${booking.id}
⏰ *Check-Out Time:* Today, ${booking.checkOutDate} strictly by *${booking.checkOutTime}* (11:00 AM)

🔑 *Check-Out Procedures:*
1. Please double check for personal belongings, chargers, and valuables.
2. Hand over the villa keys to Caretaker Babu (*${contact.caretakerPhone || '+91 73589 56101'}*).
3. If you require cab assistance or luggage loading, our staff is ready to help.

⭐ *Earn +100 Highland Club Loyalty Points:*
Log in to your customer portal to submit your verified stay review and claim +100 bonus loyalty points for your next trip!

Thank you for staying at Cloud Heaven. Safe travels back home! 🌿`;
  },

  // -------------------------------------------------------------
  // 4. HTML EMAIL TEMPLATES
  // -------------------------------------------------------------
  generateCustomerConfirmationHtml: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();
    const villa = StorageService.getVillaDetails();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa (Up to 12 Pax)' : '2 BHK Luxury Villa (Up to 9 Pax)');

    const formattedCheckIn = new Date(booking.checkInDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedCheckOut = new Date(booking.checkOutDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const waLink = NotificationService.createWhatsAppLink(
      contact.whatsapp || contact.phone || '918925014660',
      `Hello, I have confirmed booking #${booking.id} at Cloud Heaven Vagamon.`
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloud Heaven Booking Confirmation</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f5; margin: 0; padding: 24px 12px; color: #1c241f; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8e5; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #064e3b; color: #ffffff; padding: 36px 28px 28px; text-align: center; }
    .badge { display: inline-block; background: #047857; color: #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
    .title { font-family: Georgia, serif; font-size: 28px; margin: 0 0 6px; font-weight: bold; color: #ffffff; }
    .subtitle { font-size: 13px; color: #d1fae5; margin: 0; }
    .content { padding: 28px; }
    .booking-ref { background: #ecfdf5; border: 1px dashed #059669; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .ref-label { font-size: 11px; color: #065f46; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; }
    .ref-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #064e3b; }
    .schedule-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .timing-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
    .timing-tag { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
    .timing-date { font-size: 14px; font-weight: bold; color: #111827; }
    .timing-clock { font-size: 13px; font-weight: bold; color: #047857; margin-top: 2px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .details-table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .details-table td.label { color: #6b7280; width: 45%; }
    .details-table td.value { color: #111827; font-weight: 600; text-align: right; }
    .total-row td { border-bottom: none; padding-top: 14px; font-size: 16px; font-weight: bold; color: #064e3b; }
    .location-box { background: #f0fdf4; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #bbf7d0; }
    .location-title { font-weight: bold; font-size: 13px; color: #065f46; margin-bottom: 4px; }
    .location-text { font-size: 12px; color: #374151; line-height: 1.5; margin: 0; }
    .whatsapp-cta { display: block; text-align: center; background: #25d366; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: bold; font-size: 13px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 28px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Official Reservation Voucher</div>
      <h1 class="title">Cloud Heaven, Vagamon</h1>
      <p class="subtitle">Exclusive Private Villa with Panoramic Infinity Pool</p>
    </div>

    <div class="content">
      <div class="booking-ref">
        <div>
          <div class="ref-label">Reservation Voucher ID</div>
          <div class="ref-code">${booking.id}</div>
        </div>
        <div style="text-align: right;">
          <div class="ref-label">Status</div>
          <div style="color: #047857; font-weight: bold; font-size: 14px;">CONFIRMED &bull; ACTIVE</div>
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
        Dear <strong>${booking.userName}</strong>,<br>
        Thank you for choosing <strong>Cloud Heaven</strong> in Vagamon. Your private sanctuary atop the clouds is booked exclusively for you and your party.
      </p>

      <div class="schedule-box">
        <div class="timing-card">
          <div class="timing-tag">Check-In Schedule</div>
          <div class="timing-date">${formattedCheckIn}</div>
          <div class="timing-clock">From ${booking.checkInTime} (Strict)</div>
        </div>
        <div class="timing-card">
          <div class="timing-tag">Check-Out Schedule</div>
          <div class="timing-date">${formattedCheckOut}</div>
          <div class="timing-clock">Until ${booking.checkOutTime} (Strict)</div>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">
        Reservation &amp; Guest Breakdown
      </h3>

      <table class="details-table">
        <tr>
          <td class="label">Primary Guest</td>
          <td class="value">${booking.userName}</td>
        </tr>
        <tr>
          <td class="label">Guest Contact</td>
          <td class="value">${booking.userEmail} &bull; ${booking.userPhone}</td>
        </tr>
        <tr>
          <td class="label">Accommodation</td>
          <td class="value">${villaLabel}</td>
        </tr>
        <tr>
          <td class="label">Party Size</td>
          <td class="value">${booking.guests.adults} Adults, ${booking.guests.children} Children</td>
        </tr>
        <tr>
          <td class="label">Stay Duration</td>
          <td class="value">${booking.totalNights} ${booking.totalNights === 1 ? 'Night' : 'Nights'}</td>
        </tr>
        ${
          booking.addons.length > 0
            ? `<tr>
                <td class="label">Selected Experiences</td>
                <td class="value">${booking.addons.map((a) => a.name).join(', ')}</td>
              </tr>`
            : ''
        }
        ${
          booking.specialRequests
            ? `<tr>
                <td class="label">Special Preferences</td>
                <td class="value">${booking.specialRequests}</td>
              </tr>`
            : ''
        }
        <tr>
          <td class="label">Base Tariff + Experiences</td>
          <td class="value">₹${booking.totalAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Resort Tax &amp; GST (${villa.taxRatePercent}%)</td>
          <td class="value">₹${booking.taxAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Total Reservation Tariff</td>
          <td class="value" style="font-weight: bold;">₹${booking.finalAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td class="label">Advance Paid (${booking.paymentMode ? booking.paymentMode.toUpperCase() : 'ONLINE'})</td>
          <td class="value" style="color: #065f46; font-weight: bold;">₹${(booking.advancePaid || booking.finalAmount).toLocaleString()}</td>
        </tr>
        ${
          booking.balanceAmount && booking.balanceAmount > 0
            ? `<tr style="background: #fef3c7;">
                <td class="label" style="color: #92400e; font-weight: bold;">⚠️ Balance Due at Check-In</td>
                <td class="value" style="color: #b45309; font-weight: bold; font-size: 15px;">₹${booking.balanceAmount.toLocaleString()}</td>
              </tr>`
            : `<tr class="total-row">
                <td>Payment Status</td>
                <td class="value" style="color: #064e3b; font-size: 14px; font-weight: bold;">PAID IN FULL</td>
              </tr>`
        }
      </table>

      <a href="${waLink}" target="_blank" class="whatsapp-cta">
        💬 Connect with Caretaker on WhatsApp
      </a>

      <div class="location-box">
        <div class="location-title">Resort Address &amp; Caretaker Support</div>
        <p class="location-text">
          <strong>${villa.name}</strong><br>
          ${contact.address}, ${contact.landmark}<br>
          ${contact.city}, ${contact.state} - ${contact.pincode}<br>
          <strong>Caretaker Hotline:</strong> ${contact.caretakerPhone || '+91 73589 56101'} | <strong>Booking Desk:</strong> ${contact.phone}
        </p>
      </div>

      <div style="background: #fafaf9; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #57534e; line-height: 1.5;">
        <strong style="color: #292524; display: block; margin-bottom: 4px;">Important Reminders:</strong>
        &bull; <strong>Check-In at 2:00 PM:</strong> Ensures the infinity pool is freshly filtered and ready for your swim.<br>
        &bull; <strong>Check-Out at 11:00 AM:</strong> Enables our staff to sanitize the villa for incoming guests.<br>
        &bull; We will send you an automated check-in reminder on the morning of your arrival!
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px;">Cloud Heaven Resort &bull; Vagamon, Idukki District, Kerala, India</p>
      <p style="margin: 0;">For assistance, email ${contact.email} or call ${contact.phone}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  generateAdminAlertHtml: (booking: Booking): string => {
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Villa' : '2 BHK Villa');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 20px; color: #111827; }
    .box { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; }
    .tag { display: inline-block; padding: 4px 10px; background: #047857; color: #fff; border-radius: 6px; font-size: 11px; font-weight: bold; }
    h2 { font-size: 20px; margin: 12px 0; color: #064e3b; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .info-row span.label { color: #6b7280; }
    .info-row span.val { font-weight: 600; color: #111827; }
    .alert-banner { background: #ecfdf5; border-left: 4px solid #059669; padding: 12px; margin: 16px 0; font-size: 13px; color: #065f46; }
  </style>
</head>
<body>
  <div class="box">
    <div class="tag">NEW BOOKING ALERT</div>
    <h2>New Reservation Received: #${booking.id}</h2>
    
    <div class="alert-banner">
      <strong>${booking.userName}</strong> has confirmed a <strong>${booking.totalNights}-night stay</strong> (${villaLabel}) at Cloud Heaven.
    </div>

    <div class="info-row">
      <span class="label">Check-In:</span>
      <span class="val">${booking.checkInDate} at ${booking.checkInTime}</span>
    </div>
    <div class="info-row">
      <span class="label">Check-Out:</span>
      <span class="val">${booking.checkOutDate} at ${booking.checkOutTime}</span>
    </div>
    <div class="info-row">
      <span class="label">Guest Name:</span>
      <span class="val">${booking.userName}</span>
    </div>
    <div class="info-row">
      <span class="label">Email &amp; Phone:</span>
      <span class="val">${booking.userEmail} | ${booking.userPhone}</span>
    </div>
    <div class="info-row">
      <span class="label">Accommodation:</span>
      <span class="val">${villaLabel}</span>
    </div>
    <div class="info-row">
      <span class="label">Occupancy:</span>
      <span class="val">${booking.guests.adults} Adults, ${booking.guests.children} Children</span>
    </div>
    <div class="info-row">
      <span class="label">Addons:</span>
      <span class="val">${booking.addons.map((a) => a.name).join(', ') || 'None'}</span>
    </div>
    <div class="info-row">
      <span class="label">Special Requests:</span>
      <span class="val">${booking.specialRequests || 'None provided'}</span>
    </div>
    <div class="info-row" style="border-bottom: 2px solid #064e3b; padding-top: 12px;">
      <span class="label" style="font-size: 15px; font-weight: bold; color: #064e3b;">Total Revenue:</span>
      <span class="val" style="font-size: 16px; color: #064e3b;">₹${booking.finalAmount.toLocaleString()}</span>
    </div>

    <p style="font-size: 11px; color: #9ca3af; margin-top: 20px; text-align: center;">
      Automated Notification Engine &bull; Cloud Heaven Admin System
    </p>
  </div>
</body>
</html>
    `.trim();
  },

  generateCheckInReminderHtml: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();
    const villa = StorageService.getVillaDetails();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Villa' : '2 BHK Villa');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, Roboto, sans-serif; background-color: #f4f6f5; margin: 0; padding: 24px 12px; color: #1c241f; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8e5; }
    .header { background: #064e3b; color: #ffffff; padding: 32px 24px; text-align: center; }
    .badge { display: inline-block; background: #047857; color: #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
    .content { padding: 28px; }
    .card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; }
    .btn { display: inline-block; background: #064e3b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Check-In Arrival Reminder</div>
      <h1 style="font-size: 24px; margin: 0; color: #fff;">Your Cloud Heaven Stay Starts Soon!</h1>
      <p style="font-size: 13px; color: #d1fae5; margin: 6px 0 0;">Check-in begins at 2:00 PM on ${booking.checkInDate}</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Dear <strong>${booking.userName}</strong>,<br>
        We are thrilled to welcome you to <strong>Cloud Heaven</strong> in Vagamon. Our staff is preparing your private heated infinity pool and cozy villa suites for your arrival.
      </p>

      <div class="card">
        <h3 style="margin: 0 0 8px; color: #065f46; font-size: 15px;">Check-In Schedule &amp; Details</h3>
        <p style="margin: 0; font-size: 13px; color: #111827; line-height: 1.6;">
          • <strong>Booking Reference:</strong> ${booking.id}<br>
          • <strong>Accommodation:</strong> ${villaLabel}<br>
          • <strong>Check-In Time:</strong> From <strong>${booking.checkInTime}</strong> (2:00 PM)<br>
          • <strong>Party Size:</strong> ${booking.guests.adults} Adults, ${booking.guests.children} Children
        </p>
      </div>

      <div style="background: #fafaf9; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #57534e; margin-bottom: 20px;">
        <strong>Directions &amp; Caretaker Assistance:</strong><br>
        • Address: ${contact.address}, ${contact.landmark}, Vagamon.<br>
        • Caretaker Hotline: <strong>${contact.caretakerPhone || '+91 73589 56101'}</strong><br>
        • Please give our caretaker a quick call when you are near Vagamon Pine Forest for gate opening and fresh tea service.
      </div>

      <div style="text-align: center;">
        <a href="${contact.googleMapsUrl || 'https://maps.google.com/?q=Vagamon+Pine+Forest'}" class="btn">View Google Maps Route</a>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  generateCheckOutReminderHtml: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, Roboto, sans-serif; background-color: #f4f6f5; margin: 0; padding: 24px 12px; color: #1c241f; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8e5; }
    .header { background: #064e3b; color: #ffffff; padding: 32px 24px; text-align: center; }
    .badge { display: inline-block; background: #047857; color: #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px; }
    .content { padding: 28px; }
    .card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Check-Out Procedure</div>
      <h1 style="font-size: 24px; margin: 0; color: #fff;">Check-Out Reminder - 11:00 AM</h1>
      <p style="font-size: 13px; color: #d1fae5; margin: 6px 0 0;">Today, ${booking.checkOutDate}</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        Dear <strong>${booking.userName}</strong>,<br>
        We hope you had a serene and memorable stay with the private infinity pool and misty views at Cloud Heaven.
      </p>

      <div class="card">
        <h3 style="margin: 0 0 8px; color: #92400e; font-size: 15px;">Check-Out Checklist</h3>
        <p style="margin: 0; font-size: 13px; color: #111827; line-height: 1.6;">
          • <strong>Check-Out Deadline:</strong> <strong>${booking.checkOutTime}</strong> (11:00 AM)<br>
          • <strong>Key Handover:</strong> Caretaker Babu (${contact.caretakerPhone || '+91 73589 56101'})<br>
          • <strong>Personal Belongings:</strong> Please inspect wardrobes and pool area before departing.
        </p>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
        <h4 style="margin: 0 0 6px; color: #065f46; font-size: 15px;">Claim +100 Highland Club Loyalty Points</h4>
        <p style="margin: 0; font-size: 12px; color: #047857;">
          Visit your customer portal to submit a verified stay review and earn 100 loyalty points towards your next stay!
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  // -------------------------------------------------------------
  // 5. AUTOMATED DISPATCH TRIGGER FOR NEW BOOKING
  // -------------------------------------------------------------
  sendBookingConfirmation: (
    booking: Booking
  ): {
    customerEmail: EmailNotification;
    adminEmail: EmailNotification;
    customerWhatsApp: WhatsAppNotification;
    caretakerWhatsApp: WhatsAppNotification;
  } => {
    const emailLogs = NotificationService.getEmailLogs();
    const waLogs = NotificationService.getWhatsAppLogs();
    const appNotifs = NotificationService.getAppNotifications();
    const now = new Date().toISOString();
    const contact = StorageService.getContactDetails();

    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa');

    // 1. Customer Email
    const customerEmail: EmailNotification = {
      id: `email_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'customer_confirmation',
      bookingId: booking.id,
      recipientEmail: booking.userEmail,
      recipientName: booking.userName,
      subject: `Confirmed: Your Private Pool Villa Stay at Cloud Heaven, Vagamon (Ref #${booking.id})`,
      sentAt: now,
      status: 'delivered',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        guestPhone: booking.userPhone,
        finalAmount: booking.finalAmount,
        adults: booking.guests.adults,
        children: booking.guests.children,
        villaTypeLabel: villaLabel,
      },
      bodyText: `Dear ${booking.userName},\n\nYour reservation at Cloud Heaven, Vagamon is confirmed.\n\nBooking ID: ${booking.id}\nCheck-in: ${booking.checkInDate} from ${booking.checkInTime}\nCheck-out: ${booking.checkOutDate} until ${booking.checkOutTime}\nAccommodation: ${villaLabel}\nTotal Paid: ₹${booking.finalAmount.toLocaleString()}\n\nContact: ${contact.phone}\nAddress: ${contact.address}, Vagamon`,
      bodyHtml: NotificationService.generateCustomerConfirmationHtml(booking),
    };

    // 2. Admin Alert Email
    const adminEmail: EmailNotification = {
      id: `email_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'admin_booking_alert',
      bookingId: booking.id,
      recipientEmail: contact.email || 'admin@cloudheaven.com',
      recipientName: 'Cloud Heaven Resort Admin',
      subject: `🔔 New Booking Alert: #${booking.id} - ${booking.userName} (${booking.checkInDate} to ${booking.checkOutDate})`,
      sentAt: now,
      status: 'delivered',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        guestPhone: booking.userPhone,
        finalAmount: booking.finalAmount,
        adults: booking.guests.adults,
        children: booking.guests.children,
        villaTypeLabel: villaLabel,
      },
      bodyText: `New booking received!\nBooking ID: ${booking.id}\nGuest: ${booking.userName} (${booking.userEmail}, ${booking.userPhone})\nAccommodation: ${villaLabel}\nDates: ${booking.checkInDate} to ${booking.checkOutDate}\nTotal: ₹${booking.finalAmount.toLocaleString()}`,
      bodyHtml: NotificationService.generateAdminAlertHtml(booking),
    };

    // 3. Customer WhatsApp Voucher
    const custWaText = NotificationService.formatCustomerBookingWhatsApp(booking);
    const custWaUrl = NotificationService.createWhatsAppLink(booking.userPhone, custWaText);
    const customerWhatsApp: WhatsAppNotification = {
      id: `wa_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'customer_confirmation',
      bookingId: booking.id,
      recipientPhone: booking.userPhone,
      recipientName: booking.userName,
      recipientRole: 'guest',
      messageText: custWaText,
      directWhatsAppUrl: custWaUrl,
      sentAt: now,
      status: 'dispatched',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        finalAmount: booking.finalAmount,
        villaTypeLabel: villaLabel,
      },
    };

    // 4. Caretaker WhatsApp Alert
    const caretakerPhone = contact.caretakerPhone || '+91 73589 56101';
    const ctWaText = NotificationService.formatCaretakerBookingAlertWhatsApp(booking);
    const ctWaUrl = NotificationService.createWhatsAppLink(caretakerPhone, ctWaText);
    const caretakerWhatsApp: WhatsAppNotification = {
      id: `wa_ct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'admin_booking_alert',
      bookingId: booking.id,
      recipientPhone: caretakerPhone,
      recipientName: contact.caretakerName || 'Caretaker Babu',
      recipientRole: 'caretaker',
      messageText: ctWaText,
      directWhatsAppUrl: ctWaUrl,
      sentAt: now,
      status: 'dispatched',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        finalAmount: booking.finalAmount,
        villaTypeLabel: villaLabel,
      },
    };

    // 5. In-App Notification
    const inAppItem: AppNotificationItem = {
      id: `notif_${Date.now()}`,
      title: `Booking Confirmed: #${booking.id}`,
      message: `Automated confirmation email sent to ${booking.userEmail} & WhatsApp voucher dispatched. Check-in is scheduled for 2:00 PM on ${booking.checkInDate}.`,
      type: 'success',
      channel: 'system',
      bookingId: booking.id,
      timestamp: now,
      read: false,
      actionLabel: 'Open Voucher',
    };

    // Persist all logs
    emailLogs.unshift(customerEmail, adminEmail);
    safeSet(STORAGE_KEYS.EMAIL_LOGS, emailLogs);

    waLogs.unshift(customerWhatsApp, caretakerWhatsApp);
    safeSet(STORAGE_KEYS.WHATSAPP_LOGS, waLogs);

    appNotifs.unshift(inAppItem);
    safeSet(STORAGE_KEYS.APP_NOTIFICATIONS, appNotifs);

    return { customerEmail, adminEmail, customerWhatsApp, caretakerWhatsApp };
  },

  // -------------------------------------------------------------
  // 6. TRIGGER CHECK-IN REMINDER (Email + WhatsApp)
  // -------------------------------------------------------------
  sendCheckInReminder: (
    bookingId: string
  ): { email: EmailNotification; whatsapp: WhatsAppNotification } | null => {
    const bookings = StorageService.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const emailLogs = NotificationService.getEmailLogs();
    const waLogs = NotificationService.getWhatsAppLogs();
    const now = new Date().toISOString();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa');

    // Email
    const checkInEmail: EmailNotification = {
      id: `email_chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'checkin_reminder',
      bookingId: booking.id,
      recipientEmail: booking.userEmail,
      recipientName: booking.userName,
      subject: `🌄 Check-In Reminder: Your Cloud Heaven Stay Starts at 2:00 PM on ${booking.checkInDate} (Ref #${booking.id})`,
      sentAt: now,
      status: 'delivered',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        guestPhone: booking.userPhone,
        finalAmount: booking.finalAmount,
        adults: booking.guests.adults,
        children: booking.guests.children,
        villaTypeLabel: villaLabel,
      },
      bodyText: `Dear ${booking.userName},\n\nThis is a friendly check-in reminder for your upcoming stay at Cloud Heaven Vagamon.\n\nBooking ID: ${booking.id}\nCheck-in Date: ${booking.checkInDate} at 2:00 PM\nCheck-out Date: ${booking.checkOutDate} at 11:00 AM\n\nOur caretaker is getting the infinity pool ready for your arrival. See you soon!`,
      bodyHtml: NotificationService.generateCheckInReminderHtml(booking),
    };

    // WhatsApp
    const waText = NotificationService.formatCheckInReminderWhatsApp(booking);
    const waUrl = NotificationService.createWhatsAppLink(booking.userPhone, waText);
    const checkInWhatsApp: WhatsAppNotification = {
      id: `wa_chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'checkin_reminder',
      bookingId: booking.id,
      recipientPhone: booking.userPhone,
      recipientName: booking.userName,
      recipientRole: 'guest',
      messageText: waText,
      directWhatsAppUrl: waUrl,
      sentAt: now,
      status: 'dispatched',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        finalAmount: booking.finalAmount,
        villaTypeLabel: villaLabel,
      },
    };

    emailLogs.unshift(checkInEmail);
    safeSet(STORAGE_KEYS.EMAIL_LOGS, emailLogs);

    waLogs.unshift(checkInWhatsApp);
    safeSet(STORAGE_KEYS.WHATSAPP_LOGS, waLogs);

    return { email: checkInEmail, whatsapp: checkInWhatsApp };
  },

  // -------------------------------------------------------------
  // 7. TRIGGER CHECK-OUT REMINDER (Email + WhatsApp)
  // -------------------------------------------------------------
  sendCheckOutReminder: (
    bookingId: string
  ): { email: EmailNotification; whatsapp: WhatsAppNotification } | null => {
    const bookings = StorageService.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const emailLogs = NotificationService.getEmailLogs();
    const waLogs = NotificationService.getWhatsAppLogs();
    const now = new Date().toISOString();
    const villaLabel =
      booking.villaTypeLabel ||
      (booking.villaType === '3bhk' ? '3 BHK Luxury Villa' : '2 BHK Luxury Villa');

    // Email
    const checkOutEmail: EmailNotification = {
      id: `email_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'checkout_reminder',
      bookingId: booking.id,
      recipientEmail: booking.userEmail,
      recipientName: booking.userName,
      subject: `🌤️ Check-Out Reminder: Today at 11:00 AM - Cloud Heaven, Vagamon (Ref #${booking.id})`,
      sentAt: now,
      status: 'delivered',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        guestPhone: booking.userPhone,
        finalAmount: booking.finalAmount,
        adults: booking.guests.adults,
        children: booking.guests.children,
        villaTypeLabel: villaLabel,
      },
      bodyText: `Dear ${booking.userName},\n\nWe hope you enjoyed your stay at Cloud Heaven. This is a gentle reminder that check-out is today, ${booking.checkOutDate} by 11:00 AM.\n\nPlease hand over keys to the caretaker. Safe travels!`,
      bodyHtml: NotificationService.generateCheckOutReminderHtml(booking),
    };

    // WhatsApp
    const waText = NotificationService.formatCheckOutReminderWhatsApp(booking);
    const waUrl = NotificationService.createWhatsAppLink(booking.userPhone, waText);
    const checkOutWhatsApp: WhatsAppNotification = {
      id: `wa_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'checkout_reminder',
      bookingId: booking.id,
      recipientPhone: booking.userPhone,
      recipientName: booking.userName,
      recipientRole: 'guest',
      messageText: waText,
      directWhatsAppUrl: waUrl,
      sentAt: now,
      status: 'dispatched',
      metadata: {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        guestName: booking.userName,
        finalAmount: booking.finalAmount,
        villaTypeLabel: villaLabel,
      },
    };

    emailLogs.unshift(checkOutEmail);
    safeSet(STORAGE_KEYS.EMAIL_LOGS, emailLogs);

    waLogs.unshift(checkOutWhatsApp);
    safeSet(STORAGE_KEYS.WHATSAPP_LOGS, waLogs);

    return { email: checkOutEmail, whatsapp: checkOutWhatsApp };
  },
};
