let http = require('http');
let url = require('url');
let fs = require('fs');
let cmd = require('child_process');
//股票代码名称对应
let stockDate = require('./data/stock');
let port = 8080;
//持股信息
let holdings = {}

//更新数据
render();
console.log("已更新所有交易数据");

http.createServer(function(req, res) {
    var params = url.parse(req.url, true);

    //console.log(params)

    //查询股票代码名称
    if (params.query.id) {
        var name = stockDate.data[params.query.id];
        if (!name) name = "代码有误";
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' })
        res.end(name);
    }

    //写入notes
    else if (params.query.stockID) {
        var temp = params.query.date + '|' + params.query.time + '|' + params.query.stockID + '|' + params.query.name + '|' + params.query.operation + '|' + params.query.price + '|' + params.query.amount + '|' + params.query.price * params.query.amount + '|' + params.query.memo
        fs.writeFile('./data/notes', '\n' + temp, { encoding: 'utf-8', mode: '0666', flag: 'a' }, function(err) {
            if (err) console.log(err)
        })



        //涉及买入，更新holdings
        if (params.query.operation === '买入') {

            let id = params.query.stockID,
                amount = params.query.amount,
                value = amount * params.query.price;

            holdings[id] = {
              amount,
              value
            };

            //重写holding，将Object转为字符串writeTemp
            let writeTemp = "";

            for (let id in holdings) {
                writeTemp += "\n" + id + "|" + stockDate.data[id] + "|" + holdings[id].amount + "|" + holdings[id].value;
            }



            //writeTemp写入holdings文件
            writeTemp = writeTemp.slice(1, writeTemp.length); //去掉上面规定格式的第一行的行首换行
            fs.writeFile('./data/holding', writeTemp, { encoding: 'utf-8', mode: '0666' }, function(err) {
                if (err) console.log(err)
            })

            //更新静态数据文件temp
            render();
        }

        //涉及卖出，更新data
        if (params.query.operation === '卖出') {

            let id = params.query.stockID,
                balance = accMul(params.query.amount,accSub(params.query.price,holdings[id].value / holdings[id].amount));
            if (holdings[id].amount === params.query.amount) {
                delete holdings[id]
            } else {
                //卖出了部分股票
                holdings[id] = {
                    amount: holdings[id].amount - params.query.amount,
                    value: -Math.round(params.query.amount * params.query.price - holdings[id].value/holdings[id].amount*params.query.amount)
                }
            }


            //重写holding
            let writeTemp = "";


            //  股票代码 | 名称 | 持股数量 | 价值 
            for (let id in holdings) {
                writeTemp += "\n" + id + "|" + stockDate.data[id] + "|" + holdings[id].amount + "|" + holdings[id].value;
            }

            writeTemp = writeTemp.slice(1, writeTemp.length); //去掉第一行的行首换行
            fs.writeFile('./data/holding', writeTemp, { encoding: 'utf-8', mode: '0666' }, function(err) {
                if (err) console.log(err)
            })

            //data新增一条
            // 日期 | 盈亏
            writeTemp = params.query.date + "|" + balance;


            new Promise(function(resolve, reject) {
                fs.writeFile('./data/data', '\n' + writeTemp, { encoding: 'utf-8', mode: '0666', flag: 'a' }, function(err) {
                    if (err) console.log(err)
                    else resolve()
                })
            }).then(render);
            //更新静态数据文件temp

        }


        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    } else {
        //http服务器
        if (params.pathname === '/' && params.path === '/') {
            res.writeHead(200);
            fs.createReadStream('index.html').pipe(res);
        } else {
            fs.stat('.' + params.pathname, function(err, stats) {
                if (err) 
{                    res.writeHead(404);
                    res.end();
                    return
                }
                res.writeHead(200);
                fs.createReadStream('.' + params.pathname).pipe(res);
            })
        }

    }
}).listen(port, function() {
    console.log('http服务启动，端口' + port);
})

//打开web
cmd.exec("google-chrome http://127.0.0.1:8080/")



function render() {
    //读取当前持股holding
    let dataflow = fs.readFileSync('./data/holding', 'utf8').split('\n');
    for (v of dataflow) {
        if (v) {
            let arr = v.split('|');
            id = arr[0],
                amount = arr[2],
                value = arr[3];
            holdings[id] = {
                amount,
                value
            };
        }
    }


    //读取交易笔记notes 
    dataflow = fs.readFileSync('./data/notes', 'utf8').split('\n'), dataToBeWritten = 'var notes = [\n';

    for (v of dataflow) {
        let arr = v.split('|');
        date = arr[0],
            time = arr[1],
            id = arr[2],
            name = arr[3],
            operation = arr[4],
            price = arr[5],
            amount = arr[6],
            memo = arr[8];
        dataToBeWritten += `{ 
        date:"${date}",
        time:"${time}",
        id:"${id}",
        name:"${name}",
        operation:"${operation}",
        price:${price},
        amount:${amount},
        memo:"${memo}"
      },\n`
    }
    dataToBeWritten = dataToBeWritten.slice(0, dataToBeWritten.lastIndexOf(','))
    dataToBeWritten += '\n]'


    fs.writeFile('./temp/notes', dataToBeWritten, { encoding: 'utf-8', mode: '0666' }, function(err) {
        if (err) console.log(err)
    })

    //读取买卖盈亏data
    dataflow = fs.readFileSync('./data/data', 'utf8').split('\n'), dataToBeWritten = 'var data = {\n';

    for (v of dataflow) {
        let arr = v.split('|');
        date = arr[0],
            price = arr[1];
        dataToBeWritten += date + ":" + price + ",\n";

    }

    dataToBeWritten = dataToBeWritten.slice(0, dataToBeWritten.lastIndexOf(','))
    dataToBeWritten += '\n}'

    fs.writeFile('./temp/data', dataToBeWritten, { encoding: 'utf-8', mode: '0666' }, function(err) {
        if (err) console.log(err)
    })
}


function accSub(arg1, arg2) { 
    var r1, r2, m, n; 
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 } 
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 } 
    m = Math.pow(10, Math.max(r1, r2)); 
    n = (r1 >= r2) ? r1 : r2; 
    return ((arg1 * m - arg2 * m) / m).toFixed(n); 
} 

function accMul(arg1,arg2)
{
var m=0,s1=arg1.toString(),s2=arg2.toString();
try{m+=s1.split(".")[1].length}catch(e){}
try{m+=s2.split(".")[1].length}catch(e){}
return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}