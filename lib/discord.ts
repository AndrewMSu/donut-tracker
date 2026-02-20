export async function sendDiscordAlert(
  itemName: string,
  lowestPrice: number,
  targetPrice: number
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log(
      `[Discord skipped] ${itemName} is at ${lowestPrice} (target: ${targetPrice})`
    );
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🟢 **Good time to sell ${itemName}!**\nLowest listing: **${lowestPrice.toLocaleString()}**\nYour target: **${targetPrice.toLocaleString()}**`,
    }),
  });
}
