const API_CONFIG = {
  development: {
    baseURL: "https://api.landonkleinbrodt.com/api",
    timeout: 30000,
  },
  production: {
    timeout: 30000,
    baseURL: "https://api.landonkleinbrodt.com/api",
  },
};

export const getApiConfig = () => {
  return (
    API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] ||
    API_CONFIG.development
  );
};
