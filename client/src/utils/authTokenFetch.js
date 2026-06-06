const AUTH_TOKEN_KEY = 'animewl_auth_token';

function obtenirUrlBackend() {
  return import.meta.env.VITE_BACKENDURL || '';
}

function esPeticioApi(input) {
  const url = typeof input === 'string' ?
  input :
  input instanceof URL ?
  input.toString() :
  input?.url || '';

  const backendUrl = obtenirUrlBackend();
  return url.startsWith('/api') || backendUrl && url.startsWith(`${backendUrl}/api`);
}

function obtenirTokenAutenticacio() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}export { obtenirTokenAutenticacio };

function definirTokenAutenticacio(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}export { definirTokenAutenticacio };

function netejarTokenAutenticacio() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}export { netejarTokenAutenticacio };

function configurarFetchTokenAutenticacio() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const options = { ...init };

    if (esPeticioApi(input)) {
      const token = obtenirTokenAutenticacio();
      const headers = new Headers(options.headers || {});

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      options.headers = headers;
    }

    const response = await originalFetch(input, options);

    if (esPeticioApi(input)) {
      response.clone().json().
      then((data) => {
        if (data?.token) definirTokenAutenticacio(data.token);
        if (response.status === 401) netejarTokenAutenticacio();
      }).
      catch(() => {});
    }

    return response;
  };
}export { configurarFetchTokenAutenticacio };