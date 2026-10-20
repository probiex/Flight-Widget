import { Router, type IRouter } from "express";
import { GetExchangeRateQueryParams, GetExchangeRateResponse, ListCurrenciesResponse } from "@workspace/api-zod";
import { publicJson, sourceValue } from "../services/public-source-cache";

const router: IRouter = Router();
const SOURCE = "Frankfurter blended reference rates (not an official or retail exchange quote)";
async function currencies() {
  return sourceValue("frankfurter:currencies", 24 * 60 * 60_000, async () => {
    const raw = await publicJson("https://api.frankfurter.dev/v2/currencies");
    if (!Array.isArray(raw) || !raw.length) throw new Error("Currency list missing");
    return raw.map((item: { iso_code?: unknown; name?: unknown }) => {
      if (typeof item.iso_code !== "string" || !/^[A-Z]{3}$/.test(item.iso_code) || typeof item.name !== "string") throw new Error("Invalid currency record");
      return { code: item.iso_code, name: item.name };
    });
  });
}
router.get("/currencies", async (req, res) => {
  try {
    const result = await currencies();
    res.json(ListCurrenciesResponse.parse({ currencies: result.value, source: SOURCE, fetchedAt: result.fetchedAt }));
  } catch (error) {
    req.log.warn({ err: error }, "Currency source unavailable");
    res.status(503).json({ error: "Currency reference list is unavailable." });
  }
});
router.get("/exchange-rate", async (req, res) => {
  const input = GetExchangeRateQueryParams.safeParse(req.query);
  if (!input.success) { res.status(400).json({ error: "Provide base and quote currency codes." }); return; }
  const base = input.data.base.toUpperCase(), quote = input.data.quote.toUpperCase();
  try {
    const supported = (await currencies()).value;
    if (![base, quote].every(code => supported.some(item => item.code === code))) {
      res.status(400).json({ error: "Currency is not supported by the source." }); return;
    }
    const result = await sourceValue(`frankfurter:${base}:${quote}`, 60 * 60_000, async () => {
      const raw = await publicJson(`https://api.frankfurter.dev/v2/rate/${base}/${quote}`) as { base?: unknown; quote?: unknown; date?: unknown; rate?: unknown };
      if (raw.base !== base || raw.quote !== quote || typeof raw.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date) || typeof raw.rate !== "number" || !Number.isFinite(raw.rate) || raw.rate <= 0) throw new Error("Invalid currency rate");
      return { base, quote, rate: raw.rate, date: raw.date };
    });
    res.json(GetExchangeRateResponse.parse({ ...result.value, fetchedAt: result.fetchedAt, source: SOURCE }));
  } catch (error) {
    req.log.warn({ err: error }, "Exchange rate source unavailable");
    res.status(503).json({ error: "Reference exchange rate is unavailable." });
  }
});
export default router;
