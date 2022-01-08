import { pipe } from "fp-ts/lib/function";
import * as t from "lib/io-ts";
import * as E from "fp-ts/lib/Either";


const NumberFromStringOrEmptyString = new t.Type<number, string, unknown>(
  "NumberFromEmptyString",
  t.number.is,
  (u, c) =>
    pipe(
      t.NumberFromString.validate(u, c),
      E.orElse( e => {
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


type NumberFromStringOrEmptyStringC = t.TypeOf <typeof NumberFromStringOrEmptyString>

export const fieldName = "csv_file";
export enum TransactionType {
<<<<<<< Updated upstream
  Purchase = "purchase/sale",
=======
  PurchaseOrSale = "purchase/sale",
>>>>>>> Stashed changes
  FiatFunding = "fiat funding",
  ShakingSats = "shakingsats",
  CryptoFunding = "crypto funding",
  PeerTransfer = "peer transfer",
<<<<<<< Updated upstream
  Other = "other",
}

// {
//   "Transaction Type": "purchase/sale",
//   "Date": "2021-02-25T16:06:51+00",
//   "Amount Debited": 100,
//   "Debit Currency": "CAD",
//   "Amount Credited": 0.00155521,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": 64299.7053,
//   "Direction": "purchase",
//   "Spot Rate": "",
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// }
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
    "Amount Debited": t.NumberFromString,
    "Amount Credited": t.NumberFromString,
    "Debit Currency": t.union([t.literal("CAD"), t.literal("BTC")]),
    "Credit Currency": t.union([t.literal("CAD"), t.literal("BTC")]),
    "Buy / Sell Rate": t.NumberFromString,
    Direction: t.union([t.literal("purchase"), t.literal("sale")]),
  },
  "PurchaseOrSale"
=======
  FiatCashout = "fiat cashout",
  CryptoCashout = "crypto cashout",
  Other = "other",
}

export enum DirectionType {
  Purchase = 'purchase',
  Sale = 'sale'
}

export enum CreditDebitType {
  Debit = 'Amount Debited',
  Credit = 'Amount Credited'
}

// {
//   "Transaction Type": "purchase/sale",
//   "Date": "2021-02-25T16:06:51+00",
//   "Amount Debited": 100,
//   "Debit Currency": "CAD",
//   "Amount Credited": 0.00155521,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": 64299.7053,
//   "Direction": "purchase",
//   "Spot Rate": "",
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// }
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
    "Amount Debited": t.NumberFromString,
    "Amount Credited": t.NumberFromString,
    "Debit Currency": t.union([t.literal("CAD"), t.literal("BTC")]),
    "Credit Currency": t.union([t.literal("CAD"), t.literal("BTC")]),
    "Buy / Sell Rate": t.union([t.string, t.NumberFromString]), //sometiems there is no buy/sell rate on the CSV.
    Direction: t.union([t.literal("purchase"), t.literal("sale")]),
  },
  "PurchaseOrSale"
);

// {
//   "Transaction Type": "fiat funding",
//   "Date": "2021-02-25T16:04:28+00",
//   "Amount Debited": "",
//   "Amount Credited": 100,
//   "Debit Currency": "",
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "felfelahmeed@gmail.com",
//   "Blockchain Transaction ID": ""
// },

const FiatFunding = t.type(
  {
    Date: t.string,
    "Credit Currency": t.literal("CAD"),
    // "Amount Credited": t.union([t.string, t.NumberFromString]),
    "Amount Credited": t.NumberFromString,
    Direction: t.literal("credit"),

    // Email usually
    "Source / Destination": t.string,
  },
  "FiatFunding"
);

// {
//   "Transaction Type": "shakingsats",
//   "Date": "2021-03-25T11:38:06+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 0.0000052,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": 66298.9774,
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// },

const ShakingSats = t.type(
  {
    Date: t.string,
    "Credit Currency": t.literal("BTC"),
    // "Amount Credited": t.union([t.string, t.NumberFromString]),
    "Amount Credited": t.NumberFromString,
    Direction: t.literal("credit"),
    "Spot Rate": t.NumberFromString,
  },
  "ShakingSats"
);

