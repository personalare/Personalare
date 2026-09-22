/**
 * Vagamon Season & Weather Intelligence
 * Provides automated detection of Vagamon's peak rainy (monsoon) and high-rush festival seasons,
 * tailored with actionable mountain travel advisories, driving tips, and packing guidance.
 */

export interface VagamonSeasonMatch {
  id: string;
  category: 'monsoon' | 'festival';
  name: string;
  tag: string;
  dateRangeDescription: string;
  description: string;
  highlights: string[];
  travelTips: string[];
}

export interface VagamonSeasonAlert {
  type: 'monsoon' | 'festival' | 'both';
  severity: 'warning' | 'notice';
  badge: string;
  title: string;
  headline: string;
  description: string;
  matchedSeasons: VagamonSeasonMatch[];
  drivingAdvisory: string;
  poolAdvisory: string;
  villaReadiness: string[];
  packingList: string[];
  liveForecastNote?: string;
}

interface SeasonDefinition {
  id: string;
  category: 'monsoon' | 'festival';
  name: string;
  tag: string;
  dateRangeDescription: string;
  description: string;
  highlights: string[];
  travelTips: string[];
  // function to test if a given (month [1-12], day [1-31]) falls within this season
  matches: (month: number, day: number) => boolean;
}

export const VAGAMON_SEASONS: SeasonDefinition[] = [
  // 1. Southwest Monsoon (Edavappathi)
  {
    id: 'sw_monsoon',
    category: 'monsoon',
    name: 'Southwest Monsoon (Edavappathi)',
    tag: 'Peak Rainy Season',
    dateRangeDescription: 'June 1 – August 31 (Peak: July & August)',
    description:
      'Vagamon receives intense tropical monsoon showers that drape the Western Ghats in dramatic rolling clouds, emerald green moss, and surging waterfall cascades.',
    highlights: [
      'Lush green rolling hills & active natural waterfalls (Vagamon Falls & Marmala)',
      'Cinematic rolling mist and cool temperatures (15°C – 20°C)',
      'Panoramic rain viewing through the villa’s floor-to-ceiling glass balconies',
    ],
    travelTips: [
      'Ghat road navigation: High mist reduces visibility; we recommend reaching the villa before 5:30 PM.',
      'Paragliding & off-road jeep trails may be paused during heavy downpours by local authorities.',
      'Infinity pool is fresh mountain water; ambient water will be crisp (16°C–18°C). Warm robes provided.',
    ],
    matches: (month: number) => month >= 6 && month <= 8,
  },

  // 2. Northeast Monsoon (Thulavarsham)
  {
    id: 'ne_monsoon',
    category: 'monsoon',
    name: 'Northeast Monsoon (Thulavarsham)',
    tag: 'Autumn Rain Season',
    dateRangeDescription: 'October 1 – November 25',
    description:
      'Characterized by pleasant mornings and crisp late-afternoon thundershowers, bringing vibrant cloud formations and dramatic sunset mists across the valley.',
    highlights: [
      'Sunny morning hikes transitioning to cozy, misty afternoons',
      'Spectacular twilight sunsets over mist-filled tea valleys',
      'Fresh mountain air with crisp evening breezes',
    ],
    travelTips: [
      'Plan outdoor hikes and pine forest excursions for morning hours (8 AM – 1 PM).',
      'Evening campfire is scheduled between showers or under covered patio area.',
    ],
    matches: (month: number, day: number) => {
      if (month === 10) return true;
      if (month === 11 && day <= 25) return true;
      return false;
    },
  },

  // 3. Onam Festival Season
  {
    id: 'onam_fest',
    category: 'festival',
    name: 'Onam Harvest Festival Season',
    tag: 'Kerala State Festival Peak',
    dateRangeDescription: 'Late August – Mid September',
    description:
      'Kerala’s grandest festival brings high domestic tourist footfall, cultural festivities, and scenic holiday crowds to the Idukki hill tracts.',
    highlights: [
      'Festive cultural ambiance across Peerumedu & Vagamon town',
      'Traditional Kerala Onam Sadhya feast options available upon advance request',
      'Vibrant atmosphere and scenic seasonal holiday cheer',
    ],
    travelTips: [
      'Expect moderate holiday traffic on Kottayam-Kumily & Erattupetta-Vagamon highways.',
      'Book jeep safaris and customized barbecue dinners at the villa at least 24 hours in advance.',
    ],
    matches: (month: number, day: number) => {
      if (month === 8 && day >= 20) return true;
      if (month === 9 && day <= 20) return true;
      return false;
    },
  },

  // 4. Vagamon Winter Fest & Year-End Holiday Rush
  {
    id: 'winter_fest',
    category: 'festival',
    name: 'Vagamon Winter Fest & Holiday Rush',
    tag: 'Peak Holiday Season',
    dateRangeDescription: 'December 18 – January 8',
    description:
      'Peak tourism period with chilly highland nights (10°C – 14°C), Vagamon Winter Fest cultural shows, and a vibrant holiday rush of travelers from across South India.',
    highlights: [
      'Chilly mountain climate ideal for evening private campfires & stargazing',
      'Vagamon Pine Forest, Glass Bridge & Kurisumala have lively holiday crowds',
      'Crystal clear mountain visibility and crisp morning breezes',
    ],
    travelTips: [
      'Arrive early for local attraction entry tickets (Glass Bridge, Pine Forest & Adventure Park).',
      'Pack warm woolen sweaters, fleece jackets, and thermals for evening chill.',
      'Pre-confirm private campfire timings with our resident villa caretaker.',
    ],
    matches: (month: number, day: number) => {
      if (month === 12 && day >= 18) return true;
      if (month === 1 && day <= 8) return true;
      return false;
    },
  },

  // 5. International Paragliding & Adventure Fest
  {
    id: 'paragliding_fest',
    category: 'festival',
    name: 'International Paragliding & Adventure Fest',
    tag: 'Adventure Peak Season',
    dateRangeDescription: 'January 15 – March 15',
    description:
      'Vagamon’s Kolahalamedu hosts the annual International Paragliding Championship and Summer Flower Show, attracting aviation athletes, trekkers, and photographers.',
    highlights: [
      'Spectacular thermals for tandem paragliding flights over misty ridge valleys',
      'Vagamon Orchidarium & Flower Show in full botanical bloom',
      'Ideal mild temperatures (18°C – 26°C) for infinity pool swimming and outdoor lawn games',
    ],
    travelTips: [
      'Tandem paragliding slots fill up rapidly; request our concierge to secure your flight ticket early.',
      'Perfect sunny afternoons for private infinity pool sessions overlooking the cliffs.',
    ],
    matches: (month: number, day: number) => {
      if (month === 1 && day >= 15) return true;
      if (month === 2) return true;
      if (month === 3 && day <= 15) return true;
      return false;
    },
  },

  // 6. Kurisumala Holy Week Pilgrimage
  {
    id: 'kurisumala_fest',
    category: 'festival',
    name: 'Kurisumala Ashram Holy Week Pilgrimage',
    tag: 'Pilgrimage Peak',
    dateRangeDescription: 'March 20 – April 18 (Holy Week & Easter)',
    description:
      'Thousands of pilgrims ascend Kurisumala (Mountain of the Cross) to visit the famous Kurisumala Ashram and dairy farm, creating festive spiritual energy and local traffic diversions.',
    highlights: [
      'Spiritual mountain walk to Kurisumala Ashram and scenic dairy farm meadows',
      'Pleasant spring weather with cool mountain breezes',
    ],
    travelTips: [
      'Kurisumala hill base route may experience vehicle restrictions; take early morning walks.',
      'Cloud Heaven Villa is situated in an exclusive private hill pocket, keeping you insulated from town crowds.',
    ],
    matches: (month: number, day: number) => {
      if (month === 3 && day >= 20) return true;
      if (month === 4 && day <= 18) return true;
      return false;
    },
  },

  // 7. Summer Mountain Escape & Vishu Vacation
  {
    id: 'summer_rush',
    category: 'festival',
    name: 'Vishu & Summer Vacation Rush',
    tag: 'Peak Summer Holiday Season',
    dateRangeDescription: 'April 10 – May 31',
    description:
      'High season for families escaping the sweltering plains of Kerala, Tamil Nadu, and Karnataka. Vagamon remains refreshingly cool (21°C – 27°C).',
    highlights: [
      'Cool mountain escape with panoramic clear skies and sunny afternoons',
      'Best season for full-day infinity pool lounging and mountain view barbecues',
      'Long daylight hours perfect for exploring nearby Marmala waterfalls and tea factory tours',
    ],
    travelTips: [
      'High demand for private villas; early check-in is strictly subject to previous night departures.',
      'Carry light cottons for day excursions and a light cardigan for cool mountain evenings.',
    ],
    matches: (month: number, day: number) => {
      if (month === 4 && day >= 10) return true;
      if (month === 5) return true;
      return false;
    },
  },
];

