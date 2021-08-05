import * as t from "lib/io-ts";

export const fieldName = "csv_file";
export enum TransactionType {
  Purchase = "purchase/sale",
  FiatFunding = "fiat funding",
  ShakingSats = "shakingsats",
  CryptoFunding = "crypto funding",
  PeerTransfer = "peer transfer",
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

export const Csv = t.createStructuredTaggedUnion(CsvT);
