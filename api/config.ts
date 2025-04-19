const API_CONFIG = {
  development: {
    baseURL: 'http://10.0.0.2:5002/api',
    timeout: 30000,
  },
  production: {
    baseURL: 'https://api.landonkleinbrodt.com/api',
    timeout: 30000,
  },
};

export const getApiConfig = () => {
  return (
    API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] ||
    API_CONFIG.development
  );
};
