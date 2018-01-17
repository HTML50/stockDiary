const fs = require('fs');
//const cmd = require('child_process')

//读取买卖盈亏
let dataflow= fs.readFileSync('./data/data','utf8').split('\n'), dataToBeWritten = 'var data = {\n';

for(v of dataflow){
  let arr =  v.split('|'); 
     date = arr[0],
      price = arr[1];
      dataToBeWritten+= date+":"+price+",\n";
}

dataToBeWritten = dataToBeWritten.slice(0,dataToBeWritten.lastIndexOf(','))
dataToBeWritten += '\n}'
fs.writeFile('./temp/data',dataToBeWritten,{encoding:'utf-8',mode:'0666'},function(err){
   if(err) console.log(err)
})






//读取交易笔记
dataflow= fs.readFileSync('./diray/notes','utf8').split('\n'), dataToBeWritten = 'var notes = [\n';

for(v of dataflow){
  let arr =  v.split('|'); 
     date = arr[0],
     time = arr[1],
      id = arr[2],
      name=arr[3],
      operation = arr[4],
      price = arr[5],
      amount =arr[6],
      memo =arr[8];
      dataToBeWritten+= `{ 
        date:"${date}",
        time:"${time}",
        id:${id},
        name:"${name}",
        operation:"${operation}",
        price:${price},
        amount:${amount},
        memo:"${memo}"
      },\n`
}
dataToBeWritten = dataToBeWritten.slice(0,dataToBeWritten.lastIndexOf(','))
dataToBeWritten += '\n]'


fs.writeFile('./temp/notes',dataToBeWritten,{encoding:'utf-8',mode:'0666'},function(err){
   if(err) console.log(err)
})



console.log("已更新所有交易数据");


//cmd.exec("google-chrome index.html")
