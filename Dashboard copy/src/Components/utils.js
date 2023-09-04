const Fetch = async (url, method, body, content_type='application/json') => {
    let response;
    switch (method) {
        case 'GET':
            response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': content_type,
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        
                },
            });
            break;
        case 'POST':
            response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': content_type,
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
            });
            break;
        case 'PUT':
            response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': content_type,
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
            });
            break;
        case 'DELETE':
            response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': content_type,
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
            });
            break;
        default:
            response = await fetch(url, {
                method,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': content_type,
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
            });
            break;
    }
    return await response.json();
}

export default Fetch;