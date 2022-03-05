import * as t from "lib/io-ts";
import { convertTodayDate } from "pages/api/btcOperations";

const timeDecoder = t.type({
  updated: t.string,
  updatedISO: t.string,
});
const date = convertTodayDate();
const todayDate = date.start;
const BitcoinPriceIndexDecoder = t.type({
  todayDate: t.number,
});

export const btcPayloadDecoder = t.type({
  bpi: BitcoinPriceIndexDecoder,
  time: timeDecoder,
  disclaimer: t.string,
});

export const currentBTCUSDDecoder = t.type({
  symbol: t.string,
  price: t.NumberFromString,
});

const terms = t.type({
  url: t.string,
});

const dimension = t.type({
  key: t.string,
  name: t.string,
});

const FXUSDCAD = t.type({
  label: t.string,
  description: t.string,
  dimension,
});

const observations = t.nonEmptyArray(
  t.type({
    d: t.string,
    FXUSDCAD: t.type({
      v: t.NumberFromString,
    }),
  })
);

const seriesDetail = t.type({
  FXUSDCAD,
});

export const rateCADUSDDecoder = t.type({
  terms,
  seriesDetail,
  observations,
});

export type btcPayload = t.TypeOf<typeof btcPayloadDecoder>;
export type rateCADUSD = t.TypeOf<typeof rateCADUSDDecoder>;
export type currentBTCcurrencyUSD = t.TypeOf<typeof currentBTCUSDDecoder>;
