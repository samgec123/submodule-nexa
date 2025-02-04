const utility = {
        async fetchData(url, requestBody, headers) {
        try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });
    
        if (!response.ok) {
            throw new Error(`Request failed: ${response.statusText}`);
        }
    
        const result = await response.json();
        if (result.error) {
            throw new Error(result.message || 'Request failed.');
        }
    
        return { success: true, data: result };
        } catch (error) {
        return { success: false, message: error.message };
        }
    },

    setHeader(userType, addonHeaders) {
        const headers = { 'Content-Type': 'application/json', ...addonHeaders };
        if (userType === 'dealer') {
        const dealerAuthorization = sessionStorage.getItem('mspin_token');
        headers['X-dealer-Authorization'] = dealerAuthorization;
        } else {
        const authorization = sessionStorage.getItem('access_token');
        headers.Authorization = authorization;
        }
        return headers;
    },
    getCookie(name) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i += 1) { // Replace i++ with i += 1
          let c = ca[i];
          while (c.charAt(0) === ' ') { // Use strict equality
            c = c.substring(1, c.length);
          }
          if (c.indexOf(nameEQ) === 0) { // Use strict equality
            return c.substring(nameEQ.length, c.length);
          }
        }
        return null;
    },
    addOptions(selectId, startOptNum, endOptNum) {
        const selectElement = document.getElementById(selectId);
        if(selectElement){
          const fragment = document.createDocumentFragment();
          for (let i = startOptNum; i <= endOptNum; i += 1) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            fragment.appendChild(option);
          }
          selectElement.appendChild(fragment);
        }
      }
};
export default utility;