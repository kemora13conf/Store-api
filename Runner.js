import app from './Server/index.js';
import os from 'os';

const port = 8080

// make the server run on the local network as well

app.listen(port, '0.0.0.0', () => {
    //   console.log(os.networkInterfaces())
    const localIp = os.networkInterfaces().wlo1[0].address;
    console.log(`Server is running at http://${localIp}:${port}`);
});

// app.listen(port, console.log(`Server running on http://localhost:${PORT}`))