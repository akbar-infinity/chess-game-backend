import express from 'express';
import cors from 'cors';
const app = express();
const port = 4001;

app.use(cors());

app.get('/',(req,res)=>{
    res.send('First route');
})

function isUniqueGameId(gameId):boolean {
    return true;
}

app.get('/getUniqueGameId',(req,res)=>{

    let gameId = Math.random().toString(36).slice(-10);

    while(!isUniqueGameId(gameId)) {
      gameId = Math.random().toString(36).slice(-10);
    }

    res.send({
        gameId,
        status: true,
    });
})

app.listen(port,()=>{
    console.log(`Server runnig on PORT ${port}`);
})