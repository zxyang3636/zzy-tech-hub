# Elasticsearch

**查询效率较低**

由于数据库模糊查询不走索引，在数据量较大的时候，查询性能很差。


数据库模糊查询随着表数据量的增多，查询性能的下降会非常明显，而搜索引擎的性能则不会随着数据增多而下降太多。目前仅10万不到的数据量差距就如此明显，如果数据量达到百万、千万、甚至上亿级别，这个性能差距会非常夸张。

**功能单一**

数据库的模糊搜索功能单一，匹配条件非常苛刻，必须恰好包含用户搜索的关键字。而在搜索引擎中，用户输入出现个别错字，或者用拼音搜索、同义词搜索都能正确匹配到数据。

综上，在面临海量数据的搜索，或者有一些复杂搜索需求的时候，推荐使用专门的搜索引擎来实现搜索功能。

目前全球的搜索引擎技术排名如下：

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_20-28-46.png)



## 认识ES

`Lucene`是一个Java语言的搜索引擎类库，是Apache公司的顶级项目，由DougCutting于1999年研发。官网地址：https://lucene.apache.org/ 。

Lucene的优势：
- 易扩展
- 高性能（基于倒排索引）

---

- 2004年Shay Banon基于Lucene开发了Compass
- 2010年Shay Banon 重写了Compass，取名为Elasticsearch。
- 官网地址: https://www.elastic.co/cn/ ，目前最新的版本是：8.x.x
- elasticsearch具备下列优势：
    1. 支持分布式，可水平扩展
    2. 提供Restful接口，可被任何语言调用



---


`Elasticsearch`是由`elastic`公司开发的一套搜索引擎技术，它是`elastic`技术栈中的一部分。完整的技术栈包括：
- `Elasticsearch`：用于数据存储、计算和搜索
- `Logstash/Beats`：用于数据收集
- `Kibana`：用于数据可视化
整套技术栈被称为`ELK`，经常用来做日志收集、系统监控和状态分析等等：

整套技术栈的核心就是用来存储、搜索、计算的`Elasticsearch`

我们要安装的内容包含2部分：
- `elasticsearch`：存储、搜索和运算
- `kibana`：图形化展示

首先Elasticsearch不用多说，是提供核心的数据存储、搜索、分析功能的。

然后是Kibana，Elasticsearch对外提供的是Restful风格的API，任何操作都可以通过发送http请求来完成。不过http请求的方式、路径、还有请求参数的格式都有严格的规范。这些规范我们肯定记不住，因此我们要借助于Kibana这个服务。

Kibana是elastic公司提供的用于操作Elasticsearch的可视化控制台。它的功能非常强大，包括：
- 对Elasticsearch数据的搜索、展示
- 对Elasticsearch数据的统计、聚合，并形成图形化报表、图形
- 对Elasticsearch的集群状态监控
- 它还提供了一个开发控制台（DevTools），在其中对Elasticsearch的Restful的API接口提供了语法提示

## 安装ES
上传好我们的镜像
```bash
docker load -i es.tar
```

```bash
docker load -i kibana.tar
```

通过下面的Docker命令即可安装单机版本的elasticsearch：
```Bash
docker run -d \
  --name es \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e "discovery.type=single-node" \
  -v es-data:/usr/share/elasticsearch/data \
  -v es-plugins:/usr/share/elasticsearch/plugins \
  --privileged \
  --network hm-net \
  -p 9200:9200 \
  -p 9300:9300 \
  elasticsearch:7.12.1
```

:::info
`9200端口`：我们访问的http端口

`9300端口`：将来若有集群，集群间通讯端口

注意，这里我们采用的是elasticsearch的7.12.1版本，由于8以上版本的JavaAPI变化很大，在企业中应用并不广泛，企业中应用较多的还是8以下的版本。
:::


**查看下运行日志**
```bash
docker logs -f es
```
安装完成后，访问9200端口，即可看到响应的Elasticsearch服务的基本信息

访问该地址：http://192.168.146.131:9200/

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_21-18-09.png)


## 安装Kibana

kibana的作用：方便的操作es(通过发送请求的方式)

通过下面的Docker命令，即可部署Kibana：
```bash
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=hm-net \
-p 5601:5601  \
kibana:7.12.1
```

