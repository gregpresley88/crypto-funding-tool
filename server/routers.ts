import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getLatestFundingRates,
  getLatestFundingRatesBySymbol,
  getLatestFundingRatesByExchange,
  getFundingRatesBySymbolAndExchange,
  getAverageFundingRateBySymbol,
  getAverageFundingRateForTimeFrame,
  getAllSymbols,
  getAllExchanges,
} from "./fundingRates.db";
import { exportFundingRatesAsCSV, exportLatestFundingRatesAsCSV } from "./csv-export.service";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  fundingRates: router({
    getLatest: publicProcedure.query(async () => {
      return getLatestFundingRates();
    }),

    getLatestBySymbol: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        return getLatestFundingRatesBySymbol(input.symbol);
      }),

    getLatestByExchange: publicProcedure
      .input(z.object({ exchange: z.string() }))
      .query(async ({ input }) => {
        return getLatestFundingRatesByExchange(input.exchange);
      }),

    getHistory: publicProcedure
      .input(
        z.object({
          symbol: z.string(),
          exchange: z.string(),
          startTime: z.number(),
          endTime: z.number(),
          interval: z.string().default("1d"),
        })
      )
      .query(async ({ input }) => {
        return getFundingRatesBySymbolAndExchange(
          input.symbol,
          input.exchange,
          input.startTime,
          input.endTime,
          input.interval
        );
      }),

    getAverageBySymbol: publicProcedure
      .input(
        z.object({
          symbol: z.string(),
          startTime: z.number(),
          endTime: z.number(),
          interval: z.string().default("1d"),
        })
      )
      .query(async ({ input }) => {
        return getAverageFundingRateBySymbol(
          input.symbol,
          input.startTime,
          input.endTime,
          input.interval
        );
      }),

    getAllSymbols: publicProcedure.query(async () => {
      return getAllSymbols();
    }),

    getAllExchanges: publicProcedure.query(async () => {
      return getAllExchanges();
    }),

    getAverageForTimeFrame: publicProcedure
      .input(
        z.object({
          symbol: z.string(),
          exchange: z.string(),
          daysBack: z.number().default(7),
        })
      )
      .query(async ({ input }) => {
        return getAverageFundingRateForTimeFrame(
          input.symbol,
          input.exchange,
          input.daysBack
        );
      }),

    exportAsCSV: publicProcedure.query(async () => {
      const csv = await exportFundingRatesAsCSV();
      return {
        csv,
        filename: `funding-rates-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

    exportLatestAsCSV: publicProcedure.query(async () => {
      const csv = await exportLatestFundingRatesAsCSV();
      return {
        csv,
        filename: `funding-rates-latest-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),

    cleanup: publicProcedure.mutation(async () => {
      console.log("[API] Cleanup requested");
      return { success: true, message: "Database cleanup initiated" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
