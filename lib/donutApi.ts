const BASE_URL = "https://api.donutsmp.net";

export interface AuctionListing {
  price: number;
  seller: string;
  itemName: string;
}

export interface ItemPriceData {
  lowestPrice: number;
  avgPrice: number;
  listings: AuctionListing[];
}

export async function getItemPrices(itemName: string): Promise<ItemPriceData | null> {
  const apiKey = process.env.DONUT_API_KEY;

  if (!apiKey) {
    throw new Error("DONUT_API_KEY is not set");
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/auction/list/1`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search: itemName,
        sort: "lowest_price",
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`DonutSMP API error: ${response.status} - ${body}`);
      return null;
    }

    const data = await response.json();
    const listingsArray = data.result ?? [];
    const listings: AuctionListing[] = listingsArray.map((listing: any) => ({
      price: listing.price,
      seller: listing.seller?.name ?? "unknown",
      itemName: listing.item?.display_name || itemName,
    }));

    if (listingsArray.length === 0) return null;

    const lowestPrice = listings[0].price;
    const avgPrice = Math.round(
      listings.reduce((sum, l) => sum + l.price, 0) / listings.length
    );

    return { lowestPrice, avgPrice, listings };
  } catch (error) {
    console.error("Failed to fetch from DonutSMP API:", error);
    return null;
  }
}
