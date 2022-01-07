const request = require("request-promise");
const cheerio = require("cheerio");
const NodeCache = require('node-cache')
let myCache = new NodeCache()


const url = "https://www.chessgames.com/chessecohelp.html";

var express = require('express');
const { Console } = require("console");

var app = express();
var PORT = process.env.port||4000;
app.set('view engine', 'ejs');

let data = [];
async function heavyComputation() {
    const response = await request({
        uri: url,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
        },
        gzip: true,

    });
    let $ = cheerio.load(response);
    data = $("tbody").text().trim().split("\n");
    console.log("data updated successfully");
    return data;

};

app.get("/", (req, res) => {
    console.log(req.header);
    res.render("index", { id: "" });
});
app.get("/data", async (req, res) => {

    if (myCache.has('uniqueKey')) {
        console.log('Retrieved value from cache !!')
        data = myCache.get('uniqueKey');
    }
    else {
        data = await heavyComputation();
        myCache.set('uniqueKey', data)
        setTimeout(function () {
            console.log("data cleared successfully");
            myCache = new NodeCache();
        }, 180000);
        console.log('Value not present in cache,'
            + ' performing computation')
    }
    console.log(req.query.id);
    console.log(data);

    if (!req.query.id)
        res.send(JSON.stringify(data));
    else {
        let flag = 0;
        for (let i = 0; i < data.length; i += 2) {
            if (data[i].substring(0, 3).toLowerCase() == req.query.id.toLowerCase()) {
                console.log("data found ")
                flag = 1;
                res.send(JSON.stringify([data[i], data[i + 1]]));
            }
        }
        if (flag == 0) {
            console.log("data not found ")
            res.status(404).json("not found");
        }
        res.end();
    }
});

app.get("/:id", (req, res) => {
    console.log(req.params.id);
    res.render("index", { id: req.params.id });
});


app.listen(PORT, function (err) {
    console.log("Server listening on Port", PORT);
})
