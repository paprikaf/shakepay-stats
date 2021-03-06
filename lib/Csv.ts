import { pipe } from 'fp-ts/lib/function';
import * as t from 'lib/io-ts';
import * as E from 'fp-ts/lib/Either';

const NumberFromStringOrEmptyString = new t.Type<
  number,
  string,
  unknown
>(
  'NumberFromEmptyString',
  t.number.is,
  (u, c) =>
    pipe(
      t.NumberFromString.validate(u, c),
      E.orElse((e) => {
        return pipe(
          t.string.validate(u, c),
          E.chain((a) => {
            return a.length === 0 ? t.success(0) : t.failure(u, c);
          })
        );
      })
    ),
  String
);

type NumberFromStringOrEmptyStringC = t.TypeOf<
  typeof NumberFromStringOrEmptyString
>;

export const fieldName = 'csv_file';
export enum TransactionType {
  PurchaseOrSale = 'purchase/sale',
  FiatFunding = 'fiat funding',
  ShakingSats = 'shakingsats',
  CryptoFunding = 'crypto funding',
  PeerTransfer = 'peer transfer',
  FiatCashout = 'fiat cashout',
  CryptoCashout = 'crypto cashout',
  CardTransactions = 'card transactions',
  CardCashbacks = 'card cashbacks',
  Other = 'other',
}

export enum DirectionType {
  Purchase = 'purchase',
  Sale = 'sale',
}

export enum CreditDebitType {
  Debit = 'Amount Debited',
  Credit = 'Amount Credited',
}

/**
 * TODO: there is technically two subtypes here.
 * Based on whether or not we're selling or buying, the debit currency and credit currency will be different
 *
 * e.g
 * Buying BTC: Debit currency: CAD; Credit current: BTC
 * Selling BTC: Debit currency: BTC; Credit current: CAD
 */

const PurchaseOrSale = t.type(
  {
    Date: t.string,
    'Amount Debited': t.NumberFromString,
    'Amount Credited': t.NumberFromString,
    'Debit Currency': t.union([
      t.literal('CAD'),
      t.literal('BTC'),
      t.literal('ETH'),
    ]),
    'Credit Currency': t.union([
      t.literal('CAD'),
      t.literal('BTC'),
      t.literal('ETH'),
    ]),
    'Buy / Sell Rate': t.union([t.string, t.NumberFromString]), //sometiems there is no buy/sell rate on the CSV.
    Direction: t.union([t.literal('purchase'), t.literal('sale')]),
  },
  'PurchaseOrSale'
);

const FiatFunding = t.type(
  {
    Date: t.string,
    'Credit Currency': t.literal('CAD'),
    'Amount Credited': t.NumberFromString,
    Direction: t.literal('credit'),
    'Source / Destination': t.string,
  },
  'FiatFunding'
);

const ShakingSats = t.type(
  {
    Date: t.string,
    'Credit Currency': t.literal('BTC'),
    'Amount Credited': t.NumberFromString,
    Direction: t.literal('credit'),
    'Spot Rate': t.NumberFromString,
  },
  'ShakingSats'
);

const CryptoFunding = t.type(
  {
    Date: t.string,
    'Amount Credited': t.NumberFromString,
    // TODO: if we have an ETH transaction, at the moment the validation will fail.
    'Credit Currency': t.literal('BTC'),
    Direction: t.literal('credit'),
    'Spot Rate': t.NumberFromString,
    'Blockchain Transaction ID': t.string,
  },
  'CryptoFunding'
);

const EmptyString = t.literal('');
const PeerTransfer = t.intersection(
  [
    t.type({
      Date: t.string,
      'Source / Destination': t.string,
      'Amount Credited': NumberFromStringOrEmptyString,
      'Amount Debited': NumberFromStringOrEmptyString,
    }),
    t.union([
      t.type({
        Direction: t.literal('debit'),
        'Credit Currency': EmptyString,
        'Debit Currency': t.string,
      }),
      t.type({
        Date: t.string,
        Direction: t.literal('credit'),
        'Credit Currency': t.string,
        'Debit Currency': EmptyString,
      }),
    ]),
  ],
  'PeerTransfer'
);

const FiatCashout = t.type(
  {
    Date: t.string,
    'Amount Debited': t.NumberFromString,
    'Debit Currency': t.literal('CAD'),
    Direction: t.union([t.literal('credit'), t.literal('debit')]),
    'Source / Destination': t.string,
  },
  'FiatCashout'
);

const CryptoCashout = t.type(
  {
    Date: t.string,
    'Amount Debited': t.NumberFromString,
    'Debit Currency': t.literal('BTC'),
    Direction: t.union([t.literal('credit'), t.literal('debit')]),
    'Source / Destination': t.string,
    'Blockchain Transaction ID': t.string,
  },
  'CryptoCashout'
);

//The trasnsation Type : Other is for referrals.
const Other = t.type(
  {
    Date: t.string,
    'Amount Credited': NumberFromStringOrEmptyString,
    'Credit Currency': t.literal('CAD'),
    Direction: t.literal('credit'),
  },
  'Other'
);