/**
 * Analyzes check-in and check-out dates and returns an automated notification alert
 * if the reservation intersects with Vagamon's peak rainy or festival seasons.
 */
export function detectVagamonSeasons(
  checkInDateStr: string,
  checkOutDateStr?: string,
  livePrecipitationChance?: number
): VagamonSeasonAlert | null {
  if (!checkInDateStr) return null;

  const start = new Date(checkInDateStr + 'T00:00:00');
  let end: Date;

  if (checkOutDateStr) {
    end = new Date(checkOutDateStr + 'T00:00:00');
  } else {
    // Default to checkIn + 1 day to evaluate single date
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return null;
  }

  // Iterate through all days in range to detect matching seasons
  const matchedSeasonIds = new Set<string>();
  const curr = new Date(start);

  while (curr < end) {
    const month = curr.getMonth() + 1; // 1 - 12
    const day = curr.getDate();

    for (const season of VAGAMON_SEASONS) {
      if (season.matches(month, day)) {
        matchedSeasonIds.add(season.id);
      }
    }
    // Move to next day
    curr.setDate(curr.getDate() + 1);
  }

  if (matchedSeasonIds.size === 0) {
    return null;
  }

  const matched = VAGAMON_SEASONS.filter((s) => matchedSeasonIds.has(s.id));
  const hasMonsoon = matched.some((s) => s.category === 'monsoon');
  const hasFestival = matched.some((s) => s.category === 'festival');

  let alertType: 'monsoon' | 'festival' | 'both' = 'monsoon';
  if (hasMonsoon && hasFestival) alertType = 'both';
  else if (hasFestival) alertType = 'festival';

  // Determine severity and primary labels
  const severity: 'warning' | 'notice' = hasMonsoon ? 'warning' : 'notice';

  let badge = 'Vagamon Season Notice';
  let title = 'Seasonal Travel Advisory';
  let headline = '';
  let description = '';

  if (alertType === 'both') {
    badge = 'Peak Rainy & Festival Season Advisory';
    title = 'Peak Monsoon & Holiday Season Alert';
    headline = 'Your selected dates fall within Vagamon’s Peak Monsoon & High-Demand Holiday Season.';
    description =
      'Experience the majesty of mist-clad tea hills and lush waterfalls alongside vibrant holiday cheer. Review our road safety, infinity pool, and packing recommendations below.';
  } else if (alertType === 'monsoon') {
    badge = 'Vagamon Peak Monsoon Season Alert';
    title = 'Peak Rainy Season & Ghat Travel Advisory';
    headline = 'Your reservation coincides with Vagamon’s Highland Monsoon Season.';
    description =
      'Vagamon during the monsoons is breathtakingly lush with misty valleys and roaring waterfalls. However, heavy rains can impact ghat road travel, visibility, and outdoor trails.';
  } else {
    badge = 'Vagamon Peak Festival Season Advisory';
    title = 'High-Demand Festival & Holiday Notice';
    headline = 'Your reservation is during a High-Demand Festival / Peak Season in Vagamon.';
    description =
      'Expect vibrant festive energy and higher tourist footfall at popular local viewpoints. Our secluded private villa ensures complete quiet and exclusivity during your stay.';
  }

  const drivingAdvisory = hasMonsoon
    ? 'Highland Ghat Road Safety: Thick fog and passing monsoon showers are common along the Erattupetta-Vagamon and Thodupuzha ghat routes. We strongly advise planning your journey to reach Cloud Heaven Villa before 5:30 PM for daylight mountain navigation.'
    : 'Scenic Mountain Drive: Hill routes are clear and scenic. Expect slightly higher weekend traffic near Vagamon Pine Forest and town junctions. Our team can share live road navigation via WhatsApp.';

  const poolAdvisory = hasMonsoon
    ? 'Private Infinity Pool: The cliffside infinity pool is fully treated and operational with panoramic mist views. As pool water is sourced from fresh mountain springs, water temperature will be cool (~16°C–18°C). Warm plush bathrobes and hot tea/coffee service are provided.'
    : 'Private Infinity Pool: Excellent pool conditions with clear mountain views. Perfect for morning laps and sunset swims over the mist-covered valleys.';

  const villaReadiness = [
    '24/7 Heavy-Duty Inverter Power Backup for uninterrupted lighting and Wi-Fi during any grid weather cuts',
    'Instant Hot Water Geysers in every ensuite luxury bathroom',
    'All-weather indoor recreational games (carrom, board games, cards) and high-speed Wi-Fi',
    'Covered outdoor dining & viewing balconies to enjoy mountain rain without getting drenched',
    'On-site resident caretaker & kitchen team for freshly prepared hot Kerala delicacies, tea & snacks',
  ];

  const packingList = hasMonsoon
    ? [
        'Compact umbrella & waterproof windcheater / rain jacket',
        'Shoes with strong anti-skid rubber grips for wet stone paths',
        'Warm layer (fleece / light sweater) for cool misty evenings (15°C – 18°C)',
        'Waterproof pouch for mobile phones & camera gear',
        'Personal medications and mosquito/bug repellent for outdoor nature trails',
      ]
    : [
        'Light, comfortable cottons for day excursions and nature walks',
        'Light jacket or shawl for crisp highland night breezes (14°C – 18°C)',
        'Sunscreen, sunglasses & sun hat for open valley walks and paragliding',
        'Swimwear for private infinity pool sessions',
        'Camera or binoculars for expansive mountain viewpoints',
      ];

  let liveForecastNote: string | undefined;
  if (typeof livePrecipitationChance === 'number' && livePrecipitationChance > 0) {
    if (livePrecipitationChance >= 50) {
      liveForecastNote = `Live Vagamon Forecast Sync: Elevated precipitation expected around check-in (~${livePrecipitationChance}% rain probability). Heavy mist and lush showers anticipated.`;
    } else if (livePrecipitationChance >= 20) {
      liveForecastNote = `Live Vagamon Forecast Sync: Moderate shower probability (~${livePrecipitationChance}% chance of passing hill drizzle).`;
    }
  }

  return {
    type: alertType,
    severity,
    badge,
    title,
    headline,
    description,
    matchedSeasons: matched,
    drivingAdvisory,
    poolAdvisory,
    villaReadiness,
    packingList,
    liveForecastNote,
  };
}
