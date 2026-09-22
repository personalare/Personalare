import jsPDF from 'jspdf';
import { StorageService } from './storageService';
import { VAGAMON_ATTRACTIONS } from '../components/LocationMapSection';

export interface WelcomeGuideOptions {
  guestName?: string;
  bookingRef?: string;
  checkInDate?: string;
  checkOutDate?: string;
  villaType?: string;
}

export class WelcomeGuidePdfService {
  /**
   * Generates a 3-page comprehensive Guest Welcome Guide in PDF format
   */
  public static generatePdf(options: WelcomeGuideOptions = {}): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const contact = StorageService.getContactDetails();
    const villa = StorageService.getVillaDetails();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const brandDarkGreen: [number, number, number] = [6, 78, 59]; // #064E3B
    const brandEmerald: [number, number, number] = [16, 185, 129]; // #10B981
    const brandLightBg: [number, number, number] = [240, 253, 244]; // #F0FDF4
    const textDark: [number, number, number] = [31, 41, 55]; // #1F2937
    const textMuted: [number, number, number] = [107, 114, 128]; // #6B7280
    const goldAccent: [number, number, number] = [217, 119, 6]; // #D97706

    // Helper: Draw common header on any page
    const drawPageHeader = (pageNumber: number, totalPages: number, pageTitle: string) => {
      // Top Emerald Accent Bar
      doc.setFillColor(...brandDarkGreen);
      doc.rect(0, 0, pageWidth, 20, 'F');

      // Top bar gold strip
      doc.setFillColor(...goldAccent);
      doc.rect(0, 20, pageWidth, 1.2, 'F');

      // Header Brand text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('CLOUD HEAVEN VAGAMON', margin, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(209, 250, 229);
      doc.text('GUEST WELCOME GUIDE & VAGAMON ITINERARY', margin, 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(pageTitle.toUpperCase(), pageWidth - margin, 13, { align: 'right' });

      // Page Footer
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.4);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text(
        `Cloud Heaven Estate • Kurisumala Ashram Rd, Vagamon • Caretaker 24x7: ${contact.caretakerPhone || '+91 73589 56101'}`,
        margin,
        pageHeight - 7
      );
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    };

    // ==========================================
    // PAGE 1: COVER & ESSENTIAL CHECK-IN DETAILS
    // ==========================================
    drawPageHeader(1, 3, 'Villa Essentials & Check-In');

    let y = 28;

