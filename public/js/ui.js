
/**
 * Updates the user interface
 */
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0Client.isAuthenticated();
    
    if (isAuthenticated) {

      var elementsToShow = document.getElementsByClassName('auth-show');
      for (var i = 0; i < elementsToShow.length; i++) {
        // Remove the class
        elementsToShow[i].classList.remove('visually-hidden');
    }
    var elementsToHide = document.getElementsByClassName('auth-hide');
      for (var i = 0; i < elementsToHide.length; i++) {
        // Remove the class
        elementsToHide[i].classList.add('visually-hidden');
    }


      const user = await auth0Client.getUser();
      const claims = await auth0Client.getIdTokenClaims();
      const id_token = claims.__raw;
      const accessToken = await auth0Client.getTokenSilently();

      const decodedIDToken = jwtDecode(id_token);
      let decodedAccessToken;
      function isJWT(token) {
    // Split the token into parts
    const parts = token.split('.');
    
    // JWTs consist of three parts separated by dots
    return Array.isArray(parts) && parts.length === 3;
}
      if(isJWT(accessToken)){
      
      decodedAccessToken = jwtDecode(accessToken);
      }
      else {
      decodedAccessToken = "AT is an Opauqe Token"
      }
      
      document.getElementById("idToken-data").innerText = JSON.stringify(
        id_token,
        null,
        2
      );
      // document.getElementById("1234").innerText = JSON.stringify(
      //         id_token,
      //         null,
      //         2
      //       );
      

      document.getElementById("accessToken-decoded-data").innerText = JSON.stringify(
        decodedAccessToken,
        null,
        2
      );
      document.getElementById("idToken-decoded-data").innerText = JSON.stringify(
        decodedIDToken,
        null,
        2
      );

      document.getElementById("accessToken-data").innerText = JSON.stringify(
        accessToken,
        null,
        2
      );



      document.getElementById("profile-data").value = JSON.stringify(
        user,
        null,
        2
      );

      document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

      eachElement(".profile-image", (e) => (e.src = user.picture));
      eachElement(".user-name", (e) => (e.innerText = user.name));
      eachElement(".user-email", (e) => (e.innerText = user.email));
      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
      document.getElementById("initBtn").disabled = true;
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
       document.getElementById("initBtn").disabled = false;
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }

  console.log("UI updated");
};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
