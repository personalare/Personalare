import { Booking, EmailNotification } from '../types';
import { StorageService } from './storageService';

const STORAGE_KEYS = {
  EMAIL_LOGS: 'cloudheaven_email_logs_v1',
};

// Safe storage helper
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
  } catch (e) {
    console.error('Failed to save email logs to localStorage', e);
  }
}

// Initial sample email logs to show historical confirmations
const INITIAL_EMAIL_LOGS: EmailNotification[] = [
  {
    id: 'email_log_sample_1',
    type: 'customer_confirmation',
    bookingId: 'CHV-88219',
    recipientEmail: 'dr.anand@keralamed.org',
    recipientName: 'Dr. Anand Varma',
    subject: 'Confirmed: Your Private Pool Villa Stay at Cloud Heaven, Vagamon (Ref #CHV-88219)',
    sentAt: '2026-08-15T10:32:00Z',
    status: 'delivered',
    metadata: {
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-25',
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      guestName: 'Dr. Anand Varma',
      guestPhone: '+91 94471 23456',
      finalAmount: 65490,
      adults: 4,
      children: 2,
    },
    bodyText: `Dear Dr. Anand Varma,\n\nYour reservation at Cloud Heaven, Vagamon is confirmed.\n\nBooking ID: CHV-88219\nCheck-in: August 22, 2026 at 2:00 PM\nCheck-out: August 25, 2026 at 11:00 AM\nProperty: Cloud Heaven Private Pool Villa, Vagamon, Kerala\nTotal Amount: ₹65,490\n\nWe look forward to hosting you in the clouds!`,
    bodyHtml: ``,
  },
  {
    id: 'email_log_sample_2',
    type: 'admin_booking_alert',
    bookingId: 'CHV-88219',
    recipientEmail: 'admin@cloudheaven.com',
    recipientName: 'Cloud Heaven Resort Admin',
    subject: '🔔 New Booking Confirmed: #CHV-88219 - Dr. Anand Varma (2026-08-22 to 2026-08-25)',
    sentAt: '2026-08-15T10:32:01Z',
    status: 'delivered',
    metadata: {
      checkInDate: '2026-08-22',
      checkOutDate: '2026-08-25',
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      guestName: 'Dr. Anand Varma',
      guestPhone: '+91 94471 23456',
      finalAmount: 65490,
      adults: 4,
      children: 2,
    },
    bodyText: `New reservation alert for Cloud Heaven!\nGuest: Dr. Anand Varma\nDates: Aug 22 to Aug 25, 2026\nRevenue: ₹65,490`,
    bodyHtml: ``,
  },
];

