import { fetchPlaceholders, getMetadata } from "../scripts/aem.js";

const authUtils = {
    isAuthPage: () => {
        return getMetadata("isauthenticationrequired") === "true";
    },
    policies: async () => {
        const { authSusiFlow, authIssuer } = await fetchPlaceholders();
        return {
            signUpSignInPolicy: authSusiFlow,
            issuer: authIssuer
        }
    },
    config: async () => {
        const { authClientId, authAuthority, authKnownAuthorities, authRedirectUri } = await fetchPlaceholders();
        return {
            auth: {
                clientId: authClientId,
                authority: authAuthority,
                knownAuthorities: authKnownAuthorities?.split(','),
                redirectUri: authRedirectUri,
                navigateToLoginRequestUrl: localStorage.getItem('isLoginPageFlow') !== 'true',
                postLogoutRedirectUri: location.pathname
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false,
            }
        }
    },
    getInstance: async () => {
        if(window.authInstance) {
            return window.authInstance;
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${window.hlx.codeBasePath}/commons/scripts/vendor/msal-browser.min.js`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = async () => {
                try {
                    const instance = await (msal.PublicClientApplication.createPublicClientApplication(await authUtils.config()));
                    window.authInstance = instance;
                    resolve(instance);
                } catch(error) {
                    reject();
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    login: async (isLoginPage = false) => {
        try {
            if(!isLoginPage) {
                localStorage.removeItem('isLoginPageFlow');
                localStorage.removeItem('loginPageFlowRedirectUri');
            }
            const instance = await authUtils.getInstance();
            if(!(await instance.getActiveAccount())) {
                await instance.loginRedirect();
            }
        } catch(error) {
            throw new Error("Error logging in");
        }
    },
    getToken: async (isInteractionRequired = false) => {
        try {
            const instance = await authUtils.getInstance();
            const account = await instance.getActiveAccount();
            if(!account) {
                return null;
            }
            if(Date.now() < (account.idTokenClaims.exp * 1000)) {
               return account.idToken;
            }
            const request = {};
            try {
                const response = await instance.acquireTokenSilent(request);
                if (!response.idToken || response.idToken === "") {
                    throw new msal.InteractionRequiredAuthError;
                } else {
                    return response.idToken;
                }
            } catch(error) {
                if (error instanceof msal.InteractionRequiredAuthError && isInteractionRequired) {
                    return instance.acquireTokenRedirect(request)
                }
            }
        } catch(error) {
            return null;
        }
        return null;
    },
    getProfile: async () => {
        try {
            const instance = await authUtils.getInstance();
            const claims = (await instance.getActiveAccount())?.idTokenClaims;
            const names = claims.name?.trim()?.split(' ') ?? [];
            return (claims) ? {
                city: claims.City,
                state: claims.State,
                email: claims.EmailAddress?.pop(),
                number: (claims.phoneNumber?.length > 10) ? claims.phoneNumber.replace(/\+91/g, '') : claims.phoneNumber,
                fname: (names[0] === 'unknown') ? '' : names[0] || '',
                lname: (names.length > 1) ? names[names.length - 1] : '',
            } : null;
        } catch(error) {
            return null;
        }
    },
    handleRedirect: async () => {
        const setAuthReady = () => {
            window.AUTH_READY = true;
            document.dispatchEvent(new Event('authready'));
        }
        try {
            const instance = await authUtils.getInstance();
            try {
                const response = await instance.handleRedirectPromise();
                if(response?.account) {
                    await instance.setActiveAccount(response.account);
                    setAuthReady();
                    return response.account;
                }
            } catch(error) {
                setAuthReady();
                return null;
            }
            const accounts = instance.getAllAccounts();
            if(accounts.length <= 0) {
                setAuthReady();
                return null;
            } else if(accounts.length >= 1) {
                await instance.setActiveAccount(accounts[0]);
            } else {
                const policies = await authUtils.policies();
                const config = await authUtils.config();
                const currentAccounts = accounts.filter(account =>
                    account.homeAccountId.toUpperCase().includes(policies.signUpSignInPolicy.toUpperCase())
                    && account.idTokenClaims.iss.toUpperCase().includes(policies.issuer.toUpperCase())
                    && account.idTokenClaims.aud === config.auth.clientId);
                if (currentAccounts.length > 1) {
                    if (currentAccounts.every(account => account.localAccountId === currentAccounts[0].localAccountId)) {
                        await instance.setActiveAccount(currentAccounts[0]);
                    } else {
                        authUtils.logout();
                    };
                } else if (currentAccounts.length === 1) {
                    await instance.setActiveAccount(currentAccounts[0]);
                }
            }
            setAuthReady();
            return (await instance.getActiveAccount());
        } catch(error) {
            setAuthReady();
            return null;
        }
    },
    logout: async () => {
        try {
            const instance = await authUtils.getInstance();
            await instance.logout();
            return true;
        } catch(error) {
            return false;
        }
    },
    waitForAuth: async () => {
        return new Promise((resolve) => {
            if(window.AUTH_READY) {
                resolve();
            } else {
                const handler = () => {
                    resolve();
                    document.removeEventListener('authready', handler);
                };
                document.addEventListener('authready', handler);
            }
        });
    }
}

export default authUtils;