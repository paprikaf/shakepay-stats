import {
  TransactionType,
  Csv,
  SingleMember,
  PurchaseOrSaleMember,
  DirectionType,
  CreditDebitType,
} from 'lib/Csv';
import { Refinement } from 'fp-ts/Refinement';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as BtcOperations from './btcOperations';
import * as Errors from 'lib/Errors';
import * as TE from 'fp-ts/TaskEither';

const makeRefinment =
  <T extends SingleMember>(
    transcationType: TransactionType
  ): Refinement<SingleMember, T> =>
  (x): x is T =>
    x['Transaction Type'] === transcationType;

const makeRefinmentDirection =
  <T extends SingleMember>(
    DirectionType: DirectionType
  ): Refinement<SingleMember, T> =>
  (x): x is T =>
    x.Direction === DirectionType;

export const transactionTypeRecord =
  <T extends SingleMember>(transactionType: TransactionType) =>
  (xs: Array<SingleMember>): Array<T> =>
    pipe(xs, A.filter(makeRefinment<T>(transactionType)));

export const getCollection =
  (description: string) => (collection: Array<Csv>) =>
    collection.map((rec: any) => {
      const filtedRec = {
        Amount: rec[description],
        date: rec['Date'],
      };
      return rec[description];
    });
const getDebitCollection = (csv: Array<Csv>): Array<number> => {
  return csv.map((rec: any) => {
    return rec['Amount Debited'];
  });
};
const getCreditCollection = (csv: Array<Csv>) =>
  csv.map((rec: any) => {
    return rec['Amount Credited'];
  });
export const getDiff = (debitSum: number, creditSum: number) =>
  debitSum > creditSum ? debitSum - creditSum : creditSum - debitSum;

export const getSum = (record: Array<number>) => {
  return record.reduce((acc: number, rec: number) => {
    const sum: number = rec + acc;
    return sum;
  }, 0);
};
export const convertBTCToCAD = (CADPrice: number) => (sum: number) =>
  CADPrice * sum;
export const diffrenceSequence = (csv: Array<Csv>) => {
  const debitSumPipe = pipe(csv, getDebitCollection, getSum);
  const creditSumPipe = pipe(csv, getCreditCollection, getSum);
  return getDiff(debitSumPipe, creditSumPipe);
};

export const transactionTypeRecordPurchaseOrSale =
  <T extends SingleMember>(transactionType: TransactionType) =>
  (xs: Array<SingleMember>): Array<T> =>
    pipe(xs, A.filter(makeRefinment<T>(transactionType)));
//------Purchase and Sale calculate spread --------------
export const getAmountDebitedPurchasedOrSale =
  <T extends SingleMember>(direction: DirectionType) =>
  (xs: Array<T>): Array<T> =>
    pipe(xs, A.filter(makeRefinmentDirection<T>(direction)));

const getPriceByDate = (
  date: string
): TE.TaskEither<Errors.APIUpload, number> =>
  pipe(
    BtcOperations.getBtcPriceInCADByDate(date),
    TE.mapLeft((_) =>
      Errors.APIUpload.ThirdPartyApiError({
        value: 'Could Not Fetch BTC Price',
      })
    ),
    TE.map((BtcPriceByDate) => {
      const Price = BtcPriceByDate;
      return Price;
    })
  );
export const getCollectionDate =
  (description: string) => (collection: Array<Csv>) =>
    collection.map((rec: any) => {
      const filtedRec = {
        Amount: rec[description],
        date: rec['Date'],
      };
      return filtedRec;
    });
