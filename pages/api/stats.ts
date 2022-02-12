import { TransactionType, DirectionType, Csv, PurchaseOrSaleMember, CreditDebitType } from 'lib/Csv';
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as Errors from "lib/Errors";
import * as Operations from './operations';
import * as BtcOperations from './btcOperations';
import * as A from "fp-ts/Array";

export const stats = (csvItems: Array<Csv>): TE.TaskEither<Errors.APIUpload, {
  [_x in TransactionType]: number;
}> => {
    // console.log('csvItems', csvItems)
  return pipe(
    BtcOperations.currentCADBTCPrice,

    TE.mapLeft(_ =>
      Errors.APIUpload.ThirdPartyApiError({ value: "Could not fetch Btc price" })),

    TE.map(btcPriceInCAD => {
      const shakingSatsSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.ShakingSats),
        Operations.getCollection('Amount Credited'),
        Operations.getSum,
        Operations.convertBTCToCAD(btcPriceInCAD)
      );

      const fiatFundingSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.FiatFunding),
        Operations.diffrenceSequence
        // Operations.getCollection('Amount Credited'),
        // Operations.getSum
        );

      const purchaseSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.PurchaseOrSale),
        Operations.diffrenceSequence
        // Operations.getCollection('Amount Credited'),
        // Operations.getSum
        );


      const cryptoFundingSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.CryptoFunding),
        // Operations.getCollection('Amount Credited'),
        // Operations.getSum,
        Operations.diffrenceSequence,
        Operations.convertBTCToCAD(btcPriceInCAD));

      const cryptoCashoutSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.CryptoCashout),
        // Operations.getCollection('Amount Debited'),
        // Operations.getSum
        Operations.diffrenceSequence
        );

      const fiatCashoutSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.FiatCashout),
        // Operations.getCollection('Amount Debited'),
        // Operations.getSum
        Operations.diffrenceSequence
        );

      const peerTransferSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.PeerTransfer),
        Operations.diffrenceSequence
        // Operations.getCollection('Amount Debited'),
        // Operations.getSum
      );

      const otherSum = pipe(csvItems,
        Operations.transactionTypeRecord(TransactionType.Other),
        Operations.getCollection('Amount Credited'),
        Operations.getSum);



        // const purchase = pipe (csvItems,
        //   Operations.transactionTypeRecord(TransactionType.PurchaseOrSale),
        //   Operations.getAmountDebitedPurchasedOrSale(DirectionType.Purchase),
        //   Operations.getCollection('Amount Debited'),
        //   Operations.getSum,
        //   )

        // const sale = pipe(csvItems, 
        //   Operations.transactionTypeRecord(TransactionType.PurchaseOrSale),
        //   Operations.getAmountDebitedPurchasedOrSale(DirectionType.Sale),
        //   Operations.getCollectionDate('Amount Debited'),
        //   Operations.getSum,
        //   Operations.convertBTCToCAD(btcPriceInCAD)
        //   )

        // console.log('Amount Debited purchase', purchase);
        // console.log('Amount Debited sale', sale);

        // const AmountLeft = purchase - sale
        // console.log(AmountLeft);

        // console.log(
        // 'PurchaseOrSale:', purchaseSum,
        // 'FiatFunding:', fiatFundingSum,
        // 'ShakingSats:', shakingSatsSum,
        // 'CryptoFunding: ', cryptoFundingSum,
        // 'PeerTransfer:', peerTransferSum,
        // 'FiatCashout:', fiatCashoutSum,
        // 'CryptoCashout:', cryptoCashoutSum,
        // 'Other:', otherSum,
        // )

      return {
        [TransactionType.PurchaseOrSale]: purchaseSum,
        [TransactionType.FiatFunding]: fiatFundingSum,
        [TransactionType.ShakingSats]: shakingSatsSum,
        [TransactionType.CryptoFunding]: cryptoFundingSum,
        [TransactionType.PeerTransfer]: peerTransferSum,
        [TransactionType.FiatCashout]: fiatCashoutSum,
        [TransactionType.CryptoCashout]: cryptoCashoutSum,
        [TransactionType.Other]: otherSum,
      };
    })

  );
}













// //TODO: caluclate The spread using total of fiat funding (cad) converted to (btc by day price) than compare it to your sum total (btc and cad using the spread).
// const ShakePaySpread = () => {
//   //TODO:1 - we need the fiat funding to btc price in that day.
//   //TODO:2 -we need shakepay btc total.

//   //TODO: calculate spread:  avg spread =  2/1

//   return;
// }