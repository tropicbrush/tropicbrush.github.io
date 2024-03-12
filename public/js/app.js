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
  const storedDomain = sessionStorage.getItem('auth0_domain') || 'tropicbrush.us.auth0.com';
  const storedClientId = sessionStorage.getItem('auth0_client_id') || 'e9HS1RUqY0i5UGa99W9BwpSxlSaPk9xU';
  if(storedDomain === 'abhishek-customers.us.auth0.com') {sessionStorage.setItem('auth0_domain',storedDomain )}
  if(storedClientId === 'y12dT3aFnRArFWcUSeLZqsONNihvggGF') {sessionStorage.setItem('auth0_client_id',storedClientId )} 
  const useRefreshTokens = sessionStorage.getItem('useRefreshTokens')|| undefined;
  const scopes = sessionStorage.getItem('scopes') || undefined;
  const audience = sessionStorage.getItem('audience') || undefined;
  const connection = sessionStorage.getItem('connection') || undefined;
  const display = sessionStorage.getItem('display') || undefined;    
  const invitation = sessionStorage.getItem('invitation') || undefined;
  const login_hint = sessionStorage.getItem('login_hint') || undefined
  const max_age = sessionStorage.getItem('max_age') || undefined;
  const organization = sessionStorage.getItem('organization') || undefined;
  const prompt = sessionStorage.getItem('prompt') || undefined;
  const screen_hint = sessionStorage.getItem('screen_hint') || undefined;
  const ui_locales = sessionStorage.getItem('ui_locales') || undefined;  

  let response = {"domain": storedDomain, "clientId":storedClientId, "useRefreshTokens":useRefreshTokens,
                   "authorizationParams" : {
                  "scope":scopes,
                     "audience": audience,
         "connection": connection,
          "display": display,
          "invitation": invitation,
          "login_hint": login_hint,
          "max_age": max_age,
          "organization": organization,
         "prompt": prompt,
         "screen_hint": screen_hint,
         "ui_locales": ui_locales}
         };
console.log("response :", response)
    
   for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('cust_field_')) {
                let keyName = key.replace(/^cust_field_/, ""); 
               response["authorizationParams"][keyName] = sessionStorage.getItem(key);
               console.log("response :", response) 
            }
        }
    
    

    return response;
  }
  catch(error){
    throw error
  }
}

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  console.log("configureClient called");
  const auth0ClientProps = await fetchAuthConfig();
  console.log("auth0ClientProps config :", auth0ClientProps);
  // const config = await response.json();

  // let auth0ClientProps = {
  //   domain: config.domain,
  //   clientId: config.clientId,
  //   useRefreshTokens : config.useRefreshTokens,
  //   authorizationParams : {
  //   audience: config.audience,
  //   connection: config.connection,
  //   display: config.display, 
  //   invitation: config.invitation,
  //   login_hint: config.login_hint,
  //   max_age: config.max_age,
  //   organization: config.organization,
  //   prompt: config.prompt,
  //   scope: config.scopes,
  //   screen_hint: config.screen_hint,
  //   ui_locales: config.ui_locales
      
  //   }
  // };

  
    auth0Client = await auth0.createAuth0Client(auth0ClientProps);
  
  // auth0Client = await auth0.createAuth0Client({
  //   domain: config.domain,
  //   clientId: config.clientId,
  //   useRefreshTokens : config.useRefreshTokens,
  //   authorizationParams : {
  //   audience: config.audience,
  //   connection: config.connection,
  //   display: config.display, 
  //   invitation: config.invitation,
  //   login_hint: config.login_hint,
  //   max_age: config.max_age,
  //   organization: config.organization,
  //   prompt: config.prompt,
  //   scope: config.scopes,
  //   screen_hint: config.screen_hint,
  //   ui_locales: config.ui_locales
      
  //   }
  // });
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

  // // If unable to parse the history hash, default to the root URL
  // if (!showContentFromUrl(window.location.pathname)) {
  //   showContentFromUrl("/");
  //   window.history.replaceState({ url: "/" }, {}, "/");
  // }

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
