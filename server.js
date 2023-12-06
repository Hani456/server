const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = 2144;

const connection = async () => {
    const URL = "mongodb+srv://venkyfall2021:venky%4012024@clothes.xqeqcok.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(URL);
    try {
        await client.connect();
        console.info("connected succesfully!");
        const data = await getClothesData(client);
        return data;

    } catch (e) {
        console.error("Error connecting in database : " ,e);
    }
    finally {
        await client.close();
        console.log("Connection closed!");
    }
}

const getClothesData = async (client) => {
    const cursor = await client.db("Clothes_Database").collection("Clothes").find({});
    const clothesList = await cursor.toArray();
    return clothesList;
}

http.createServer(async (req, res) => {
    console.log(req.url);
    if (req.url === "/api") {
        console.log(req.url);
        try {
            const clothesData = await connection();
            console.log(JSON.stringify(clothesData));
            res.setHeader("Access-Control-Allow-Origin", '*')
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(clothesData));
        }
        catch (error) {
            console.error("Error fetching items:", error);
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("Internal Server Error");
        }
    }
    else {
        let filePath = path.join(__dirname, "public", req.url === '/' ? "portfolio.html" : req.url);
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code === "ENOENT"){
                    fs.readFile(path.join(__dirname, "public", "error.html"), (error, content) => {
                        if (error) throw error;
                        res.writeHead(200, { "content-type": "text/html" });
                        res.write(content, "utf-8");
                        res.end();
                    });
                }
                else{
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else {
                let contentType;
                const extName = path.extname(filePath);
                switch (extName) {
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
                res.writeHead(200, "Success", { "content-type": contentType });
                res.end(content, "utf-8");
            }
        });
    }
}).listen(PORT, () => console.info(`Server is running on port ${PORT}`));