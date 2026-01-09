import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const watchlist = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$182.64",
    change: "+1.8%",
    volume: "58.2M",
    range: "$179.10 - $183.20",
    sentiment: "bullish",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: "$908.24",
    change: "+2.4%",
    volume: "41.7M",
    range: "$885.60 - $914.00",
    sentiment: "momentum",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$172.30",
    change: "-0.6%",
    volume: "96.5M",
    range: "$168.40 - $176.80",
    sentiment: "mixed",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: "$416.10",
    change: "+0.9%",
    volume: "29.1M",
    range: "$410.20 - $417.90",
    sentiment: "steady",
  },
];

const orderBook = {
  bids: [
    { price: "$182.60", size: "1,250", venue: "ARCA" },
    { price: "$182.58", size: "980", venue: "NASDAQ" },
    { price: "$182.55", size: "2,100", venue: "BATS" },
    { price: "$182.52", size: "1,480", venue: "IEX" },
  ],
  asks: [
    { price: "$182.66", size: "1,140", venue: "NYSE" },
    { price: "$182.70", size: "920", venue: "ARCA" },
    { price: "$182.72", size: "1,870", venue: "NASDAQ" },
    { price: "$182.75", size: "1,320", venue: "BATS" },
  ],
};

const volumeByVenue = [
  { venue: "NASDAQ", volume: "18.4M", share: "31%", trend: "+4%" },
  { venue: "NYSE", volume: "12.7M", share: "21%", trend: "+2%" },
  { venue: "ARCA", volume: "10.2M", share: "17%", trend: "-1%" },
  { venue: "BATS", volume: "9.5M", share: "16%", trend: "+3%" },
  { venue: "IEX", volume: "6.1M", share: "10%", trend: "+1%" },
];

const varianceDecomposition = [
  { horizon: "1m", label: "Microstructure", contribution: "28%" },
  { horizon: "5m", label: "Intra-day", contribution: "22%" },
  { horizon: "1h", label: "Session flow", contribution: "20%" },
  { horizon: "1d", label: "Daily trend", contribution: "18%" },
  { horizon: "1w", label: "Macro", contribution: "12%" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge className="bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30">
              Quant Research Workspace
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Build your stock intelligence layer for price, volume, and order book
            </h1>
            <p className="text-lg text-slate-300">
              Track real-time market structure, monitor trading activity, and layer in
              convolution-based volatility modeling to support CVRC-style variance
              decomposition across trading frequencies.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-slate-700 px-3 py-1">
                Multi-venue order book
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                Liquidity + spread analytics
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                Volatility convolution layers
              </span>
            </div>
          </div>
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-white">Market Pulse</CardTitle>
              <CardDescription className="text-slate-400">
                Snapshot of the most active symbols and signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Top mover</span>
                <span className="font-semibold text-emerald-300">NVDA +2.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total volume</span>
                <span className="font-semibold">225.5M shares</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active venues</span>
                <span className="font-semibold">12 consolidated feeds</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-xs uppercase text-slate-400">Signal mix</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-200">
                    Momentum
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-200">
                    Mean reversion
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-200">
                    Liquidity sweep
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardDescription className="text-slate-400">Spread</CardDescription>
              <CardTitle className="text-white">$0.06</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">
              Tightest on AAPL, widening during auction imbalance.
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardDescription className="text-slate-400">Imbalance</CardDescription>
              <CardTitle className="text-white">+18%</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">
              Bid-side dominance in the first hour of cash trading.
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardDescription className="text-slate-400">Volatility regime</CardDescription>
              <CardTitle className="text-white">Compression</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400">
              CVRC layer indicates lower long-horizon variance.
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-white">Live Watchlist</CardTitle>
              <CardDescription className="text-slate-400">
                Prices, volume, and regime flags updated from the consolidated feed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Last</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Signal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlist.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell className="font-semibold text-white">
                        {stock.symbol}
                        <span className="block text-xs text-slate-400">{stock.name}</span>
                      </TableCell>
                      <TableCell>{stock.price}</TableCell>
                      <TableCell
                        className={
                          stock.change.startsWith("-")
                            ? "text-rose-300"
                            : "text-emerald-300"
                        }
                      >
                        {stock.change}
                      </TableCell>
                      <TableCell>{stock.volume}</TableCell>
                      <TableCell className="text-slate-400">{stock.range}</TableCell>
                      <TableCell>
                        <Badge
                          className="bg-slate-800 text-slate-200"
                          variant="secondary"
                        >
                          {stock.sentiment}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-white">Order Book</CardTitle>
              <CardDescription className="text-slate-400">
                Depth at top of book across venues (AAPL).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase text-slate-500">Bids</p>
                <div className="mt-2 space-y-2">
                  {orderBook.bids.map((bid) => (
                    <div
                      key={`${bid.price}-${bid.venue}`}
                      className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <span className="text-emerald-300">{bid.price}</span>
                      <span className="text-slate-300">{bid.size}</span>
                      <span className="text-xs text-slate-500">{bid.venue}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Asks</p>
                <div className="mt-2 space-y-2">
                  {orderBook.asks.map((ask) => (
                    <div
                      key={`${ask.price}-${ask.venue}`}
                      className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <span className="text-rose-300">{ask.price}</span>
                      <span className="text-slate-300">{ask.size}</span>
                      <span className="text-xs text-slate-500">{ask.venue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-white">Volume by Venue</CardTitle>
              <CardDescription className="text-slate-400">
                Consolidated volume distribution for the session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venue</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volumeByVenue.map((venue) => (
                    <TableRow key={venue.venue}>
                      <TableCell className="font-medium text-white">
                        {venue.venue}
                      </TableCell>
                      <TableCell>{venue.volume}</TableCell>
                      <TableCell className="text-slate-400">{venue.share}</TableCell>
                      <TableCell
                        className={
                          venue.trend.startsWith("-")
                            ? "text-rose-300"
                            : "text-emerald-300"
                        }
                      >
                        {venue.trend}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-white">CVRC Volatility Stack</CardTitle>
              <CardDescription className="text-slate-400">
                Convolution operators decompose variance across trading frequencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase text-slate-500">Model recipe</p>
                <ol className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-300">1.</span>
                    <span>
                      Stream tick returns and resample into multiple horizons (1m, 5m,
                      1h, 1d).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-300">2.</span>
                    <span>
                      Apply convolution kernels to isolate microstructure vs. macro
                      variance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-300">3.</span>
                    <span>
                      Feed decomposition into CVRC layers to capture regime shifts.
                    </span>
                  </li>
                </ol>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Variance contribution</p>
                <div className="mt-3 grid gap-2">
                  {varianceDecomposition.map((layer) => (
                    <div
                      key={layer.horizon}
                      className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-white">{layer.horizon}</p>
                        <p className="text-xs text-slate-500">{layer.label}</p>
                      </div>
                      <span className="text-cyan-200">{layer.contribution}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