:::tip
-e 环境变量配的是es的地址，用于操作es；该地址写的是`es`,这是容器名，要根据es部署时的容器名来定；当然这里也可以写虚拟机ip地址；

注意es与kibana网络也必须在同一个网络下
:::


安装完成后，直接访问5601端口，
http://192.168.146.131:5601/

选择`Explore on my own`之后，进入主页面：

然后选中`Dev tools`，进入开发工具页面：

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_21-25-07.png)




## 倒排索引

elasticsearch之所以有如此高性能的搜索表现，正是得益于底层的倒排索引技术。

倒排索引的概念是基于MySQL这样的正向索引而言的。

**正向索引**

我们先来回顾一下正向索引。
例如有一张名为tb_goods的表：
|     id    |        title    |     price     |
| ---------  |  ------------| -----------  |
|     1    |       小米手机     |      3499    |
|     2    |        华为手机    |     4999     |
|     3    |       华为小米充电器     |    49      |
|     4    |       小米手环     |      49    |
|     ...    |     ...       |     ...     |


其中的`id`字段已经创建了索引，由于索引底层采用了B+树结构，因此我们根据id搜索的速度会非常快。但是其他字段例如`title`，只在叶子节点上存在。

因此要根据`title`搜索的时候只能遍历树中的每一个叶子节点，判断title数据是否符合要求。

比如用户的SQL语句为：

```sql
select * from tb_goods where title like '%手机%';
```

那搜索的大概流程如图：

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_21-34-57.png)

说明：
- 1）检查到搜索条件为like '%手机%'，需要找到title中包含手机的数据
- 2）逐条遍历每行数据（每个叶子节点），比如第1次拿到id为1的数据
- 3）判断数据中的title字段值是否符合条件
- 4）如果符合则放入结果集，不符合则丢弃
- 5）回到步骤1


综上，根据id精确匹配时，可以走索引，查询效率较高。而当搜索条件为模糊匹配时，由于索引无法生效，导致从索引查询退化为全表扫描，效率很差。

因此，正向索引适合于根据索引字段的精确搜索，不适合基于部分词条的模糊匹配。

而倒排索引恰好解决的就是根据部分词条模糊匹配的问题。

---

**倒排索引**

倒排索引中有两个非常重要的概念：
- 文档（`Document`）：用来搜索的数据，其中的每一条数据就是一个文档。例如一个网页、一个商品信息
- 词条（`Term`）：文档按照语义分成的词语；对文档数据或用户搜索数据，利用某种算法分词，得到的具备含义的词语就是词条。例如：我是中国人，就可以分为：我、是、中国人、中国、国人这样的几个词条

**创建倒排索引**是对正向索引的一种特殊处理和应用，流程如下：
- 将每一个文档的数据利用**分词算法**根据语义拆分，得到一个个词条
- 创建表，每行数据包括词条、词条所在文档id、位置等信息
- 因为词条唯一性，可以给词条创建**正向**索引
此时形成的这张以词条为索引的表，就是倒排索引表，两者对比如下：

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_21-53-38.png)


倒排索引的搜索流程如下（以搜索"华为手机"为例），如图：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-10_21-51-37.png)


流程描述：
- 1）用户输入条件"华为手机"进行搜索。
- 2）对用户输入条件**分词**，得到词条：华为、手机。
- 3）拿着词条在倒排索引中查找（**由于词条有索引，查询效率很高**），即可得到包含词条的文档id：1、2、3。
- 4）拿着文档`id`到正向索引中查找具体文档即可（由于`id`也有索引，查询效率也很高）。

虽然要先查询倒排索引，再查询正向索引，但是无论是词条、还是文档id都建立了索引，查询速度非常快！无需全表扫描。

---

**总结**

>什么是文档和词条？
- 每一条数据就是一个文档
- 对文档中的内容分词，得到的词语就是词条

>什么是正向索引？

- 基于文档id创建索引。根据id查询快，但是查询词条时必须先找到文档，而后判断是否包含词条

>什么是倒排索引？
- 对文档内容分词，对词条创建索引，并记录词条所在文档的id。查询时先根据词条查询到文档id，而后根据文档id查询文档






