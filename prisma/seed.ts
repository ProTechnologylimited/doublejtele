import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const names = ["Smartphones","Mobile Phones","Laptops and Computers","Tablets","Phone Accessories","Chargers and Cables","Earphones and Headphones","Smartwatches","Speakers and Audio","Electronics","Other Products"];
(async () => { for (const [i, name] of names.entries()) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await p.category.upsert({ where: { slug }, update: {}, create: { name, slug, sort: i } }); }
  console.log("Starter categories ready (edit or delete them in /admin)."); })();