// {
//   "Transaction Type": "crypto funding",
//   "Date": "2021-03-08T13:11:57+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 0.0002366,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": 63964.0776,
//   "Source / Destination": "",
//   "Blockchain Transaction ID": "7495943dc655397ccf9740c919b3fed1e9301c68cfc7a6ff4318a75474312d5f"
// },

const CryptoFunding = t.type(
  {
    Date: t.string,
    // "Amount Credited": t.union([t.string, t.NumberFromString]),
    "Amount Credited": t.NumberFromString,
    // TODO: if we have an ETH transaction, at the moment the validation will fail.
    "Credit Currency": t.literal("BTC"),
    Direction: t.literal("credit"),
    "Spot Rate": t.NumberFromString,
    "Blockchain Transaction ID": t.string,
  },
  "CryptoFunding"
);

// {
//   "Transaction Type": "peer transfer",
//   "Date": "2021-04-02T15:22:10+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 527,
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "@ananas",
//   "Blockchain Transaction ID": ""
// },

// {
//   "Transaction Type": "peer transfer",
//   "Date": "2021-04-12T01:16:40+00",
//   "Amount Debited": 18,
//   "Debit Currency": "CAD",
//   "Amount Credited": "",
//   "Credit Currency": "",
//   "Buy / Sell Rate": "",
//   "Direction": "debit",
//   "Spot Rate": "",
//   "Source / Destination": "@ananas",
//   "Blockchain Transaction ID": ""
// },


// const PeerTransfer = t.intersection([
//   t.type({ type: t.literal('PeerTransfer') }),
//   t.union([
//     t.type({
//       AmountCredited: EmptyString,
//       AmountDebited: NumberFromString,
//     }),
//     t.type({
//       AmountCredited: NumberFromString,
//       AmountDebited: EmptyString,
//     }),
//   ]),
// ]);
const EmptyString = t.literal('');
// const PeerTransfer = t.type(
//   {
//     Date: t.string,
//     "Amount Credited": NumberFromStringOrEmptyString,
//     "Credit Currency": t.union([t.undefined, t.string]),
//     "Amount Debited": NumberFromStringOrEmptyString,
//     "Debit Currency": t.union([t.undefined, t.string]),
//     Direction: t.union([t.literal("credit"), t.literal("debit")]),
//     "Source / Destination": t.string,
//   },
//   "PeerTransfer"
// );
const PeerTransfer = t.intersection([
  t.type({
    Date: t.string, 
    "Source / Destination": t.string,
    "Amount Credited": NumberFromStringOrEmptyString,
    "Amount Debited": NumberFromStringOrEmptyString,
  }),
  t.union([
        t.type({
          Direction:  t.literal("debit"),
          "Credit Currency": EmptyString,
          "Debit Currency": t.string,
         
        }),
        t.type({
          Date: t.string,
          Direction: t.literal("credit"),
          "Credit Currency": t.string,
          "Debit Currency": EmptyString,
        }),
      ]),     
  ],
  "PeerTransfer"
  )

// {
//   "Transaction Type": "fiat cashout",
//   "Date": "2021-10-25T20:30:03+00",
//   "Amount Debited": 500,
//   "Debit Currency": "CAD",
//   "Amount Credited": "",
//   "Credit Currency": "",
//   "Buy / Sell Rate": "",
//   "Direction": "debit",
//   "Spot Rate": "",
//   "Source / Destination": "felfelahmeed@gmail.com",
//   "Blockchain Transaction ID": ""
// },

const FiatCashout = t.type(
  {
    Date: t.string,
    // "Amount Debited": t.union([t.string, t.NumberFromString]),
    "Amount Debited": t.NumberFromString,
    "Debit Currency": t.literal("CAD"),
    Direction: t.union([t.literal("credit"), t.literal("debit")]),
    "Source / Destination": t.string,
  },
  "FiatCashout"
);