// {
//   "Transaction Type": "card transactions",
//   "Date": "2021-12-08T17:25:04+00",
//   "Amount Debited": "00.00",
//   "Debit Currency": "CAD",
//   "Amount Credited": "",
//   "Credit Currency": "",
//   "Buy / Sell Rate": "",
//   "Direction": "debit",
//   "Spot Rate": "",
//   "Source / Destination": "PROVIDER",
//   "Blockchain Transaction ID": ""
// },
const CardTransactions = t.type(
  {
    'Transaction Type': t.string,
    Date: t.string,
    'Amount Debited': t.NumberFromString,
    'Debit Currency': t.literal('CAD'),
    Direction: t.union([t.literal('debit'), t.literal('credit')]),
    'Source / Destination': t.string,
  },
  'card transactions'
);

// {
//   "Transaction Type": "card cashbacks",
//   "Date": "2022-07-11T17:12:08+00",
//   "Amount Credited": 0.00001532,
//   "Credit Currency": "BTC",
//   "Direction": "credit",
//   "Spot Rate": 26592.3135,
//   "Source / Destination": "@cashbacks",
// },
const CardCashbacks = t.type(
  {
    'Transaction Type': t.string,
    Date: t.string,
    'Amount Credited': t.NumberFromString,
    'Credit Currency': t.literal('BTC'),
    Direction: t.literal('credit'),
    'Spot Rate': t.NumberFromString,
    'Source / Destination': t.string,
  },
  'card cashbacks'
);

// TODO: Fix io-ts/lib to allow any property as discriminant
const createTaggedUnion = <T extends string, C extends t.Mixed>(
  tag: T,
  codec: C
) => {
  return t.intersection([
    t.type({ 'Transaction Type': t.literal(tag) }),
    codec,
  ]);
};

export const PurchaseOrSaleMember = createTaggedUnion(
  'purchase/sale',
  PurchaseOrSale
);
export type PurchaseOrSaleMember = t.TypeOf<
  typeof PurchaseOrSaleMember
>;
export const FiatFundingMember = createTaggedUnion(
  'fiat funding',
  FiatFunding
);
export type FiatFundingMember = t.TypeOf<typeof FiatFundingMember>;
export const ShakingStatsMember = createTaggedUnion(
  'shakingsats',
  ShakingSats
);
export type ShakingStatsMember = t.TypeOf<typeof ShakingStatsMember>;
export const CryptoFundingMember = createTaggedUnion(
  'crypto funding',
  CryptoFunding
);
export type CryptoFundingMember = t.TypeOf<
  typeof CryptoFundingMember
>;
export const PeerTransferMember = createTaggedUnion(
  'peer transfer',
  PeerTransfer
);
export type PeerTransferMember = t.TypeOf<typeof PeerTransferMember>;
export const FiatCashoutMember = createTaggedUnion(
  'fiat cashout',
  FiatCashout
);
export type FiatCashoutMember = t.TypeOf<typeof FiatCashoutMember>;
export const CryptoCashoutMember = createTaggedUnion(
  'crypto cashout',
  CryptoCashout
);
export type CryptoCashoutMember = t.TypeOf<
  typeof CryptoCashoutMember
>;
export const OtherMember = createTaggedUnion('other', Other);
export type OtherMember = t.TypeOf<typeof OtherMember>;
export const CardCashbacksMember = createTaggedUnion(
  'card cashbacks',
  CardCashbacks
);
export type CardCashbacksMember = t.TypeOf<
  typeof CardCashbacksMember
>;
export const CardTransactionsMember = createTaggedUnion(
  'card transactions',
  CardTransactions
);
export type CardTransactionsMember = t.TypeOf<
  typeof CardTransactionsMember
>;

export const CsvT = t.taggedUnion('Transaction Type', [
  PurchaseOrSaleMember,
  FiatFundingMember,
  ShakingStatsMember,
  CryptoFundingMember,
  PeerTransferMember,
  FiatCashoutMember,
  CryptoCashoutMember,
  CardCashbacksMember,
  CardTransactionsMember,
  OtherMember,
]);
export type SingleMember =
  | PurchaseOrSaleMember
  | FiatFundingMember
  | ShakingStatsMember
  | CryptoFundingMember
  | PeerTransferMember
  | FiatCashoutMember
  | CryptoCashoutMember
  | CardCashbacksMember
  | CardTransactionsMember
  | OtherMember;

export type Csv = t.TypeOf<typeof CsvT>;

export const Csv = t.createStructuredTaggedUnion(CsvT);

export const ResponseT = t.type({
  'crypto cashout': t.number,
  'crypto funding': t.number,
  'fiat cashout': t.number,
  'fiat funding': t.number,
  other: t.number,
  'peer transfer': t.number,
  'purchase/sale': t.number,
  shakingsats: t.number,
  'card cashbacks': t.number,
  'card transactions': t.number,
});

export type Response = t.TypeOf<typeof ResponseT>;
