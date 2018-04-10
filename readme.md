# stockDiary股票操作记录

一个**不成熟**的基于*nodejs*，以*文本文件*作为数据存储媒介的股票交易记录工具。



clone到本地，在ubuntu下执行：

```
node server.js
```

查看效果。



# 目录结构

./data	（相当于数据库，文本形式记录）

​	data 记录每次交易收益的列表

​	holding 当前持股的情况

​	notes 具体的每次交易记录、时间、价格、想法

​	stock 股票ID与股票名对应的数据库

​	summary 周总结，暂时没用

./temp	（渲染为数组、对象的数据）

​	data 根据./data/data文件生成的Object

​	notes 根据./data/notes文件生成的Array



./

​	index.html 展示页

​	server.js http服务与数据操作



# 功能

- 新增一条买入或卖出记录
- 读取记录