// {
//   "Transaction Type": "crypto cashout",
//   "Date": "2021-11-10T17:18:54+00",
//   "Amount Debited": 0.03,
//   "Debit Currency": "BTC",
//   "Amount Credited": "",
//   "Credit Currency": "",
//   "Buy / Sell Rate": "",
//   "Direction": "debit",
//   "Spot Rate": 85468.1248,
//   "Source / Destination": "xxxx",
//   "Blockchain Transaction ID": "xxx"
// }
const CryptoCashout = t.type(
  {
    Date: t.string,
    // "Amount Debited": t.union([t.string, t.NumberFromString]),
    "Amount Debited": t.NumberFromString,
    "Debit Currency": t.literal("BTC"),
    Direction: t.union([t.literal("credit"), t.literal("debit")]),
    "Source / Destination": t.string,
    "Blockchain Transaction ID": t.string,
  },
  "CryptoCashout"
>>>>>>> Stashed changes
);
// {
//   "Transaction Type": "other",
//   "Date": "2021-02-25T23:42:16+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 30,
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// },

//The trasnsation Type : Other is for referrals.
const Other = t.type(
  {
    Date: t.string,
    "Amount Credited": NumberFromStringOrEmptyString,
    "Credit Currency": t.literal("CAD"),
    Direction: t.literal("credit"),
  },
  "Other"
);
 
// TODO: Fix io-ts/lib to allow any property as discriminant
const createTaggedUnion = <T extends string, C extends t.Mixed>(
  tag: T,
  codec: C
) => {
  return t.intersection([
    t.type({ "Transaction Type": t.literal(tag) }),
    codec,
  ]);
};

export const PurchaseOrSaleMember = createTaggedUnion("purchase/sale", PurchaseOrSale);
export type PurchaseOrSaleMember = t.TypeOf<typeof PurchaseOrSaleMember>;
export const FiatFundingMember = createTaggedUnion("fiat funding", FiatFunding);
export type FiatFundingMember = t.TypeOf<typeof FiatFundingMember>;
export const ShakingStatsMember = createTaggedUnion("shakingsats", ShakingSats);
export type ShakingStatsMember = t.TypeOf<typeof ShakingStatsMember>;
export const CryptoFundingMember = createTaggedUnion(
  "crypto funding",
  CryptoFunding
);
export type CryptoFundingMember = t.TypeOf<typeof CryptoFundingMember>;
export const PeerTransferMember = createTaggedUnion(
  "peer transfer",
  PeerTransfer
);
export type PeerTransferMember = t.TypeOf<typeof PeerTransferMember>;
export const FiatCashoutMember = createTaggedUnion("fiat cashout", FiatCashout);
export type FiatCashoutMember = t.TypeOf<typeof FiatCashoutMember>;
export const CryptoCashoutMember = createTaggedUnion(
  "crypto cashout",
  CryptoCashout
);
export type CryptoCashoutMember = t.TypeOf<typeof CryptoCashoutMember>;
export const OtherMember = createTaggedUnion("other", Other);
export type OtherMember = t.TypeOf<typeof OtherMember>;

export const CsvT = t.taggedUnion("Transaction Type", [
  PurchaseOrSaleMember,
  FiatFundingMember,
  ShakingStatsMember,
  CryptoFundingMember,
  PeerTransferMember,
  FiatCashoutMember,
  CryptoCashoutMember,
  OtherMember,
]);
export type SingleMember =   PurchaseOrSaleMember | FiatFundingMember | ShakingStatsMember | CryptoFundingMember | PeerTransferMember | FiatCashoutMember | CryptoCashoutMember | OtherMember;

export type Csv = t.TypeOf<typeof CsvT>;

<<<<<<< Updated upstream
// {
//   "Transaction Type": "fiat funding",
//   "Date": "2021-02-25T16:04:28+00",
//   "Amount Debited": "",
//   "Amount Credited": 100,
//   "Debit Currency": "",
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "felfelahmeed@gmail.com",
//   "Blockchain Transaction ID": ""
// },
const FiatFunding = t.type(
  {
    Date: t.string,
    "Credit Currency": t.literal("CAD"),
    "Amount Credited": t.NumberFromString,
    Direction: t.literal("credit"),

    // Email usually
    "Source / Destination": t.string,
  },
  "FiatFunding"
);

