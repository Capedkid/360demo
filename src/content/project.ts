// ─────────────────────────────────────────────────────────────────────────────
//  PROJECT CONTENT
//  Every text, image, panorama and video on the site is defined here.
//  Media paths are relative to the /media folder (see README → "Updating content").
// ─────────────────────────────────────────────────────────────────────────────

export type GalleryItem = { image: string; caption: string };

export type TourHotspot =
  | { type: "scene"; to: string; label: string; yaw: number; pitch: number }
  | { type: "info"; label: string; yaw: number; pitch: number };

export type TourScene = {
  id: string;
  title: string;
  level: string;
  panorama: string;
  /** Where the camera looks when the scene opens (degrees) */
  yaw?: number;
  pitch?: number;
  hotspots: TourHotspot[];
};

export type Film = {
  title: string;
  description: string;
  video: string;
  /** Optional short muted loop shown on the card */
  preview?: string;
  poster: string;
  /** Shown on the card, e.g. "0:20" */
  duration?: string;
};

export type Material = { image: string; name: string; spec: string };

export const project = {
  name: "Willow Bank Residence",
  shortName: "Willow Bank",
  kicker: "Private Residence · Riverside",
  tagline: "A two-storey family house shaped by the river, the lawn and the long summer light.",
  studio: "Your Studio",
  contactEmail: "hello@yourstudio.com",
  contactPhone: "+00 000 000 000",

  hero: {
    image: "exterior/garden-elevation.jpg",
    alt: "Garden elevation of Willow Bank Residence across the lawn",
  },

  overview: {
    lead:
      "Set on a gently sloping riverside plot, Willow Bank is composed as a series of low, overlapping volumes in pale porcelain and thermo-larch that open the house to the garden and frame the water from every main room.",
    body: [
      "The ground floor is one continuous living landscape: a double-height hall with a cantilevered oak stair, an open kitchen arranged around a single granite island, and a covered terrace that extends the living room into the garden.",
      "Upstairs, four bedrooms sit beneath deep timber eaves that shade the glazing in summer and admit low winter sun. Ribbon windows, exposed concrete and oak recur throughout, giving the house a calm, consistent material language.",
    ],
    facts: [
      { label: "Location", value: "Riverside estate" },
      { label: "Site area", value: "2,350 m²" },
      { label: "Floor area", value: "486 m²" },
      { label: "Levels", value: "2 + roof terrace" },
      { label: "Bedrooms", value: "4 en-suite" },
      { label: "Status", value: "Completed 2025" },
    ],
    images: ["interior/double-height-living.jpg", "exterior/pool-terrace.jpg"],
  },

  exterior: {
    title: "Exterior",
    heading: "Quiet volumes, warm timber",
    intro:
      "Porcelain panels and open-joint thermo-larch alternate across the elevations, with deep eaves and a raised pool terrace anchoring the house to the lawn.",
    items: [
      { image: "exterior/garden-elevation.jpg", caption: "Garden elevation: the living wing opens fully onto the lawn" },
      { image: "exterior/pool-terrace.jpg", caption: "South-west corner with the raised pool terrace" },
      { image: "exterior/entrance-court.jpg", caption: "Entrance court and double-height porch" },
      { image: "exterior/east-corner.jpg", caption: "East corner: porcelain and thermo-larch volumes" },
      { image: "exterior/north-wing.jpg", caption: "North wing with ribbon windows and deep eaves" },
      { image: "exterior/riverside-walk.jpg", caption: "Riverside walk along the eastern boundary" },
      { image: "exterior/street-front.jpg", caption: "Street frontage" },
      { image: "exterior/garden-pavilion.jpg", caption: "Garden pavilion overlooking the river" },
    ] satisfies GalleryItem[],
  },

  interior: {
    title: "Interior",
    heading: "Light, concrete and oak",
    intro:
      "A restrained palette of white plaster, board-marked concrete and natural oak lets daylight and the river views do the work.",
    items: [
      { image: "interior/double-height-living.jpg", caption: "Double-height living hall with cantilevered stair" },
      { image: "interior/covered-terrace.jpg", caption: "Covered terrace opening onto the river" },
      { image: "interior/kitchen-island.jpg", caption: "Kitchen arranged around a single granite island" },
      { image: "interior/stair-and-fireplace.jpg", caption: "Stair, fireplace wall and exposed concrete" },
      { image: "interior/kitchen-gallery.jpg", caption: "Kitchen gallery and dining axis" },
      { image: "interior/living-lake-view.jpg", caption: "Living room with river views" },
      { image: "interior/garden-room.jpg", caption: "Garden room with full-height glazing" },
      { image: "interior/lake-bedroom.jpg", caption: "Bedroom framing the water" },
      { image: "interior/master-bath.jpg", caption: "Master bathroom with freestanding bath" },
    ] satisfies GalleryItem[],
  },

  tour: {
    title: "360° Tour",
    heading: "Step inside",
    intro:
      "Drag to look around, use the arrows to move between rooms, or open full screen. On a phone, tap the compass to look around by moving your device.",
    firstScene: "living-hall",
    scenes: [
      {
        id: "living-hall",
        title: "Living Hall",
        level: "Ground floor",
        panorama: "panoramas/living-hall.jpg",
        hotspots: [
          { type: "scene", to: "master-suite", label: "Master Suite", yaw: -117, pitch: -6 },
          { type: "scene", to: "roof-terrace", label: "Roof Terrace", yaw: 30, pitch: -10 },
          { type: "info", label: "Fireplace surround in honed limestone", yaw: -38, pitch: -9 },
        ],
      },
      {
        id: "master-suite",
        title: "Master Suite",
        level: "First floor",
        panorama: "panoramas/master-suite.jpg",
        hotspots: [
          { type: "scene", to: "living-hall", label: "Living Hall", yaw: -178, pitch: -12 },
          { type: "scene", to: "master-bath", label: "Master Bath", yaw: 115, pitch: -5 },
          { type: "info", label: "Steel-framed glazing with 270° views", yaw: -40, pitch: 12 },
        ],
      },
      {
        id: "master-bath",
        title: "Master Bath",
        level: "First floor",
        panorama: "panoramas/master-bath.jpg",
        hotspots: [
          { type: "scene", to: "master-suite", label: "Master Suite", yaw: 119, pitch: -12 },
          { type: "info", label: "Frameless roof light above the bath", yaw: 15, pitch: 24 },
        ],
      },
      {
        id: "roof-terrace",
        title: "Roof Terrace",
        level: "Roof",
        panorama: "panoramas/roof-terrace.jpg",
        hotspots: [
          { type: "scene", to: "living-hall", label: "Living Hall", yaw: -36, pitch: -8 },
          { type: "info", label: "Frameless glass balustrade", yaw: 140, pitch: -6 },
        ],
      },
    ] satisfies TourScene[],
  },

  films: {
    title: "Films",
    heading: "Moving through the house",
    intro: "Short animation previews. Select a film to watch it full screen.",
    items: [
      {
        title: "Arrival Sequence",
        description: "From the garden to the covered terrace",
        video: "videos/approach.mp4",
        preview: "videos/approach-preview.mp4",
        poster: "videos/approach-poster.jpg",
        duration: "0:20",
      },
      {
        title: "Interior Walkthrough",
        description: "Living hall, stair and gallery",
        video: "videos/interior-walkthrough.mp4",
        preview: "videos/interior-walkthrough-preview.mp4",
        poster: "videos/interior-walkthrough-poster.jpg",
        duration: "0:12",
      },
      {
        title: "Living Spaces",
        description: "Lounge and dining by the window wall",
        video: "videos/living-spaces.mp4",
        preview: "videos/living-spaces-preview.mp4",
        poster: "videos/living-spaces-poster.jpg",
        duration: "0:10",
      },
      {
        title: "Façade Study",
        description: "Rising study of the street elevation",
        video: "videos/facade-study.mp4",
        preview: "videos/facade-study-preview.mp4",
        poster: "videos/facade-study-poster.jpg",
        duration: "0:07",
      },
    ] satisfies Film[],
  },

  details: {
    title: "Drawings & Details",
    heading: "Plan, materials, craft",
    intro:
      "The ground floor is organised along a single axis from the entrance court to the garden. Select a room in the schedule to find it on the plan.",
    materials: [
      { image: "materials/larch-cladding.jpg", name: "Thermo-larch", spec: "Façade · open-joint boards, oiled" },
      { image: "materials/porcelain-panels.jpg", name: "Porcelain panels", spec: "Façade · 1200 × 600, ventilated" },
      { image: "materials/exposed-concrete.jpg", name: "Exposed concrete", spec: "Stair core · board-marked" },
      { image: "materials/natural-oak.jpg", name: "Natural oak", spec: "Joinery · brushed, matt lacquer" },
      { image: "materials/smoked-oak-floor.jpg", name: "Smoked oak", spec: "Bedrooms · wide plank" },
      { image: "materials/glass-mosaic.jpg", name: "Glass mosaic", spec: "Pool · 25 × 25 mm" },
    ] satisfies Material[],
    items: [
      { image: "details/floating-stair.jpg", caption: "Cantilevered oak treads against board-marked concrete" },
      { image: "details/pool-steps.jpg", caption: "Glass-mosaic pool steps and timber deck" },
      { image: "details/freestanding-bath.jpg", caption: "Sculpted freestanding bath" },
      { image: "details/granite-island.jpg", caption: "Granite island and natural-oak joinery" },
    ] satisfies GalleryItem[],
  },

  credits: [
    "Photography: Max Vakhtbovych via Pexels",
    "Films: Kindel Media and Hamza Awan via Pexels",
    "360° panoramas: Poly Haven (CC0)",
  ],
};

export type Project = typeof project;
