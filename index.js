const http = require('http');
const fs = require('fs');
const url = require('url');
const { getUsuarios, saveUsuario, updateUsusario, deleteUsuario, getTransferencias, saveTransferencia } = require('./consulta');


const server = http.createServer(async (req, res) => {
    console.log(req.url, req.method);
    //●/ GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba.
    if (req.url === '/') {
        res.end(fs.readFileSync('./index.html'));
    }

    //●/usuarios GET: Devuelve todos los usuarios registrados con sus balances.

    if (req.url === '/usuarios') {
        const result = await getUsuarios();
        res.estatusCode = 200;
        res.end(JSON.stringify(result));
    }

    //●/usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL
    if (req.url === '/usuario' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        })
        req.on('end', async () => {
            const data = JSON.parse(body);
            const result = await saveUsuario(data);
            res.estatusCode = 200;
            res.end(JSON.stringify(result));
        })
    }
    
    //●/usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
    if (req.url.startsWith('/usuario?') && req.method === 'PUT') {
        console.log("here");
        const { id } = url.parse(req.url, true).query;
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        })
        req.on('end', async () => {
            const data = JSON.parse(body);
            data.id=id;
            const result = await updateUsusario(data);
            res.estatusCode = 200;
            res.end(JSON.stringify(result));
        })
    }
    // ● /usuario DELETE: Recibe el id de un usuario registrado y lo elimina.
    if (req.url.startsWith('/usuario?') && req.method === 'DELETE') {
        const { id } = url.parse(req.url, true).query;
        const result = await deleteUsuario(id);
        res.estatusCode = 200;
        res.end(JSON.stringify(result));
    }
    // ● /transferencias GET: Devuelve todas las transferencias almacenadas en la base de
    if (req.url === '/transferencias') {
        
        const result = await getTransferencias();

        res.estatusCode = 200;
        res.end(JSON.stringify(result));
        
    }
    // ● /transferencia POST: Recibe los datos para realizar una nueva transferencia. Se debe
    // ocupar una transacción SQL en la consulta a la base de datos.
    if (req.url === '/transferencia' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        })
        req.on('end', async () => {
            try{
            const data = JSON.parse(body);
            const result = await saveTransferencia(data);
            res.estatusCode = 200;
            res.end(JSON.stringify( result));
        }catch(err){
            res.estatusCode = 400;
            res.end(JSON.stringify(err));
        }
        })
    }

    
    // datos en formato de arreglo.

}).listen(3000, () => console.log('ESCUCHANDO PUERTO 3000'));