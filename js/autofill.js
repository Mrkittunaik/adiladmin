/* Auto-details by category. Used when the admin leaves fields empty (description, short description, material, colour, tags).
   Matches on the category name (and its parent name). Edit the text below any time. */
const AUTO_DEFAULT_COLOR = 'Black';
const AUTO_TEMPLATES = [
  { re: /chair|stool|seat/i, material: 'Breathable mesh back, high-density foam seat, nylon base',
    short: 'Ergonomic, comfortable chair with strong build, smooth movement and all-day support.',
    tags: 'chair, office chair, ergonomic chair, md chair, work from home',
    desc: `【 Ultimate Comfort with Lumbar Support 】Designed for long working hours, the backrest follows the natural curve of your spine, reducing back strain and encouraging a healthy sitting posture.
* 【 Adjustable Armrests 】Armrests give steady support to your arms and shoulders while typing, reading or relaxing, so you stay comfortable through the day.
* 【 Breathable Mesh Back 】The mesh back lets air flow freely, preventing heat build-up and keeping you cool in warm weather and closed rooms. It is durable and supportive.
* 【 Thick Cushioned Seat 】High-density foam seat keeps its shape and stays comfortable for hours without making you tired.
* 【 Adjustable Height & Headrest 】Raise or lower the seat so your feet rest flat on the floor, and adjust the headrest to support your neck and head for a personalised fit.
* 【 Smooth & Stable Base 】Heavy-duty base with smooth-rolling castors for easy movement and a firm, safe seating experience.` },
  { re: /table|desk/i, material: 'Engineered wood with scratch-resistant laminate, powder-coated metal legs',
    short: 'Sturdy, spacious table with a smooth finish, made for daily office and home use.',
    tags: 'table, desk, office table, work table',
    desc: `【 Spacious Work Surface 】Generous top gives plenty of room for a computer, files and daily essentials.
* 【 Strong & Stable Build 】Solid frame and legs stay steady and wobble-free, even with heavy use.
* 【 Scratch & Stain Resistant 】Smooth laminate finish is easy to wipe clean and keeps looking good for years.
* 【 Clean, Modern Look 】Simple design that fits offices, homes, study rooms and reception areas.
* 【 Easy Assembly 】Comes with all required fittings and a simple assembly guide.` },
  { re: /sofa|couch|lounge|recliner/i, material: 'Soft fabric / leatherette upholstery, hardwood frame, high-density foam',
    short: 'Plush, comfortable sofa with a strong frame and a stylish look for your living space.',
    tags: 'sofa, couch, living room, seating',
    desc: `【 Plush Comfort 】High-density foam cushions with soft upholstery give deep, lasting comfort.
* 【 Strong Hardwood Frame 】Solid frame is built to handle daily family use without sagging.
* 【 Elegant Design 】Clean lines and a neat finish that suit any living room, lounge or waiting area.
* 【 Easy to Maintain 】Upholstery is easy to wipe and keep clean.
* 【 Stable Legs 】Sturdy legs protect your floor and keep the sofa firmly in place.` },
  { re: /bed|mattress|cot/i, material: 'Engineered wood / solid wood frame, hardwood slats',
    short: 'Strong, good-looking bed with a firm base for sound and comfortable sleep.',
    tags: 'bed, bedroom, furniture',
    desc: `【 Firm & Supportive Base 】Strong slats give even support for a good night's sleep.
* 【 Sturdy Frame 】Solid frame and headboard stay stable and quiet over time.
* 【 Smart Finish 】Smooth, durable finish that brightens any bedroom.
* 【 Easy Assembly 】All fittings are included with a simple assembly guide.` },
  { re: /wardrobe|almirah|cabinet|storage|shelf|rack|drawer|file|locker|bookcase|book/i, material: 'Engineered wood with laminate finish, metal handles',
    short: 'Roomy, well-built storage unit that keeps your space neat and organised.',
    tags: 'storage, cabinet, shelf, organiser',
    desc: `【 Plenty of Storage 】Well-planned shelves and compartments keep files, clothes and daily items neatly organised.
* 【 Strong & Durable 】Thick panels and strong fittings carry heavy loads without bending.
* 【 Smooth Laminate Finish 】Scratch-resistant and easy to clean.
* 【 Smooth Doors & Drawers 】Quality handles and hinges for easy, quiet operation.
* 【 Easy Assembly 】Includes all fittings and a simple assembly guide.` },
];
const AUTO_GENERIC = { material: 'Engineered wood & powder-coated metal', short: 'Quality furniture built for strength, comfort and long-lasting daily use.', tags: 'furniture, home, office',
  desc: `【 Built to Last 】Made with strong, durable materials that handle everyday use.
* 【 Comfortable & Practical 】Thoughtful design that fits comfortably in homes and offices.
* 【 Clean, Modern Finish 】Smooth finish that is easy to clean and looks good in any space.
* 【 Easy Assembly 】Includes all fittings and a simple assembly guide.` };
function autoDetails(catName) {
  const t = AUTO_TEMPLATES.find(x => x.re.test(catName || '')) || AUTO_GENERIC;
  return { description: t.desc, shortDescription: t.short, material: t.material, color: AUTO_DEFAULT_COLOR, tags: t.tags };
}