    // Welcome Card
    doc.setFillColor(...brandLightBg);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...brandDarkGreen);
    const welcomeTitle = options.guestName
      ? `Welcome to Cloud Heaven, ${options.guestName}!`
      : 'Welcome to Cloud Heaven Private Pool Villa!';
    doc.text(welcomeTitle, margin + 4, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    const welcomeSub = options.bookingRef
      ? `Confirmed Reservation Ref #${options.bookingRef} • ${options.villaType || 'Luxury Private Estate'}`
      : 'Your exclusive private sanctuary tucked in the misty hills of Vagamon, Kerala.';
    doc.text(welcomeSub, margin + 4, y + 12);
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      'This comprehensive guide provides key access instructions, Wi-Fi credentials, house rules, and curated Vagamon attractions.',
      margin + 4,
      y + 18
    );

    y += 28;

    // 2-Column: Check-in / Check-out Protocol & Villa Access
    const colWidth = (contentWidth - 6) / 2;

    // Left Box: Check-In & Check-Out Timings
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, colWidth, 48, 2, 2, 'FD');

    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(margin, y, colWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('1. ARRIVAL & DEPARTURE TIMINGS', margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);

    let cy = y + 12;
    doc.setFont('helvetica', 'bold');
    doc.text('Check-In Time:', margin + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('2:00 PM onwards', margin + 27, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Check-Out Time:', margin + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('11:00 AM sharp', margin + 28, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('ID Verification:', margin + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('Govt. ID (Aadhaar/Passport/DL) required', margin + 27, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Key Handover:', margin + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('Personal reception by villa caretaker', margin + 27, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Late Arrival:', margin + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('Please alert caretaker if arriving past 7 PM', margin + 25, cy);

    // Right Box: High-Speed Wi-Fi & Villa Connectivity
    const rx = margin + colWidth + 6;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(rx, y, colWidth, 48, 2, 2, 'FD');

    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(rx, y, colWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('2. WI-FI & ENTERTAINMENT SETUP', rx + 3, y + 5);

    cy = y + 12;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Wi-Fi Network:', rx + 3, cy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandDarkGreen);
    doc.text('CloudHeaven_Guest_5G', rx + 26, cy);

    cy += 6;
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.text('Wi-Fi Password:', rx + 3, cy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandDarkGreen);
    doc.text('cloudheaven@mist', rx + 28, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Internet Speed:', rx + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('150+ Mbps Optical Fiber (Workation ready)', rx + 26, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Smart TV Setup:', rx + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('55" 4K Google TV (Netflix, Prime, Hotstar)', rx + 26, cy);

    cy += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Sound System:', rx + 3, cy);
    doc.setFont('helvetica', 'normal');
    doc.text('Bluetooth party soundbar in living lounge', rx + 25, cy);

    y += 53;

    // Full Width Section: Villa Amenities & Operating Tips
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentWidth, 80, 2, 2, 'FD');

    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('3. VILLA AMENITIES & OPERATING GUIDELINES', margin + 3, y + 5);

    const amenityGuidelines = [
      {
        title: 'Private Infinity Swimming Pool',
        desc: 'Gradual depth 3.5 ft to 4.5 ft. The filtration system operates 24x7. Night swimming with atmospheric underwater lighting is permitted until 10:30 PM. No glassware in or near pool water (acrylic cups provided).',
      },
      {
        title: 'Hot Water Geysers & Water Supply',
        desc: 'All ensuite bathrooms are fitted with 25L high-capacity instant storage geysers. Please switch on geyser switches 15 minutes before showering. Our water is mountain spring-filtered pure source.',
      },
      {
        title: 'Kitchen & Pantry Induction Bar',
        desc: 'Equipped with induction cooktop, microwave, refrigerator, electric kettle, and RO purified drinking water. Feel free to prepare light baby food, tea/coffee, or snacks. Please power off appliances after use.',
      },
      {
        title: 'Campfire Setup & Barbecue Grill',
        desc: 'Campfire setup is organized in the private garden lawn. Please inform the caretaker by 5:00 PM for firewood arrangement and ignition at 7:30 PM. Live BBQ skewers available upon prior request.',
      },
      {
        title: 'EV Charging & Private Parking',
        desc: 'Dedicated covered parking for up to 4 vehicles on the estate premises. A standard 15A slow EV power socket is available for emergency vehicle top-up upon notification to caretaker.',
      },
    ];

    let ay = y + 13;
    amenityGuidelines.forEach((item, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...brandDarkGreen);
      doc.text(`• ${item.title}:`, margin + 3, ay);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textDark);
      const splitDesc = doc.splitTextToSize(item.desc, contentWidth - 8);
      doc.text(splitDesc, margin + 5, ay + 4);

      ay += 13.5;
    });

    y += 85;

    // Contact Quick Box at bottom of Page 1
    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('24/7 DEDICATED CARETAKER & ASSISTANCE', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(209, 250, 229);
    doc.text(
      `Caretaker Mobile: ${contact.caretakerPhone || '+91 73589 56101'}  |  Booking Desk: ${contact.phone}  |  Resort Location: ${contact.address}`,
      margin + 4,
      y + 11
    );
    doc.text(
      'Need fresh towels, extra blankets, bonfire lighting, or hot tea? Dial our caretaker directly anytime!',
      margin + 4,
      y + 16
    );

    // ==========================================
    // PAGE 2: HOUSE RULES & EMERGENCY SERVICES
    // ==========================================
    doc.addPage();
    drawPageHeader(2, 3, 'House Rules & Emergency Contacts');

    y = 28;

    // House Rules Section Header
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentWidth, 106, 2, 2, 'FD');

    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('4. VILLA HOUSE RULES & CODE OF CONDUCT', margin + 3, y + 5);

    const houseRules = [
      {
        num: '4.1',
        title: 'Quiet Hours & Mountain Decorum (10:00 PM - 06:00 AM)',
        desc: 'Vagamon is an eco-sensitive hill haven. High-decibel outdoor loudspeakers and heavy bass must cease by 10:00 PM to honor local wildlife and peaceful valley ambience. Indoor acoustic music is permitted.',
      },
      {
        num: '4.2',
        title: 'Smoking & Alcohol Policy',
        desc: 'Indoor bedrooms and living halls are 100% strictly non-smoking. Smoking is permitted on outdoor open-air balconies, lawn verandas, and designated fire pit zones with ash trays provided. Responsible drinking is welcome.',
      },
      {
        num: '4.3',
        title: 'Swimming Pool Etiquette & Child Safety',
        desc: 'Appropriate synthetic swimwear required. Diving is strictly forbidden due to 4.5 ft safety depth. Children under 12 must be supervised by an adult at all times. Outdoor poolside shower must be taken prior to pool entry.',
      },
      {
        num: '4.4',
        title: 'Waste Segregation & Eco-Conscious Living',
        desc: 'We are committed to preserving pristine Western Ghats ecology. Please deposit plastics, food waste, and recyclables into separate bins provided in the kitchen. Avoid littering in garden tea bushes.',
      },
      {
        num: '4.5',
        title: 'Occupancy & External Visitors',
        desc: 'Only guests registered during check-in are permitted to stay overnight. Unregistered outside visitors are not permitted on villa premises after 9:00 PM without prior management approval.',
      },
      {
        num: '4.6',
        title: 'Property Care & Key Return',
        desc: 'Please treat the luxury furnishings, audio electronics, and teak decor with care. On checkout morning (11:00 AM), please hand over all room keys and electronic remotes to the villa caretaker.',
      },
    ];

    let ry = y + 13;
    houseRules.forEach((rule) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...brandDarkGreen);
      doc.text(`${rule.num} ${rule.title}`, margin + 3, ry);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textDark);
      const lines = doc.splitTextToSize(rule.desc, contentWidth - 8);
      doc.text(lines, margin + 5, ry + 4);

      ry += 15;
    });

    y += 112;

    // Emergency & Medical Services Table
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentWidth, 80, 2, 2, 'FD');

    doc.setFillColor(...goldAccent);
    doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('5. ESSENTIAL CONTACTS & EMERGENCY DIRECTORY', margin + 3, y + 5);

    const emergencyContacts = [
      {
        service: 'Resort 24x7 Caretaker',
        contactName: 'On-Duty Villa Host',
        number: contact.caretakerPhone || '+91 73589 56101',
        location: 'On Estate Property',
      },
      {
        service: 'Central Booking & Concierge',
        contactName: 'Cloud Heaven Desk',
        number: contact.phone,
        location: 'Vagamon Office',
      },
      {
        service: 'Primary Health Centre (PHC)',
        contactName: 'Duty Doctor / OPD',
        number: '04869-248230 / 108',
        location: 'Vagamon Junction (4.0 km)',
      },
      {
        service: 'St. Joseph Hospital & ICU',
        contactName: 'Emergency Casualty',
        number: '04869-242224',
        location: 'Elappara Town (14 km)',
      },
      {
        service: 'Local 24-Hour Pharmacy',
        contactName: 'City Medicals Vagamon',
        number: '+91 94472 81900',
        location: 'Near Pine Forest Rd (2.5 km)',
      },
      {
        service: 'Vagamon Police Station',
        contactName: 'Sub-Inspector on Duty',
        number: '04869-248233 / 112',
        location: 'Police Station Rd, Vagamon',
      },
      {
        service: '4x4 Off-Road Jeep & Chauffeur',
        contactName: 'Estate Safari Desk',
        number: '+91 89250 14660',
        location: 'Airport / Station / Trekking',
      },
    ];

    let ey = y + 13;
    // Table Header
    doc.setFillColor(229, 231, 235);
    doc.rect(margin + 2, ey - 3, contentWidth - 4, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text('Service & Department', margin + 4, ey);
    doc.text('Designation', margin + 55, ey);
    doc.text('Phone / Helpline', margin + 98, ey);
    doc.text('Location / Notes', margin + 140, ey);

    ey += 5;
    emergencyContacts.forEach((ec, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(243, 244, 246);
        doc.rect(margin + 2, ey - 3, contentWidth - 4, 5.5, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...brandDarkGreen);
      doc.text(ec.service, margin + 4, ey + 0.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textDark);
      doc.text(ec.contactName, margin + 55, ey + 0.5);

      doc.setFont('helvetica', 'bold');
      doc.text(ec.number, margin + 98, ey + 0.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(ec.location, margin + 140, ey + 0.5);

      ey += 6;
    });

    // ==========================================
    // PAGE 3: CURATED VAGAMON SIGHTSEEING GUIDE
    // ==========================================
    doc.addPage();
    drawPageHeader(3, 3, 'Curated Vagamon Attractions Guide');

    y = 28;

    // Vagamon intro banner
    doc.setFillColor(...brandLightBg);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...brandDarkGreen);
    doc.text('EXPLORE VAGAMON: THE QUEEN OF MISTY HILLS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(
      'Our concierge team has handpicked the top 8 destinations in and around Vagamon, detailing travel times, ideal visiting hours, and insider local tips.',
      margin + 4,
      y + 11.5
    );

    y += 20;

    // Curated Attractions List (8 items formatted in 2-column or 4-row grid)
    const curatedAttractions = [
      {
        name: '1. Vagamon Pine Forest',
        category: 'Towering Pine Groves',
        distance: '2.1 km (6 mins drive)',
        timing: 'Best: 07:00 AM - 10:00 AM',
        highlights: 'Towering British-planted pine trees on steep hill slopes, sunbeams piercing misty canopy, gentle pine-needle walking trails.',
      },
      {
        name: '2. Kurisumala Ashram & Dairy Farm',
        category: 'Spiritual Monastery & Peak',
        distance: '2.8 km (8 mins drive)',
        timing: 'Best: 06:00 AM - 11:00 AM',
        highlights: 'Tranquil Christian monastery with Swiss dairy cattle farm, silent meditation paths, 360-degree views across Sahyadri peaks.',
      },
      {
        name: '3. Vagamon Meadows (Green Hills)',
        category: 'Velvet Meadows & Lake',
        distance: '3.6 km (9 mins drive)',
        timing: 'Best: 08:00 AM - 06:00 PM',
        highlights: 'Endless undulating velveteen green mound hills with a central tranquil lake, paddle boating, cool hill breezes.',
      },
      {
        name: '4. Murugan Mala (Sunrise Peak)',
        category: 'Highland Sunrise Rock',
        distance: '3.2 km (8 mins drive)',
        timing: 'Best: 05:45 AM - 07:30 AM',
        highlights: 'Single granite summit with ancient rock-cut temple, breathtaking vantage for first dawn rays breaking over tea plantations.',
      },
      {
        name: '5. Thangal Para & Ancient Caves',
        category: 'Heritage Rocky Cliff',
        distance: '4.8 km (12 mins drive)',
        timing: 'Best: 09:00 AM - 05:00 PM',
        highlights: 'Gigantic spherical boulder balanced mysteriously on a high mountain cliff edge, natural rock caves, panoramic vistas.',
      },
      {
        name: '6. Marmala Waterfalls',
        category: '4x4 Off-Road Jungle Cascades',
        distance: '14.5 km (32 mins 4x4 Jeep)',
        timing: 'Best: 09:00 AM - 04:30 PM',
        highlights: '60-meter roaring waterfall deep inside teak forests with a natural plunge pool. Requires guided 4x4 off-road jeep trek.',
      },
      {
        name: '7. Kolahalamedu Tea Gardens & Factory',
        category: 'Tea Tasting & Processing',
        distance: '5.5 km (12 mins drive)',
        timing: 'Best: 09:00 AM - 05:00 PM',
        highlights: 'Walk through lush emerald tea slopes, witness fresh orthodox & CTC tea manufacturing, buy premium single-estate hill teas.',
      },
      {
        name: '8. Vagamon Adventure Paragliding Point',
        category: 'Aerial Tandem Flight',
        distance: '4.2 km (10 mins drive)',
        timing: 'Best: 10:00 AM - 04:00 PM',
        highlights: 'One of South India’s top paragliding launch pads. Glide over deep valleys and tea gardens with certified tandem pilots.',
      },
    ];

    const attCardWidth = (contentWidth - 4) / 2;
    const attCardHeight = 44;

    curatedAttractions.forEach((att, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ax = margin + col * (attCardWidth + 4);
      const ay = y + row * (attCardHeight + 3);

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(ax, ay, attCardWidth, attCardHeight, 2, 2, 'FD');

      // Top mini header of attraction
      doc.setFillColor(...brandDarkGreen);
      doc.roundedRect(ax, ay, attCardWidth, 6, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(att.name, ax + 2.5, ay + 4.2);

      // Distance & Timing Pill
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...goldAccent);
      doc.text(`📍 ${att.distance}  •  ⏰ ${att.timing}`, ax + 3, ay + 10.5);

      // Category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...textDark);
      doc.text(`Category: ${att.category}`, ax + 3, ay + 15);

      // Description / Highlights
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(...textMuted);
      const splitHL = doc.splitTextToSize(att.highlights, attCardWidth - 6);
      doc.text(splitHL, ax + 3, ay + 19.5);
    });

    y += 4 * (attCardHeight + 3) + 2;

    // Bottom Concierge Booking Banner
    doc.setFillColor(...brandDarkGreen);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('NEED A JEEP SAFARI, CAB OR SIGHTSEEING GUIDE?', margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(209, 250, 229);
    doc.text(
      `We arrange customized 4x4 Off-Road Jeep Treks (₹3,000) and Private Chauffeur Cabs directly from the villa gate. Contact Concierge: ${contact.phone} or Caretaker: ${contact.caretakerPhone || '+91 73589 56101'}`,
      margin + 4,
      y + 11
    );

    return doc;
  }

  /**
   * Downloads the PDF directly to user's device
   */
  public static downloadPdf(options: WelcomeGuideOptions = {}): void {
    const doc = this.generatePdf(options);
    const fileName = options.bookingRef
      ? `Cloud_Heaven_Vagamon_Welcome_Guide_${options.bookingRef}.pdf`
      : `Cloud_Heaven_Vagamon_Welcome_Guide.pdf`;
    doc.save(fileName);
  }

  /**
   * Opens the generated PDF in a new browser tab or creates a blob URL
   */
  public static openPdfInNewTab(options: WelcomeGuideOptions = {}): void {
    const doc = this.generatePdf(options);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
