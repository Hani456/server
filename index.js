const http = require("http");
const file = require("fs");
const path = require("path");
const {MongoClient} = require("mongodb");

const PORT = 2144;

async function connection () {
    const URL = "mongodb+srv://venkyfall2021:venky%4012024@clothes.xqeqcok.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(URL);
    try{
        await client.connect();
        console.log("Database connected successfully");
        const clothes = await getClothesData(client);
        return clothes;
    }catch(error){
        console.log(error);
    }finally{
        await client.close();
        console.log("Connection closed");
    }
}
async function getClothesData(client){
    const cursor = await client.db("Clothes_Database").collection("Clothes").find({});
    const clothesData = await cursor.toArray();
    return clothesData;
}

http.createServer(async(req,res)=>{
    if (req.url === "/api") {
        console.log(req.url);
        try {
            const result = await connection();
            console.log(JSON.stringify(result));
            res.setHeader("Access-Control-Allow-Origin", '*')
            res.writeHead(200,{"content-type":"application/json"});
            res.end(JSON.stringify(result));
        }
        catch (error) {
            console.error("Error fetching items:", error);
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("Internal Server Error");
        }
    }
    else {
        let filePath = path.join(__dirname, "public", req.url === '/' ? "portfolio.html" : req.url);
        file.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code === "ENOENT"){
                    file.readFile(path.join(__dirname, "public", "404.html"), (error, content) => {
                        if (error) throw error;
                        res.writeHead(200,  { "content-type": "text/html" });
                        res.end(content, "utf-8");
                    });
                }
                else{
                    res.writeHead(500,  { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else {
                let extPath = path.extname(filePath);
                switch (extPath) {
                    case '.css':
                        contentType = "text/css";
                        break;
                    case '.js':
                        contentType = "text/javascript";
                        break;
                    case '.json':
                        contentType = "application/json";
                        break;
                    case '.html':
                        contentType = "text/html";
                        break;
                    default:
                        contentType = "text/plain";
                }
                res.writeHead(200, { "content-type": contentType });
                res.end(content, "utf-8");
            }
        });
    }
}).listen(PORT,()=>{console.log(`Server is connected on ${PORT}`)});