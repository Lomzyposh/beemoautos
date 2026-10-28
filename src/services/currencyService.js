import config from '../config/siteConfig.js';
let cache;
export const currencyService = {
 async rates() {
  if (!config.exchangeRateEndpoint) return {NGN:1};
  if (cache && Date.now()-cache.time < 6*60*60*1000) return cache.rates;
  const response = await fetch(config.exchangeRateEndpoint);
  if (!response.ok) throw new Error('Currency rates unavailable');
  const data = await response.json();
  if (data.base !== 'NGN' || !data.rates || data.rates.NGN !== 1) throw new Error('Expected rates based on NGN');
  cache = {time:Date.now(),rates:data.rates}; return cache.rates;
 },
 format(price,currency='NGN',rates={NGN:1}) {if (!Number.isFinite(price) || price <= 0) return 'Price on request'; return new Intl.NumberFormat('en-NG',{style:'currency',currency:rates[currency]?currency:'NGN',maximumFractionDigits:0}).format(price*(rates[currency]||1));}
};