// {
//   "Transaction Type": "shakingsats",
//   "Date": "2021-03-25T11:38:06+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 0.0000052,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": 66298.9774,
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// },
const ShakingSats = t.type(
  {
    Date: t.string,
    "Credit Currency": t.literal("BTC"),
    "Amount Credited": t.NumberFromString,
    Direction: t.literal("credit"),
    "Spot Rate": t.NumberFromString,
  },
  "ShakingSats"
);

// {
//   "Transaction Type": "crypto funding",
//   "Date": "2021-03-08T13:11:57+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 0.0002366,
//   "Credit Currency": "BTC",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": 63964.0776,
//   "Source / Destination": "",
//   "Blockchain Transaction ID": "7495943dc655397ccf9740c919b3fed1e9301c68cfc7a6ff4318a75474312d5f"
// },
const CryptoFunding = t.type(
  {
    Date: t.string,
    "Amount Credited": t.NumberFromString,

    // TODO: if we have an ETH transaction, at the moment the validation will fail.
    "Credit Currency": t.literal("BTC"),
    Direction: t.literal("credit"),
    "Spot Rate": t.NumberFromString,
    "Blockchain Transaction ID": t.string,
  },
  "CryptoFunding"
);

// {
//   "Transaction Type": "peer transfer",
//   "Date": "2021-04-02T15:22:10+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 527,
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "@ananas",
//   "Blockchain Transaction ID": ""
// },

const PeerTransfer = t.type(
  {
    Date: t.string,
    /**
     * Depending if we're sending money to someone or receiving money
     * Either of those fields could be `undefined`.
     */
    "Amount Credited": t.union([t.string, t.NumberFromString]),
    "Credit Currency": t.union([t.undefined, t.string]),
    // TODO: we should be converting empty string to an actual nullable or Option
    "Amount Debited": t.union([t.string, t.NumberFromString]),
    "Debit Currency": t.union([t.undefined, t.string]),
    Direction: t.union([t.literal("credit"), t.literal("debit")]),
    "Source / Destination": t.string,
  },
  "PeerTransfer"
);

// {
//   "Transaction Type": "other",
//   "Date": "2021-02-25T23:42:16+00",
//   "Amount Debited": "",
//   "Debit Currency": "",
//   "Amount Credited": 30,
//   "Credit Currency": "CAD",
//   "Buy / Sell Rate": "",
//   "Direction": "credit",
//   "Spot Rate": "",
//   "Source / Destination": "",
//   "Blockchain Transaction ID": ""
// },
const Other = t.type(
  {
    Date: t.string,
    "Amount Credited": t.NumberFromString,
    "Credit Currency": t.literal("CAD"),
    Direction: t.literal("credit"),
  },
  "Other"
);

//  export enum TransactionType {
//   Purchase ='purchase/sale',
//   FiatFunding ='fiat funding',
//   ShakingSats ='shakingsats',
//   CryptoFunding = 'crypto funding',
//   PeerTransfer ='peer transfer',
//   Other ='other'
// }

// TODO: Fix io-ts/lib to allow any property as discriminant
const createTaggedUnion = <T extends string, C extends t.Mixed>(
  tag: T,
  codec: C
) => {
  return t.intersection([
    t.type({ "Transaction Type": t.literal(tag) }),
    codec,
  ]);
};

export const CsvT = t.taggedUnion("Transaction Type", [
  createTaggedUnion("purchase/sale", PurchaseOrSale),
  createTaggedUnion("fiat funding", FiatFunding),
  createTaggedUnion("shakingsats", ShakingSats),
  createTaggedUnion("crypto funding", CryptoFunding),
  createTaggedUnion("peer transfer", PeerTransfer),
  createTaggedUnion("other", Other),
]);

export type Csv = t.TypeOf<typeof CsvT>;

=======
>>>>>>> Stashed changes
export const Csv = t.createStructuredTaggedUnion(CsvT);
