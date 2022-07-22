import React from 'react';
import * as Csv from 'lib/Csv';

const dollarUSLocale = Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'code',
});
//TODO: Work on the UI for this component
const StatsDashBoardComponent: React.FC<Csv.Response> = (props) => {
  return (
    <div className="display: block grid justify-items-center">
      <div className="text-3xl hover:text-yellow-400 grid justify-items-center mb-10">
        {' '}
        STATS 💰
      </div>

      <div className="flex items-center ml-1">
        <div className="flex justify-center flex space-x-10">
          <div>
            <div>Crypto Cashout 💎🙌</div>
            <div>
              {dollarUSLocale.format(props['crypto cashout'])}
            </div>
          </div>
          <div>
            <div>Crypto Funding 🧨</div>
            <div>
              {dollarUSLocale.format(props['crypto funding'])}
            </div>
          </div>
          <div>
            <div>Fiat Cashout 💸</div>
            <div>{dollarUSLocale.format(props['fiat cashout'])}</div>
          </div>
          <div>
            <div>Fiat Funding 🏦</div>
            <div>{dollarUSLocale.format(props['fiat funding'])}</div>
          </div>
          <div>
            <div>Peer Transfer 🔛</div>{' '}
            <div>{dollarUSLocale.format(props['peer transfer'])}</div>
          </div>
          <div>
            <div>Purchase Or Sale 📈</div>
            <div>{dollarUSLocale.format(props['purchase/sale'])}</div>
          </div>
          <div>
            <div>Shakingsats 🤝</div>{' '}
            <div>{dollarUSLocale.format(props['shakingsats'])}</div>
          </div>
          <div>
            <div>Card Transactions ☕</div>{' '}
            <div>
              {dollarUSLocale.format(props['card transactions'])}
            </div>
          </div>
          <div>
            <div>Card Cashbacks 💰 🔙</div>{' '}
            <div>
              {dollarUSLocale.format(props['card cashbacks'])}
            </div>
          </div>
          <div>
            <div>Other 🪤 </div>{' '}
            <div>{dollarUSLocale.format(props['other'])}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashBoardComponent;
