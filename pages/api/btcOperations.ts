import { pipe, flow } from 'fp-ts/function'
import * as E from "fp-ts/Either"
import * as A from "fp-ts/Array"
import * as t from "lib/io-ts";
import * as TE from "fp-ts/TaskEither";
import * as D from 'io-ts/Decoder';
import { btcPayloadDecoder, rateCADUSDDecoder, currentBTCUSDDecoder } from 'lib/BtcDecod'
import { failure } from 'io-ts/lib/PathReporter';
import * as Apply from 'fp-ts/lib/Apply';
import * as Errors from 'lib/Errors';


export function convertTodayDate(): { start: string; end: string; } {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = String(today.getFullYear());
  const dbefore = String(parseInt(dd) - 1);
  const startDate: string = `${yyyy}-${mm}-${dbefore}`;
  const endDate: string = `${yyyy}-${mm}-${dd}`;
  const date = {
    start: startDate,
    end: endDate
  }
  return date;
}
export function convertCsvDate(date: string): string {
  const splitdate = date.split('-');
  const yyyy = splitdate[0];
  const mm = splitdate[1];
  const dayandTime = splitdate[2].split('T');
  const dd = dayandTime[0];
  date = `${yyyy}-${mm}-${dd}`;
  return date;
}

export const TodayBtcPriceURL = () => {
  const date = convertTodayDate();
  const URL: string = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${date.start}&end=${date.end}&currency=CAD`;
  return URL;
}

export const HistoricalBtcPriceURL = (date: string) => {
  const convertedDate = convertCsvDate(date);
  const URL: string = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${convertedDate}&end=${convertedDate}&currency=CAD`;
  console.log(URL);
  return URL;
}

// export function makeRequest<A>(
//   url: string,
//   decoder: t.Decoder<unknown, A>,
//   signal?: AbortSignal,
// ): TE.TaskEither<Error, A> {
//   return TE.tryCatch(
//     async () => {
//       const response = await fetch(url, { signal })
//       const result = await response.json()
//       const decoded = decoder.decode(result)
//       if (E.isLeft(decoded)) {
//         throw new TypeError(t.draw(decoded.left))
//       }
//       return decoded.right
//     },
//     (error) =>
//       error instanceof Error
//         ? error
//         : new Error(JSON.stringify(error)),
//   );
// }

// const fetchBtcPriceRequest = makeRequest(TodayBtcPriceURL(), btcPayloadDecoder)


const currentExchangeRateURL: string = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1";

const currentUSDBTCpriceURL: string = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";

const decodeWith = <A>(decoder: t.Decoder<unknown, A>) =>
  flow(
    decoder.decode,
    E.mapLeft(errors => new Error(failure(errors).join('\n'))),
    TE.fromEither
  )

const httpGet = (url: string) => TE.tryCatch<Error, Response>(
  () => fetch(url).then(x => x.json()),
  reason => new Error(String(reason))
)

const getFromURL = <A>(codec: t.Decoder<unknown, A>) => (url: string) =>
  pipe(
    httpGet(url),
    TE.chain(decodeWith(codec))
  )

const currentExchangeRate = pipe(
  currentExchangeRateURL,
  getFromURL(rateCADUSDDecoder),
  TE.map(x => x.observations),
  // TE.map(A.head), //gets the first value of an array
  // TE.chainEitherK(E.fromOption(() => new Error("Observations array was empty"))),
  TE.chainOptionK(() => new Error("Observations Array was empty"))(A.head),
  TE.map(a => a.FXUSDCAD.v)
)

const currentUSDBTCPrice = pipe(
  currentUSDBTCpriceURL,
  getFromURL(currentBTCUSDDecoder),
  TE.map(x => x.price)
)


export const currentCADBTCPrice = pipe(
  //Do notation works on a sequence way so we have to wait for tasks to resolve one by one
  //In our case it would be better to use a parllel approach in this case to minimize the waiting time
  Apply.sequenceS(TE.ApplicativePar)({
    'ExchangeRate': currentExchangeRate,
    'USDPrice': currentUSDBTCPrice,
  }),
  TE.map(({ExchangeRate , USDPrice}) => ExchangeRate * USDPrice)
  // TE.Do,
  // TE.bind('currentExchangeRate', () => currentExchangeRate),
  // TE.bind('currentUSDBTCPrice', () => currentUSDBTCPrice),
  // TE.map(({ currentExchangeRate, currentUSDBTCPrice }) => currentExchangeRate * currentUSDBTCPrice)
   //version2 sequence way
  // currentExchangeRate,
  // TE.chain(n1 => {
  //   const resultEIther = pipe(currentUSDBTCPrice, TE.map(n2 => n1 * n2))
  //   return resultEIther;
  // }),
  
)
// const btcCADPrice = 1;
// const btcAmount = 1;
// const getAvgBtcPrice = btcCADPrice * btcAmount;

const getAvgBtcPrice = pipe(
  currentCADBTCPrice,
  TE.mapLeft(_ => Errors.APIUpload.ThirdPartyApiError({value: "Could not fetch Btc price" })),
  TE.map(btcPriceInCAD => {
    const AvgBtcPrice = btcPriceInCAD 
    return AvgBtcPrice
  })
)


export const getBtcPriceInCADByDate = (date: string) => {
  return pipe(
    date,
    HistoricalBtcPriceURL,
    getFromURL(btcPayloadDecoder),
    TE.map(x => x.bpi.todayDate),
  )
}