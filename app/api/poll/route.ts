import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getItemPrices } from "@/lib/donutApi";
import { sendDiscordAlert } from "@/lib/discord";

export async function GET() {
  try {
    // Get all tracked items from the database
    const items = await prisma.item.findMany();

    if (items.length === 0) {
      return NextResponse.json({ message: "No items to track" });
    }

    const results = [];

    for (const item of items) {
      // Fetch current prices from DonutSMP
      const priceData = await getItemPrices(item.name);

      if (!priceData) {
        results.push({ item: item.name, status: "failed to fetch" });
        continue;
      }

      // Save the price snapshot to the database
      await prisma.price.create({
        data: {
          itemId: item.id,
          lowestPrice: priceData.lowestPrice,
          avgPrice: priceData.avgPrice,
        },
      });

      // Delete price records older than 48 hours
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await prisma.price.deleteMany({
        where: {
          itemId: item.id,
          timestamp: { lt: cutoff },
        },
      });

      // Check if lowest price is within 15% of the target
      const threshold = item.targetPrice * 0.85;
      if (priceData.lowestPrice >= threshold) {
        await sendDiscordAlert(item.name, priceData.lowestPrice, item.targetPrice);
      }

      results.push({
        item: item.name,
        lowestPrice: priceData.lowestPrice,
        avgPrice: priceData.avgPrice,
        targetPrice: item.targetPrice,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "Poll failed" }, { status: 500 });
  }
}
