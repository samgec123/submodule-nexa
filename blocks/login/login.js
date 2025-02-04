import authUtils from "../../commons/utility/authUtils.js";
import { fetchPlaceholders } from "../../commons/scripts/aem.js";

export default async function decorate(block) {
    const { authDefaultFallbackRedirect, authRedirectUri } = await fetchPlaceholders();
    const isRedirectPage = window.location.pathname === authRedirectUri;
    const isLoginPageFlow = localStorage.getItem('isLoginPageFlow') === 'true';
    if(!isLoginPageFlow && isRedirectPage) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    let redirectUrl = params.get('loginRedirect');
    if(isRedirectPage) {
        redirectUrl = localStorage.getItem('loginPageFlowRedirectUri');
    }
    if(!redirectUrl) {
        redirectUrl = authDefaultFallbackRedirect;
    }
    authUtils.waitForAuth().then(async () => {
        const profile = await authUtils.getProfile();
        if(profile || isRedirectPage) {
            localStorage.removeItem('isLoginPageFlow');
            localStorage.removeItem('loginPageFlowRedirectUri');
            window.open(redirectUrl, '_self');
        } else {
            localStorage.setItem('isLoginPageFlow', 'true');
            localStorage.setItem('loginPageFlowRedirectUri', redirectUrl);
            authUtils.login(true);
        }
    });
}