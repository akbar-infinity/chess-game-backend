import express from 'express';
const app = express();
const port = 4001;


app.get('/',(req,res)=>{
    res.send('First route');
})

app.listen(port,()=>{
    console.log(`Server runnig on PORT ${port}`);
})