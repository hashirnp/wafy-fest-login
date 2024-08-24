const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { auth } = require('./common/sheet.js');

const { google } = require('googleapis');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine('hbs', exphbs.engine({ extname: '.hbs', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');


// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Dummy user data for authentication
const users = [
    {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('password', 10) // hashed password
    }
];


// Routes
app.get('/', (req, res) => {
    res.render('login', { layout: 'main', title: 'Login', error: '' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    var status = await checkUser(username, password);



    if (status) {
        //get collage info
        var college = await getCollageInfo(username);
        //get coordinator info
        var coordinator = await getCoordinatorInfo(username);
        //get registration link 
        var registration = await getRegistrationLink(username);
        //get result
        var result=await getResult(username);
        //get notification
        var notification = await getNotification(username);


        res.render('dashboard', {
            layout: 'main',
            title: 'Dashboard',
            currentTime: new Date().toLocaleString(),
            college: college,
            coordinator: coordinator,
            registration:registration,
            result:result,
            notification:notification

        });
    } else {
        return res.render('login', { error: 'Invalid username or password' });
    }

});


async function checkUser(username, password) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'Login!A2:B',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            for (const row of rows) {
                const aff = row[0];
                const pass = row[1];

                if (aff === username && pass === password) {
                    return true;
                }
            }

            return false;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}

async function getCollageInfo(aff) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'College Info!A2:Z',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            for (const row of rows) {
                const temp = row[0];


                if (temp === aff) {
                    const college = {
                        aff: row[0],
                        name: row[1],
                        THM: row[2],
                        Aliya: row[3],
                        PG: row[4],
                        studentsThm: row[5],
                        studentsAliya: row[6],
                        studentsPg: row[7],
                        total: row[8],
                        zone: row[9],
                        email: row[10],
                        address: row[11],
                        phone: row[12],

                    }

                    return college;
                }
            }

            return null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}

async function getCoordinatorInfo(aff) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'Coordinator Info!A2:D',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            for (const row of rows) {
                const temp = row[0];


                if (temp === aff) {
                    const coordinator = {
                        coordinator: row[1].split(',')[0],
                        coordinatorMobile: row[1].split(',')[1],
                        coordinatorWhatsApp: row[1].split(',')[2],

                        manager: row[2].split(',')[0],
                        managerMobile: row[2].split(',')[1],
                        managerWhatsApp: row[2].split(',')[2],

                        assistant: row[3].split(',')[0],
                        assistantMobile: row[3].split(',')[1],
                        assistantWhatsApp: row[3].split(',')[2],

                    }

                    return coordinator;
                }
            }

            return null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}


async function getRegistrationLink(aff) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'Registration!A2:I',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            for (const row of rows) {
                const temp = row[0];
                if (temp === aff) {
                    const registration = {
                        thmOff: row[1],
                        thmOn: row[2],
                        aliyaOn: row[3],
                        aliyaOff: row[4],
                        pgOn: row[5],
                        pgOff: row[6],
                        general: row[7],
                        special: row[8],

                    }

                    return registration;
                }
            }

            return null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}


async function getResult(aff) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'Results!A2:I',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            for (const row of rows) {
                const temp = row[0];
                if (temp === aff) {
                    const result = {
                        item: row[1], 
                        particiapation: row[2],
                        college: row[3],
                        pg: row[4],
                        special: row[5],

                    }
                    return result;
                }
            }

            return null;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}

async function getNotification(aff) {
    try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch the data from the specified sheet and range
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1B_-iJtl2P2MxwVfo5my0i2f_Ua5AR3RvJMETKsZNsF4',
            range: 'Results!A2',
        });

        // The actual data is in response.data.values
        const rows = response.data.values;

        if (rows.length) {

            return rows[0][0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return false; // Ensure to return false in case of an error
    }
}


// Middleware to check if the user is authenticated
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
}

app.post('/dashboard', (req, res) => {
    res.render('dashboard', { layout: 'main', title: 'Dashboard', currentTime: new Date().toLocaleString() });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = { app };