import { isProduction } from './environment.config';

export const API_URL = {
  solaraAssistant: {
    email: isProduction
      ? 'https://s8eo26szn4.execute-api.us-east-1.amazonaws.com/prd/'
      : 'https://q6092demn3.execute-api.us-east-1.amazonaws.com/qas/',
  },
};
