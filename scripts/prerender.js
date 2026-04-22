import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// If dist doesn't exist, exit quietly (vite probably failed)
if (!fs.existsSync(DIST_DIR)) {
  console.error("No dist directory found. Make sure Vite builds first.");
  process.exit(0);
}

const templatePath = path.join(DIST_DIR, 'index.html');
const baseHtml = fs.readFileSync(templatePath, 'utf8');

const SEO_ROUTES = [
  {
    path: '/',
    title: 'Snarky A$$ Apparel | Snarky T-Shirts, Personalized Gifts & Custom Photo Blankets',
    desc: 'Shop snarky t-shirts, personalized gifts with photos, custom blankets, mugs & greeting cards. Bold designs for people who speak their mind. Free shipping over $50.',
    body: `<h1>Snarky A$$ Apparel</h1>
    <p>Shop snarky t-shirts, personalized gifts with photos, custom blankets, mugs, and greeting cards. Bold designs for people who speak their mind.</p>
    <h2>Main Collections</h2>
    <ul>
      <li><a href="/collections">All Collections</a></li>
      <li><a href="/shirts">Funny T-Shirts & Sarcastic Shirts</a></li>
      <li><a href="/hoodies">Snarky Hoodies</a></li>
      <li><a href="/blankets">Custom Photo Blankets</a></li>
      <li><a href="/mugs">Snarky Coffee Mugs</a></li>
      <li><a href="/tote-bags">Custom Tote Bags</a></li>
      <li><a href="/greeting-cards">Snarky Greeting Cards</a></li>
    </ul>`
  },
  {
    path: '/shirts',
    title: 'Funny & Sarcastic T-Shirts | Snarky A$$ Apparel',
    desc: 'Shop high-quality sarcastic and funny t-shirts. Graphic tees with an attitude for people who refuse to wear boring clothes.',
    body: `<h1>Funny & Sarcastic T-Shirts</h1>
    <p>Shop high-quality sarcastic and funny t-shirts. Graphic tees with an attitude for people who refuse to wear boring clothes.</p>
    <p>Our funny shirts are printed on premium, heavy-weight cotton. They make the perfect gift for sarcastic friends or coworkers.</p>
    <ul><li><a href="/collections">Back to Collections</a></li><li><a href="/">Home</a></li></ul>`
  },
  {
    path: '/blankets',
    title: 'Custom Photo Blankets & Personalized Gifts | Snarky A$$ Apparel',
    desc: 'Design luxurious personalized photo blankets. Premium fleece and sherpa throws make the perfect custom gift for anyone you actually tolerate.',
    body: `<h1>Custom Personalized Photo Blankets</h1>
    <p>Design luxurious personalized photo blankets. Premium fleece and sherpa throws make the perfect custom gift for anyone you actually tolerate.</p>
    <p>Upload a funny photo or a heartfelt memory, and we will print it edge-to-edge.</p>
    <ul><li><a href="/collections">Back to Collections</a></li><li><a href="/">Home</a></li></ul>`
  },
  {
    path: '/hoodies',
    title: 'Snarky Graphic Hoodies | Funny Apparel | Snarky A$$ Apparel',
    desc: 'Premium cozy hoodies printed with sarcastic, snarky, and hilarious designs. Perfect for staying warm while keeping people away.',
    body: `<h1>Snarky & Sarcastic Graphic Hoodies</h1>
    <p>Premium cozy hoodies printed with sarcastic, snarky, and hilarious designs. Perfect for staying warm while keeping people away. Thick, warm, and highly offensive.</p>
    <ul><li><a href="/collections">Back to Collections</a></li><li><a href="/">Home</a></li></ul>`
  },
  {
    path: '/mugs',
    title: 'Funny Coffee Mugs | Snarky Office Gifts | Snarky A$$ Apparel',
    desc: 'Start your morning with pure snark. Shop funny, sarcastic premium ceramic coffee mugs for yourself or a coworker who desperately needs caffeine.',
    body: `<h1>Funny & Sarcastic Coffee Mugs</h1>
    <p>Start your morning with pure snark. Shop funny, sarcastic premium ceramic coffee mugs in 11oz and 15oz sizes.</p>
    <ul><li><a href="/category/funny-coworker-gifts">Funny Coworker Gifts</a></li><li><a href="/collections">Back to Collections</a></li></ul>`
  },
  {
    path: '/blog',
    title: 'Snarky A$$ Blog | Gift Guides & Humor | Snarky A$$ Apparel',
    desc: 'The official blog for snarky apparel, funny gift guides, and brutally honest life advice. Read our top picks for white elephant gifts, office parties, and more.',
    body: `<h1>The Snarky A$$ Blog: Gift Guides & Bad Advice</h1>
    <p>The official blog for snarky apparel, funny gift guides, and brutally honest life advice.</p>
    <ul><li><a href="/category/gag-gifts">Gag Gifts</a></li><li><a href="/category/white-elephant-gifts">White Elephant Gifts</a></li></ul>`
  },
  {
    path: '/faq',
    title: 'FAQ & Shipping | Snarky A$$ Apparel',
    desc: 'Find answers to shipping times, sizing charts, returns, and how to customize our personalized gifts. Everything you need to know before buying.',
    body: `<h1>Frequently Asked Questions & Support</h1>
    <p>Find answers to shipping times, sizing charts, returns, and how to customize our personalized gifts.</p>
    <p>We use US-based printing facilities for maximum speed and quality control.</p>`
  },
  {
    path: '/collections',
    title: 'All Snarky Collections | Custom Gag Gifts & Humor | Snarky A$$ Apparel',
    desc: 'Browse our entire catalog of funny gifts, ranging from custom photo blankets and Mother\'s Day gifts to brutally honest gag gifts for coworkers.',
    body: `<h1>All Snarky Collections & Gift Guides</h1>
    <p>Browse our entire catalog of funny gifts, gag gifts, custom apparel, and personalized items.</p>
    <ul><li><a href="/category/gag-gifts">Gag Gifts</a></li><li><a href="/shirts">Funny Shirts</a></li><li><a href="/blankets">Photo Blankets</a></li></ul>`
  },
  {
    path: '/category/gag-gifts',
    title: 'Hilarious Gag Gifts | Pranks & Funny Presents | Snarky A$$ Apparel',
    desc: 'Shop premium gag gifts that are actually funny, not just cheap trash. Sarcastic mugs, funny tees, and custom items for your next party.',
    body: `<h1>Premium Gag Gifts That Get Actual Laughs</h1>
    <p>Shop premium gag gifts that are actually funny, not just cheap trash. Give a gift that will actually be used (and laughed at) long after the party is over.</p>`
  },
  {
    path: '/category/white-elephant-gifts',
    title: 'White Elephant Gifts | Best Exchange Presents | Snarky A$$ Apparel',
    desc: 'Win the holiday party with the best white elephant gifts under $25 and $50. Snarky, sarcastic items everyone will fight to steal.',
    body: `<h1>The Best White Elephant Gifts People Actually Want</h1>
    <p>Win the holiday party with the best white elephant gifts under $25 and $50. Snarky, sarcastic items everyone will fight to steal instead of throwing away.</p>`
  },
  {
    path: '/category/funny-coworker-gifts',
    title: 'Funny Gifts for Coworkers | Office Gag Gifts | Snarky A$$ Apparel',
    desc: 'The ultimate collection of funny coworker gifts. Sarcastic mugs, snarky tote bags, and desk-appropriate humor to survive the 9-to-5.',
    body: `<h1>Funny Gifts for Coworkers (HR Approved-ish)</h1>
    <p>Half your meetings could have been an email. Help your favorite coworker survive the corporate grind with our snarky mugs and apparel.</p>`
  },
  {
    path: '/category/funny-gifts-under-25',
    title: 'Funny Gifts Under $25 | Cheap Gag Gifts | Snarky A$$ Apparel',
    desc: 'Premium snark on a budget. Shop funny, high-quality sarcastic gifts under $25, including funny mugs, greeting cards, and tote bags.',
    body: `<h1>Hilarious Gifts Under $25 That Don't Look Cheap</h1>
    <p>You don't need to spend a fortune to be the funniest person in the room. Our collection under $25 includes high-quality mugs, greeting cards, and tote bags.</p>`
  },
  {
    path: '/category/funny-gifts',
    title: 'Best Funny Gifts | Sarcastic Presents | Snarky A$$ Apparel',
    desc: 'Shop the finest collection of genuinely funny gifts. Whether you need a sassy birthday present or a sarcastic holiday gift, we have you covered.',
    body: `<h1>Genuinely Funny Gifts for Hard-to-Please People</h1>
    <p>Finding the perfect gift shouldn't be boring. Our funny gifts are designed to bypass the small talk and deliver pure, unfiltered humor.</p>`
  },
  {
    path: '/category/custom-gifts-for-men',
    title: 'Funny & Custom Gifts for Men | Personalized Ideas | Snarky A$$ Apparel',
    desc: 'Men are famously impossible to shop for. Ditch the boring tie and get him a custom snarky t-shirt or personalized gag gift that matches his chaotic energy.',
    body: `<h1>Custom & Funny Gifts for Men Who Want Nothing</h1>
    <p>Men are famously impossible to shop for. Instead of getting him another boring tie or expensive tech gadget he won't use, get him something that actually matches his personality.</p>`
  },
  {
    path: '/category/custom-mothers-day-gifts',
    title: 'Custom Mother\'s Day Gifts | Funny Mom Gifts | Snarky A$$ Apparel',
    desc: 'Ditch the generic flowers. Treat Mom to premium custom Mother\'s day gifts, sarcastic mom apparel, and beautiful custom photo blankets.',
    body: `<h1>Custom Mother's Day Gifts (Because You Were an Awful Teenager)</h1>
    <p>Being a mom requires surviving on caffeine, chaos, and a sharp sense of humor. Celebrate her survival skills with our premium custom Mother's Day gifts.</p>`
  },
  {
    path: '/category/personalized-blanket-gifts',
    title: 'Personalized Custom Blankets | Perfect Photo Gifts | Snarky A$$ Apparel',
    desc: 'Create luxurious personalized fleece and sherpa blankets printed edge-to-edge with your favorite photos. Warm, cozy, and completely custom.',
    body: `<h1>Personalized Photo Blankets & Custom Throws</h1>
    <p>Nothing says 'I put effort into this' quite like a personalized blanket gift. Whether you're plastering an embarrassing photo of your best friend across 60 inches of fleece, or making a heartfelt pet memorial throw.</p>`
  }
];

