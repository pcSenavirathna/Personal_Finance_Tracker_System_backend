const axios = require("axios");

const getExchangeRate = async (fromCurrency, toCurrency) => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  try {
    const response = await axios.get(url);
    const rate = response.data.rates[toCurrency];
    if (!rate) {
      throw new Error(`Unable to get exchange rate from ${fromCurrency} to ${toCurrency}`);
    }
    return rate;
  } catch (error) {
    throw new Error(`Unable to get exchange rate: ${error.message}`);
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * rate;
  return convertedAmount;
};

module.exports = { convertCurrency };