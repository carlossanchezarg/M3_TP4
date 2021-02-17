
const express=require('express');
const app=express();
const mysql=require('mysql');
const util=require('util')
const port=3000;

app.use(express.static("public"));
app.use(express.urlencoded());
app.use(express.json());/*Permite mapear las peticiones de json a javascript object


//Coneccion la base de datos
/****************************/

const conexion=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'m3_u4',
});

conexion.connect((error)=>{
    if(error){
        console.log('ERROR:NO SE PUDO CONECTAR CON LA BASE DE DATOS.')
        throw error;
    }
    console.log('Conexion con la base de datos mysql establecida')
});


//Desarrollo de la logica de negocios:
/************************************/
//Permite usar aync y await en la conexion mysql,convirtiendo el query
//en una estructura de datos de tipo promise.
const qy=util.promisify(conexion.query).bind(conexion);

app.get('/usuarios',async (req,res)=>{
    try{
        const query='SELECT * FROM usuarios';

        const respuesta=await qy(query);

        res.send({"respuesta":respuesta});

    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error":e.message});
    }

});

app.get('/usuarios/:nombre',async (req,res)=>{
    try{
        const query='SELECT * FROM usuarios where nombre=?';

        const respuesta=await qy(query,[req.params.nombre]);

        res.send({"respuesta":respuesta});

    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error":e.message});
    }

});

app.post('/registrarse',async (req,res)=>{
    try{
        //validacion de informacion ingresada por el usuario
        if(!req.body.nombre&&!req.body.apellido){
            throw new Error('Debe ingresar nombre y apellido');
        }

        let query='SELECT * FROM usuarios WHERE nombre=? and apellido=?';

        let respuesta= await qy(query,[req.body.nombre,req.body.apellido]);
       
        if(respuesta.length>0){
            throw new Error('El usuario ya existe');
        }
        /*Cargo nuevo registro si el usuario no esta repetido*/ 
        query='INSERT INTO usuarios (nombre,apellido,edad,telCelular) VALUE (?,?,?,?)';
        respuesta=await qy(query,[req.body.nombre,req.body.apellido,req.body.edad,req.body.telCelular]);
        
        res.send({"respuesta":respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error":e.message});
    }

});


//Servidor
/**********/

app.listen(port,()=>{
    console.log('Servidor escuchando en el puerto '+port);
});