function extractBetween(str, start, end) {
  const i1 = str.indexOf(start);
  if (i1 === -1) return null;
  const i2 = str.indexOf(end, i1 + start.length);
  if (i2 === -1) return null;
  return {
    prefix: str.substring(0, i1),
    content: str.substring(i1 + start.length, i2),
    suffix: str.substring(i2 + end.length)
  };
}

SEO_ROUTES.forEach(route => {
  let outputHtml = baseHtml;

  // 1. Replace Title
  outputHtml = outputHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${route.title}</title>`
  );

  // 2. Replace Meta Description
  outputHtml = outputHtml.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
    `<meta name="description" content="${route.desc}">`
  );

  // 3. Replace the entire crawler block content with unique body content
  outputHtml = outputHtml.replace(
    /<div style="position: absolute;[^>]+>([\s\S]*?)<\/div>/,
    `<div style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">\n      ${route.body}\n    </div>`
  );

  // For non-root routes, we generate the directory and write index.html
  if (route.path !== '/') {
    const routeDir = path.join(DIST_DIR, ...route.path.split('/').filter(Boolean));
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), outputHtml, 'utf8');
    console.log(`Prerendered: ${route.path}/index.html`);
  } else {
    // For root, we overwrite the base index.html
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), outputHtml, 'utf8');
    console.log(`Prerendered: / (Root)`);
  }
});

console.log("Static prerendering SEO complete.");
