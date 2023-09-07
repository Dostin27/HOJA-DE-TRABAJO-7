/* Orden comandos
npm init (enter a todo)
npm install express
npm install body-parser
npm install jsonwebtoken
npm install mongoose
npm node ./index.js
*/
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const secretKey = 'desarrolloweb';
const Segundos = 60;
app.use(bodyParser.json());

const usuarioBase = mongoose.model('Login', {
    dpi: Number,
    usuario: String,
    clave: String,
});

//cambiar ulr de conexion de db en mongo
mongoose.connect('mongodb+srv://usuario:password@urlconexión.net/nombreDeLaTabla', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB listo'))
    .catch(error => console.error('Error en MongoDB', error));


function TokenValidar(req, res, next) {
    const token = req.headers['authorization'];
    if (typeof token !== 'undefined') {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.sendStatus(403); // Forbidden
            } else {
                req.usuario = decoded.usuario;
                req.clave = decoded.clave;
                next();
            }
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
}

app.post('/proyecto/login/:dpi', async (req, res) => {
    const dpiVer = req.params.dpi;
    const usuario = req.body.usuario;
    const clave = req.body.clave;
    try {
        const usuarioMongo = await usuarioBase.findOne({ "dpi": dpiVer, "usuario": usuario, "clave": clave });
        if (usuarioMongo !== null) {
            const token = jwt.sign({ usuario: usuario, clave: clave }, secretKey, { expiresIn: Segundos + 's' });
            res.json({ token });
        } else {
            res.status(404).json({ error: 'Datos error' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Retorno error' });
    }
});

app.get('/proyecto/data', TokenValidar, (req, res) => {
    res.json({ "usuario": req.usuario, "clave": req.clave });
});

app.listen(port, () => {
    console.log(`App en puerto no. ${port}`);
});