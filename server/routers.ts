import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getLatestFundingRates,
  getLatestFundingRatesBySymbol,
  getLatestFundingRatesByExchange,
  getFundingRatesBySymbolAndExchange,
  getAverageFundingRateBySymbol,
  getAllSymbols,
  getAllExchanges,
} from "./fundingRates.db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
    /**
     * Get all latest funding rates
     */
    getLatest: publicProcedure.query(async () => {
      return getLatestFundingRates();
    }),

    /**
     * Get latest funding rates for a specific symbol
     */
    getLatestBySymbol: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        return getLatestFundingRatesBySymbol(input.symbol);
      }),

    /**
     * Get latest funding rates for a specific exchange
     */
    getLatestByExchange: publicProcedure
      .input(z.object({ exchange: z.string() }))
      .query(async ({ input }) => {
        return getLatestFundingRatesByExchange(input.exchange);
      }),

    /**
     * Get historical funding rates for a symbol-exchange pair
     */
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

    /**
     * Get average funding rate statistics for a symbol
     */
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

    /**
     * Get all available symbols
     */
    getAllSymbols: publicProcedure.query(async () => {
      return getAllSymbols();
    }),

    /**
     * Get all available exchanges
     */
    getAllExchanges: publicProcedure.query(async () => {
      return getAllExchanges();
    }),
  }),
});

export type AppRouter = typeof appRouter;
