import { eq } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";

const images = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
];

const topics = [
  ["A Softer Start: The Bedroom Rituals That Make Mornings Better", "Bedroom", "A bedroom should lower your shoulders the moment you walk in. These small rituals bring softness, order, and a little more quiet to the first minutes of the day.", "c79a72"],
  ["The Warm Glow Edit: Lighting That Changes a Room", "Lighting", "The best lighting is not decoration added at the end. It is the atmosphere everything else in a room has been waiting for.", "a9836e"],
  ["A Better Shelf: Styling Books, Objects, and Everyday Beauty", "Organization", "Open shelving works hardest when it feels collected rather than crowded. Here is how to give your favorite things room to breathe.", "7d8f83"],
  ["The Living Room Reset: Five Pieces With Staying Power", "Living Room", "When a living room feels just slightly off, it rarely needs a full overhaul. A few grounded choices can bring the whole room back into focus.", "b08c72"],
  ["Sunday Kitchen: Tools Worth Leaving on the Counter", "Kitchen", "A kitchen can be useful and still feel considered. These are the pieces we like enough to keep in view.", "8b7765"],
  ["Underfoot: The Case for a More Colorful Rug", "Rugs", "A rug does more than soften a floor. It can gather a room, add a point of view, and make the furniture feel like it belongs together.", "b57c76"],
  ["Outdoor Rooms: A Small Patio With a Big Point of View", "Outdoor", "A few square meters are enough for an outdoor room with a real sense of arrival. Start with texture, shade, and somewhere to linger.", "78929a"],
  ["Quiet Corners: Designing a Reading Nook You Will Actually Use", "Decor & Pillows", "The most loved spaces in a home are often the ones that ask very little of you. A chair, a lamp, and the permission to stay awhile.", "8b806c"],
  ["The Collected Entryway: A Landing Place for Real Life", "Organization", "An entryway does not need to be perfect. It needs to make coming home feel easier, with a place for the things that follow you through the day.", "9a806e"],
  ["Material Study: Why Oak and Linen Always Feel Right", "Furniture", "Some combinations keep returning because they know how to make a room feel grounded without making it feel heavy.", "a77d5c"],
  ["A Table for Two: Making Weeknight Dinners Feel Special", "Kitchen", "The ritual is small, but the effect is not. A few tactile pieces can turn an ordinary dinner into a reason to slow down.", "c08770"],
  ["The Pillow Mix That Makes a Sofa Feel Finished", "Decor & Pillows", "The right pillow mix is less about matching and more about rhythm—something nubby, something faded, something that catches the light.", "9c7780"],
  ["Furniture With Patina: Pieces That Improve With Time", "Furniture", "A home becomes yours through the marks it gathers. These are the pieces that invite a little wear and reward you for living with them.", "7e8e81"],
  ["A More Restful Nightstand", "Bedroom", "The nightstand is a tiny landscape, and it sets the tone for the last minutes of the day. Keep only what helps you soften the edges.", "8c8175"],
  ["The Art of the Empty Wall", "Decor & Pillows", "Leaving a wall quiet can be a design decision, not a gap to fill. Here is how to let the architecture do some of the talking.", "6f8790"],
] as const;

const realProducts = [
  {
    name: "KALLAX shelf unit, white, 30 1/8x57 5/8 in",
    material: "Fibreboard and particleboard with paper foil",
    image: images[2],
    description: "An open storage unit that keeps books, baskets, and everyday objects visible without making a small room feel busy.",
    amazon_link: "https://www.ikea.com/us/en/p/kallax-shelf-unit-white-80275887",
  },
  {
    name: "POÄNG armchair, birch veneer/Hillared beige",
    material: "Layer-glued birch veneer and polyester fabric",
    image: images[0],
    description: "A real IKEA classic with a curved bentwood frame and a generous seat for reading, resting, or pulling into conversation.",
    amazon_link: "https://www.ikea.com/us/en/p/poaeng-armchair-birch-veneer-hillared-beige-s19305925",
  },
  {
    name: "RÅSKOG utility cart, gray-green",
    material: "Powder-coated steel",
    image: images[5],
    description: "A compact rolling cart that adds useful storage beside a sofa, desk, or kitchen counter without claiming much floor space.",
    amazon_link: "https://www.ikea.com/us/en/p/raskog-utility-cart-gray-green-50591769",
  },
  {
    name: "STOENSE rug, low pile, off-white",
    material: "Polypropylene pile with synthetic rubber backing",
    image: images[4],
    description: "A soft low-pile base that quietly gathers the furniture and makes a compact sitting area feel deliberate.",
    amazon_link: "https://www.ikea.com/us/en/p/stoense-rug-low-pile-off-white-20635449",
  },
] as const;

function makeProducts(imageIndex: number, subject: string) {
  return [0, 1, 2].map((offset) => {
    const product = realProducts[(imageIndex + offset) % realProducts.length];
    return {
      ...product,
      description: `${product.description} A considered ${subject.toLowerCase()} find chosen for rooms that need to work hard and still feel good.`,
    };
  });
}

export async function seedPosts(): Promise<void> {
  const existing = await db.select().from(postsTable);
  if (existing.length === 0) {
    await db.insert(postsTable).values(
      topics.map(([title, category, introText, accentColor], index) => ({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        category: category === "Living Room" ? "Living Rooms" : category,
        accentColor,
        introText,
        coverImage: images[index % images.length],
        products: makeProducts(index, category),
        conclusionText: "The goal is not to make a room look finished. It is to make it feel like it has been gently lived in, with pieces that support the way you move through your days.",
      })),
    );
  }

  const smallSpacesSlug = "small-space-real-life-an-ikea-edit-for-the-living-room";
  const hasSmallSpacesPost = existing.some((post) => post.slug === smallSpacesSlug);
  if (!hasSmallSpacesPost) {
    await db.insert(postsTable).values({
      title: "Small Space, Real Life: An IKEA Edit for the Living Room",
      slug: smallSpacesSlug,
      category: "Small Spaces",
      accentColor: "d8a33e",
      introText: "A small living room does not need fewer ideas. It needs pieces that earn their footprint, from the real KALLAX shelf unit that carries storage vertically to the POÄNG armchair that gives one corner a proper purpose.",
      coverImage: images[1],
      products: [...realProducts],
      conclusionText: "These are real, currently listed IKEA pieces, but the larger lesson is about editing: choose storage that goes up, seating that can move, and a rug that makes the whole room feel like one place. Small is not a limitation when every material and object has a job.",
    });
  }

  for (const [index, [title, category]] of topics.entries()) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const post = existing.find((item) => item.slug === slug);
    if (!post) continue;
    const shouldRefresh = post.products.some((product) => product.amazon_link === "https://www.amazon.com/");
    const nextCategory = category === "Living Room" ? "Living Rooms" : category;
    if (shouldRefresh || post.category !== nextCategory) {
      await db.update(postsTable).set({
        category: nextCategory,
        products: makeProducts(index, category),
      }).where(eq(postsTable.id, post.id));
    }
  }
}