/* ------------------------------------------------------------------
   All site copy & data in one place.
   Original, placeholder content for a fictional atelier — LUMÉRA.
   ------------------------------------------------------------------ */

export const SALON = {
  name: "LUMÉRA",
  tagline: "Hair & Beauty Atelier",
  heroHeadline: "Step into the ritual.",
  bookingUrl: "https://cal.com/lumera-atelier/appointment", // placeholder booking link
  address: {
    line1: "14 Marlowe Court",
    line2: "Fitzrovia, London W1T 3AB",
  },
  phone: "+44 20 7946 0182",
  email: "atelier@lumera.example",
  hours: [
    { day: "Tue – Wed", time: "10:00 — 19:00" },
    { day: "Thursday", time: "10:00 — 21:00" },
    { day: "Fri – Sat", time: "09:00 — 20:00" },
    { day: "Sun – Mon", time: "By appointment" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Journal", href: "#" },
  ],
};

/* Section 3 — The Ritual: one line of care-and-craft copy per beat. */
export const RITUAL_BEATS: { index: string; line: string }[] = [
  { index: "01", line: "We begin in quiet — a consultation before a single strand is touched." },
  { index: "02", line: "Warm water, slow hands. The scalp softens; tension lets go." },
  { index: "03", line: "Colour is mixed by eye, weighed to the gram, warmed to the skin." },
  { index: "04", line: "Light finds the cut. Every section falls the way it was meant to." },
  { index: "05", line: "A final gloss — and the surface begins to catch the room." },
];

/* Section 5 — Signature Services */
export const SERVICES: {
  name: string;
  copy: string;
  from?: string;
  tone: "rose" | "emerald" | "ink";
}[] = [
  {
    name: "The Signature Cut",
    copy: "Read to your hair's natural fall, shaped to grow out beautifully.",
    from: "from £95",
    tone: "rose",
  },
  {
    name: "Luminous Colour",
    copy: "Hand-painted dimension and gloss, mixed to your skin's warmth.",
    from: "from £180",
    tone: "emerald",
  },
  {
    name: "The Ritual Treatment",
    copy: "A restorative bond and scalp ceremony — forty minutes of quiet.",
    from: "from £70",
    tone: "ink",
  },
  {
    name: "Bridal & Occasion",
    copy: "Styling, trial, and a calm morning-of choreography for your day.",
    from: "on request",
    tone: "rose",
  },
];

/* The Shelf — take-home retail products */
export const PRODUCTS: {
  name: string;
  copy: string;
  from: string;
  tone: "rose" | "emerald" | "ink";
}[] = [
  {
    name: "Gloss Drops Serum",
    copy: "A weightless finishing serum for mirror shine and slip.",
    from: "£38",
    tone: "rose",
  },
  {
    name: "Bond Repair Masque",
    copy: "Weekly restoration that rebuilds colour-treated hair.",
    from: "£46",
    tone: "emerald",
  },
  {
    name: "Scalp Ritual Oil",
    copy: "A pre-wash ceremony that softens, calms and grounds.",
    from: "£34",
    tone: "ink",
  },
];

/* Section 8 — Reviews / social proof */
export const REVIEWS: { quote: string; author: string }[] = [
  { quote: "I have never felt so at ease in a chair. I left lighter than I arrived.", author: "Amara R." },
  { quote: "The colour is still catching the light three weeks on. Uncanny.", author: "Priya N." },
  { quote: "It doesn't feel like an appointment. It feels like being looked after.", author: "Elise M." },
  { quote: "They cut for how I actually live. Best decision I've made for my hair.", author: "Jonah T." },
  { quote: "Every detail considered. The tea, the light, the hands. Faultless.", author: "Sofia D." },
];

/* Section 9 — services shown in the booking selector */
export const BOOKING_SERVICES = [
  "The Signature Cut",
  "Luminous Colour",
  "The Ritual Treatment",
  "Bridal & Occasion",
  "Consultation only",
];

/* Nav anchors */
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "The Ritual", href: "#ritual" },
  { label: "Services", href: "#services" },
  { label: "The Craft", href: "#craft" },
  { label: "Visit", href: "#footer" },
];
