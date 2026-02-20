"use client";

import { useEffect, useState } from "react";

interface Price {
  id: string;
  lowestPrice: number;
  avgPrice: number;
  timestamp: string;
}

interface Item {
  id: string;
  name: string;
  targetPrice: number;
  prices: Price[];
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Donut Tracker</h1>
        <p className="text-gray-400 mb-8">Auction house price monitor</p>

        {items.length === 0 ? (
          <p className="text-gray-400">No items being tracked yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((item) => {
              const latest = item.prices[0];
              const isGoodTime =
                latest && latest.lowestPrice >= item.targetPrice * 0.85;

              return (
                <div
                  key={item.id}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold capitalize">
                      {item.name}
                    </h2>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        isGoodTime
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}
                    >
                      {isGoodTime ? "Good time to sell" : "Not yet"}
                    </span>
                  </div>

                  {latest ? (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Lowest listing</p>
                        <p className="text-white font-mono text-lg">
                          {latest.lowestPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Average price</p>
                        <p className="text-white font-mono text-lg">
                          {latest.avgPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Your target</p>
                        <p className="text-white font-mono text-lg">
                          {item.targetPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No price data yet — hit /api/poll to fetch prices
                    </p>
                  )}

                  {item.prices.length > 1 && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-xs mb-2">
                        Last {item.prices.length} snapshots (lowest price)
                      </p>
                      <div className="flex items-end gap-1 h-12">
                        {[...item.prices].reverse().map((p, i) => {
                          const max = Math.max(
                            ...item.prices.map((x) => x.lowestPrice)
                          );
                          const height = Math.max(
                            4,
                            (p.lowestPrice / max) * 48
                          );
                          return (
                            <div
                              key={i}
                              className="bg-blue-500 rounded-sm flex-1"
                              style={{ height: `${height}px` }}
                              title={p.lowestPrice.toLocaleString()}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
