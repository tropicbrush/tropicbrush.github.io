// The Auth0 client, initialized in configureClient()
let auth0Client = null;

/**
 * Starts the authentication flow
 */
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
const logout = async () => {
  try {
    console.log("Logging out");
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Retrieves the auth configuration from the server
 */
// const fetchAuthConfig = () => fetch("/auth_config.json");

const fetchAuthConfig = async () => {
  try{
  const storedDomain = localStorage.getItem('auth0_domain') || 'abhishek-customers.us.auth0.com';
  const storedClientId = localStorage.getItem('auth0_client_id') || 'y12dT3aFnRArFWcUSeLZqsONNihvggGF';
  const useRefreshTokens = localStorage.getItem('useRefreshTokens')|| null;
  const scopes = localStorage.getItem('scopes') || null;
  const audience = localStorage.getItem('audience') || null;
  const connection = localStorage.getItem('connection') || null;
  const display = localStorage.getItem('display') || null;    
  const invitation = localStorage.getItem('invitation') || null;
  const login_hint = localStorage.getItem('login_hint') || null
  const max_age = localStorage.getItem('max_age') || null;
  const organization = localStorage.getItem('organization') || null;
  const prompt = localStorage.getItem('prompt') || null;
  const screen_hint = localStorage.getItem('screen_hint') || null;
  const ui_locales = localStorage.getItem('ui_locales') || null;    
    
  return {"domain": storedDomain, "clientId":storedClientId, "useRefreshTokens":useRefreshTokens,"scopes":scopes,"audience": audience,
         "connection": connection,
          "display": display,
          "invitation": invitation,
          "login_hint": login_hint,
          "max_age": max_age,
          "organization": organization,
         "prompt": prompt,
         "screen_hint": screen_hint,
         "ui_locales": ui_locales,
         };
  }
  catch(error){
    throw error
  }
}

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  const config = await fetchAuthConfig();
  // const config = await response.json();

  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    useRefreshTokens : config.useRefreshTokens,
    authorizationParams : {
    audience: config.audience,
    connection: config.connection,
    display: config.display, 
    invitation: config.invitation,
    login_hint: config.login_hint,
    max_age: config.max_age,
    organization: config.organization,
    prompt: config.prompt,
    scope: config.scope,
    screen_hint: config.screen_hint,
    ui_locales: config.ui_locales
      
    }
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentFromUrl(window.location.pathname)) {
    showContentFromUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  const bodyElement = document.getElementsByTagName("body")[0];

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  bodyElement.addEventListener("click", (e) => {
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");

      if (showContentFromUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    }
  });

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0Client.handleRedirectCallback();

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};
