const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "admin",
    port: 5432,
    database: "BANCOSOLAR"
});

const getUsuarios = async () => {
    try {
        const response = await pool.query('SELECT * FROM USUARIOS');
        return response.rows;
    } catch (error) {
        throw error;
    }
}

const saveUsuario = async (usuario) => {
    try {
        const response = await pool.query('INSERT INTO USUARIOS(nombre, balance) VALUES($1, $2) RETURNING *', [usuario.nombre, usuario.balance]);
        return response.rows[0];
    } catch (error) {
        throw error
    }
}
const updateUsusario = async (usuario) => {
    try {
        const response = await pool.query('UPDATE USUARIOS SET nombre = $1, balance = $2 WHERE id = $3', [usuario.nombre, usuario.balance, usuario.id]);
        return response.rows[0];
    } catch (error) {
        throw error;
    }
}
const deleteUsuario = async (id) => {
    try {
        const response = await pool.query('DELETE FROM USUARIOS WHERE id = $1', [id]);
        return response.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}
const getTransferencias = async () => {
    const query = {
        text: "SELECT T.ID, U.NOMBRE emisor, UU.NOMBRE receptor, T.MONTO, T.FECHA FROM TRANSFERENCIAS T INNER JOIN USUARIOS U ON  T.EMISOR= U.ID INNER JOIN USUARIOS UU ON T.RECEPTOR=UU.ID",
        rowMode: 'array'
    }

    try {
        const response = await pool.query(query);
        return response.rows;
    } catch (error) {
        console.log(error);
        return [];
    }
}
const saveTransferencia = async (transferencia) => {
    try {
        await pool.query("BEGIN");
        const users = await getUsuarios();
        const emisor = users.find(user => user.nombre == transferencia.emisor);
        const receptor = users.find(user => user.nombre == transferencia.receptor);
        emisor.balance =parseInt(emisor.balance)-parseInt(transferencia.monto)
        receptor.balance = parseInt(transferencia.monto) + parseInt(receptor.balance);
        await updateUsusario(emisor);
        await updateUsusario(receptor);
        const response = await pool.query('INSERT INTO TRANSFERENCIAS(emisor, receptor, monto, fecha) VALUES($1, $2, $3,current_date) RETURNING *', [emisor.id, receptor.id, transferencia.monto]);
        await pool.query("COMMIT");

        return response.rows[0];
    } catch (error) {
        throw error;
    }
}


module.exports = { getUsuarios, saveUsuario, updateUsusario, deleteUsuario, getTransferencias, saveTransferencia };
