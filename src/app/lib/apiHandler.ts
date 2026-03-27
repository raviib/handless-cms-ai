
interface x_auth {
    [key: string]: string;
}
async function getRequest(url: string): Promise<any | null> {
    const requestOptions: RequestInit = {
        method: "GET",
        cache: 'no-store'
    };

    try {
        const res = await fetch(`${url}`, requestOptions);

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
async function getWithTokenRequest(url: string, x_auth: x_auth): Promise<any | null> {
    const requestOptions: RequestInit = {
        method: "GET",
        cache: 'no-store',
        headers: {
            ...x_auth,
        },
    };
    try {
        const res = await fetch(`${url}`, requestOptions);
        return await res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
async function postRequest(url: string, body: any, x_auth: x_auth): Promise<any | null> {
    const requestOptions: RequestInit = {
        method: "POST",
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...x_auth,
        },
        body: JSON.stringify(body)
    };

    try {
        const res = await fetch(`${url}`, requestOptions);

        const jsonResponse = await res.json();
        return jsonResponse;

    } catch (error) {
        
        return null;
    }
}
export async function postFormDataRequest(url: string, formData: FormData, x_auth: x_auth): Promise<any | null> {
    const requestOptions: RequestInit = {
        method: "POST",
        cache: 'no-store',
        headers: {
            // Don't manually set 'Content-Type', it will be automatically handled by FormData
            ...x_auth,
        },
        body: formData
    };

    try {
        const res = await fetch(`${url}`, requestOptions);


        const jsonResponse = await res.json();

        return jsonResponse;

    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
async function putRequest(url: string, body: any, x_auth: x_auth): Promise<any | null> {

    const requestOptions: RequestInit = {
        method: "PUT",
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...x_auth,
        },
        body: JSON.stringify(body)
    };
    try {
        const res = await fetch(`${url}`, requestOptions);
        // if (!res.ok) {
        //     return null;
        // }
        const jsonResponse = await res.json();
        return jsonResponse;
    } catch (error) {
        console.error('PUT Fetch error:', error);
        return null;
    }
}

export async function generalApiCall(url: string, method: 'GET' | 'POST' | 'PUT' | 'GET_USER' | 'F_POST', body?: any, x_auth: x_auth = {}): Promise<any | null> {


    let res;
    if (method === 'GET') {
        res = await getRequest(url);
    } else if (method === 'GET_USER') {
        res = await getWithTokenRequest(url, x_auth);
    } else if (method === 'POST') {
        res = await postRequest(url, body, x_auth);
    } else if (method === 'PUT') {
        res = await putRequest(url, body, x_auth);
    } else {
        throw new Error(`Unsupported method: ${method}`);
    }

    return res;
}