export const EmailService = {
  // Retrieve all logged outbound emails
  getEmailLogs: (): EmailNotification[] => {
    const logs = safeGet<EmailNotification[]>(STORAGE_KEYS.EMAIL_LOGS, INITIAL_EMAIL_LOGS);
    return logs;
  },

  // Get emails for a specific booking
  getEmailLogsByBookingId: (bookingId: string): EmailNotification[] => {
    const logs = EmailService.getEmailLogs();
    return logs.filter((log) => log.bookingId === bookingId);
  },

  // Get emails for a specific user email
  getEmailLogsByRecipient: (email: string): EmailNotification[] => {
    const logs = EmailService.getEmailLogs();
    const cleanEmail = email.toLowerCase().trim();
    return logs.filter((log) => log.recipientEmail.toLowerCase().trim() === cleanEmail);
  },

  // Generate Customer HTML Email
  generateCustomerConfirmationHtml: (booking: Booking): string => {
    const contact = StorageService.getContactDetails();
    const villa = StorageService.getVillaDetails();

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
        Thank you for reserving <strong>Cloud Heaven</strong> in Vagamon. Your private sanctuary atop the clouds is booked exclusively for you and your party.
      </p>

      <div class="schedule-box">
        <div class="timing-card">
          <div class="timing-tag">Check-In Schedule</div>
          <div class="timing-date">${formattedCheckIn}</div>
          <div class="timing-clock">From ${booking.checkInTime}</div>
        </div>
        <div class="timing-card">
          <div class="timing-tag">Check-Out Schedule</div>
          <div class="timing-date">${formattedCheckOut}</div>
          <div class="timing-clock">Until ${booking.checkOutTime}</div>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">
        Reservation & Guest Breakdown
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
          <td class="label">Party Size</td>
          <td class="value">${booking.guests.adults} Adults, ${booking.guests.children} Children</td>
        </tr>
        <tr>
          <td class="label">Stay Duration</td>
          <td class="value">${booking.totalNights} ${booking.totalNights === 1 ? 'Night' : 'Nights'}</td>
        </tr>
        <tr>
          <td class="label">Accommodation</td>
          <td class="value">Entire Private Villa & Infinity Pool</td>
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
          <td class="label">Resort Tax & GST (${villa.taxRatePercent}%)</td>
          <td class="value">₹${booking.taxAmount.toLocaleString()}</td>
        </tr>
        <tr class="total-row">
          <td>Grand Total Amount</td>
          <td class="value" style="color: #064e3b; font-size: 18px;">₹${booking.finalAmount.toLocaleString()}</td>
        </tr>
      </table>

      <div class="location-box">
        <div class="location-title">Resort Address & Caretaker Support</div>
        <p class="location-text">
          <strong>${villa.name}</strong><br>
          ${contact.address}, ${contact.landmark}<br>
          ${contact.city}, ${contact.state} - ${contact.pincode}<br>
          <strong>Caretaker / Reception Hotline:</strong> ${contact.phone} | <strong>WhatsApp:</strong> ${contact.whatsapp}
        </p>
      </div>

      <div style="background: #fafaf9; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #57534e; line-height: 1.5;">
        <strong style="color: #292524; display: block; margin-bottom: 4px;">Important Arrival Notes:</strong>
        &bull; <strong>Strict Check-in Time:</strong> 2:00 PM allows our team to sanitize and heat the infinity pool.<br>
        &bull; <strong>Strict Check-out Time:</strong> 11:00 AM allows preparation for arriving guests.<br>
        &bull; Please share your approximate arrival time via WhatsApp with our caretaker for gate clearance.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px;">Cloud Heaven Resort &bull; Vagamon, Idukki District, Kerala, India</p>
      <p style="margin: 0;">For inquiries or changes, email ${contact.email} or call ${contact.phone}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  // Generate Admin Alert HTML
  generateAdminAlertHtml: (booking: Booking): string => {
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
      <strong>${booking.userName}</strong> has confirmed a <strong>${booking.totalNights}-night stay</strong> at Cloud Heaven.
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
      <span class="label">Email & Phone:</span>
      <span class="val">${booking.userEmail} | ${booking.userPhone}</span>
    </div>
    <div class="info-row">
      <span class="label">Occupancy:</span>
      <span class="val">${booking.guests.adults} Adults, ${booking.guests.children} Children</span>
    </div>
    <div class="info-row">
      <span class="label">Addons / Experiences:</span>
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

  // Trigger automated sending when a booking is created
  sendBookingConfirmation: (booking: Booking): { customerEmail: EmailNotification; adminEmail: EmailNotification } => {
    const logs = EmailService.getEmailLogs();
    const now = new Date().toISOString();

    // 1. Customer Confirmation Email
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
      },
      bodyText: `Dear ${booking.userName},\n\nYour reservation at Cloud Heaven, Vagamon is confirmed.\n\nBooking ID: ${booking.id}\nCheck-in: ${booking.checkInDate} from ${booking.checkInTime}\nCheck-out: ${booking.checkOutDate} until ${booking.checkOutTime}\nGuests: ${booking.guests.adults} Adults, ${booking.guests.children} Children\nTotal Amount: ₹${booking.finalAmount.toLocaleString()}\n\nContact: +91 94471 88234\nAddress: Cloud Heaven Estate, Near Pine Forest, Vagamon, Kerala`,
      bodyHtml: EmailService.generateCustomerConfirmationHtml(booking),
    };

    // 2. Admin Alert Email
    const contact = StorageService.getContactDetails();
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
      },
      bodyText: `New booking received!\nBooking ID: ${booking.id}\nGuest: ${booking.userName} (${booking.userEmail}, ${booking.userPhone})\nDates: ${booking.checkInDate} to ${booking.checkOutDate}\nTotal: ₹${booking.finalAmount.toLocaleString()}`,
      bodyHtml: EmailService.generateAdminAlertHtml(booking),
    };

    // Save to storage logs
    logs.unshift(customerEmail, adminEmail);
    safeSet(STORAGE_KEYS.EMAIL_LOGS, logs);

    return { customerEmail, adminEmail };
  },

  // Resend email helper
  resendEmail: (emailId: string): boolean => {
    const logs = EmailService.getEmailLogs();
    const target = logs.find((l) => l.id === emailId);
    if (target) {
      target.sentAt = new Date().toISOString();
      target.status = 'delivered';
      safeSet(STORAGE_KEYS.EMAIL_LOGS, logs);
      return true;
    }
    return false;
  },
};
