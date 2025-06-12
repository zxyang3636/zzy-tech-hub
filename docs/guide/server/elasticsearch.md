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






## IK分词器

中文分词往往需要根据语义分析，比较复杂，这就需要用到中文分词器，例如**IK分词器**。IK分词器是林良益在2006年开源发布的，其采用的正向迭代最细粒度切分算法一直沿用至今。

其安装的方式也比较简单

**1. 下载ik分词器这个插件**

github 链接：https://github.com/medcl/elasticsearch-analysis-ik

github 下载地址：https://github.com/medcl/elasticsearch-analysis-ik/releases

**2. 方案1**

运行一个命令即可：
```shell
docker exec -it es ./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.12.1/elasticsearch-analysis-ik-7.12.1.zip
```
然后重启es容器：
```shell
docker restart es
```

**2. 方案2**

如果网速较差，也可以选择离线安装。
首先，查看之前安装的Elasticsearch容器的plugins数据卷目录：
```shell
docker volume inspect es-plugins
```

可以看到`elasticsearch`的插件挂载到了`/var/lib/docker/volumes/es-plugins/_data`这个目录。我们需要把IK分词器上传至这个目录。

找到ik分词器插件，安装的是`7.12.1`版本的ik分词器压缩文件;

然后上传至虚拟机的`/var/lib/docker/volumes/es-plugins/_data`这个目录：

最后，重启es容器：
```shell
docker restart es
```

查看下日志
```shell
docker logs -f es
```

可以看到如下字样
```log
"message": "loaded plugin [analysis-ik]" }
```


---

**使用IK分词器**

IK分词器包含两种模式：
-  `ik_smart`：智能语义切分 
-  `ik_max_word`：最细粒度切分 

我们在Kibana的DevTools上来测试分词器，首先测试Elasticsearch官方提供的标准分词器：
```
POST /_analyze
{
  "analyzer": "standard",
  "text": "黑马程序员学习java太棒了"
}
```

```json
{
  "tokens" : [
    {
      "token" : "黑",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "<IDEOGRAPHIC>",
      "position" : 0
    },
    {
      "token" : "马",
      "start_offset" : 1,
      "end_offset" : 2,
      "type" : "<IDEOGRAPHIC>",
      "position" : 1
    },
    {
      "token" : "程",
      "start_offset" : 2,
      "end_offset" : 3,
      "type" : "<IDEOGRAPHIC>",
      "position" : 2
    },
    {
      "token" : "序",
      "start_offset" : 3,
      "end_offset" : 4,
      "type" : "<IDEOGRAPHIC>",
      "position" : 3
    },
    {
      "token" : "员",
      "start_offset" : 4,
      "end_offset" : 5,
      "type" : "<IDEOGRAPHIC>",
      "position" : 4
    },
    {
      "token" : "学",
      "start_offset" : 5,
      "end_offset" : 6,
      "type" : "<IDEOGRAPHIC>",
      "position" : 5
    },
    {
      "token" : "习",
      "start_offset" : 6,
      "end_offset" : 7,
      "type" : "<IDEOGRAPHIC>",
      "position" : 6
    },
    {
      "token" : "java",
      "start_offset" : 7,
      "end_offset" : 11,
      "type" : "<ALPHANUM>",
      "position" : 7
    },
    {
      "token" : "太",
      "start_offset" : 11,
      "end_offset" : 12,
      "type" : "<IDEOGRAPHIC>",
      "position" : 8
    },
    {
      "token" : "棒",
      "start_offset" : 12,
      "end_offset" : 13,
      "type" : "<IDEOGRAPHIC>",
      "position" : 9
    },
    {
      "token" : "了",
      "start_offset" : 13,
      "end_offset" : 14,
      "type" : "<IDEOGRAPHIC>",
      "position" : 10
    }
  ]
}

```

可以看到，标准分词器智能1字1词条，无法正确对中文做分词。

我们再测试IK分词器：
```
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "黑马程序员学习java太棒了"
}
```
结果如下
```json
{
  "tokens" : [
    {
      "token" : "黑马",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "程序员",
      "start_offset" : 2,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "学习",
      "start_offset" : 5,
      "end_offset" : 7,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "java",
      "start_offset" : 7,
      "end_offset" : 11,
      "type" : "ENGLISH",
      "position" : 3
    },
    {
      "token" : "太棒了",
      "start_offset" : 11,
      "end_offset" : 14,
      "type" : "CN_WORD",
      "position" : 4
    }
  ]
}

```

---

```
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "黑马程序员学习java太棒了"
}
```
结果如下
```json
{
  "tokens" : [
    {
      "token" : "黑马",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "程序员",
      "start_offset" : 2,
      "end_offset" : 5,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "程序",
      "start_offset" : 2,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "员",
      "start_offset" : 4,
      "end_offset" : 5,
      "type" : "CN_CHAR",
      "position" : 3
    },
    {
      "token" : "学习",
      "start_offset" : 5,
      "end_offset" : 7,
      "type" : "CN_WORD",
      "position" : 4
    },
    {
      "token" : "java",
      "start_offset" : 7,
      "end_offset" : 11,
      "type" : "ENGLISH",
      "position" : 5
    },
    {
      "token" : "太棒了",
      "start_offset" : 11,
      "end_offset" : 14,
      "type" : "CN_WORD",
      "position" : 6
    },
    {
      "token" : "太棒",
      "start_offset" : 11,
      "end_offset" : 13,
      "type" : "CN_WORD",
      "position" : 7
    },
    {
      "token" : "了",
      "start_offset" : 13,
      "end_offset" : 14,
      "type" : "CN_CHAR",
      "position" : 8
    }
  ]
}

```



---

### **拓展词典**


随着互联网的发展，“造词运动”也越发的频繁。出现了很多新的词语，在原有的词汇列表中并不存在。比如：“泰裤辣”，“传智播客” 等。
```json
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "传智播客开设大学,真的泰裤辣！"
}
```

可以看到，传智播客和泰裤辣都无法正确分词。

所以要想正确分词，IK分词器的词库也需要不断的更新，IK分词器提供了扩展词汇的功能。

1）打开IK分词器config目录：`/var/lib/docker/volumes/es-plugins/_data/elasticsearch-analysis-ik-7.12.1/config/`

`IKAnalyzer.cfg.xml`文件

2）在`IKAnalyzer.cfg.xml`配置文件内容添加：

```xml{6}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
	<comment>IK Analyzer 扩展配置</comment>
	<!--用户可以在这里配置自己的扩展字典 -->
	<entry key="ext_dict">ext.dic</entry>
	 <!--用户可以在这里配置自己的扩展停止词字典-->
	<entry key="ext_stopwords"></entry>
	<!--用户可以在这里配置远程扩展字典 -->
	<!-- <entry key="remote_ext_dict">words_location</entry> -->
	<!--用户可以在这里配置远程扩展停止词字典-->
	<!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>

```


3）在IK分词器的config目录新建一个 `ext.dic`，可以参考config目录下复制一个配置文件进行修改
```txt
传智播客
泰裤辣
```

4）重启*elasticsearch*

```shell
docker restart es

# 查看 日志
docker logs -f es
```

再次测试，可以发现传智播客和泰裤辣都正确分词了：
```json
{
  "tokens" : [
    {
      "token" : "传智播客",
      "start_offset" : 0,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "开设",
      "start_offset" : 4,
      "end_offset" : 6,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "大学",
      "start_offset" : 6,
      "end_offset" : 8,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "真的",
      "start_offset" : 9,
      "end_offset" : 11,
      "type" : "CN_WORD",
      "position" : 3
    },
    {
      "token" : "泰裤辣",
      "start_offset" : 11,
      "end_offset" : 14,
      "type" : "CN_WORD",
      "position" : 4
    }
  ]
}

```


---

**总结**

分词器的作用是什么？
- 创建倒排索引时，对文档分词
- 用户搜索时，对输入的内容分词

IK分词器有几种模式？
- `ik_smart`：智能切分，粗粒度
- `ik_max_word`：最细切分，细粒度IK分词器

如何拓展分词器词库中的词条？
- 利用`config`目录的`IkAnalyzer.cfg.xml`文件添加拓展词典
- 在词典中添加拓展词条



## 索引库操作

### 基础概念

索引（index）：相同类型的文档的集合

映射（mapping）：索引中文档的字段约束信息，类似表的结构约束
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/wechat_2025-06-11_222039_990.png)

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-11_22-25-52.png)
`Index`就类似数据库表，`Mapping`映射就类似表的结构。我们要向`es`中存储数据，必须先创建`Index`和`Mapping`


### Mapping映射属性

Mapping是对索引库中文档的约束，常见的Mapping属性包括：
- `type`：字段数据类型，常见的简单类型有： 
  - 字符串：text（可分词的文本）、keyword（精确值，例如：品牌、国家、ip地址）
  - 数值：long、integer、short、byte、double、float、
  - 布尔：boolean
  - 日期：date
  - 对象：object
- `index`：是否创建索引，默认为`true`
- `analyzer`：使用哪种分词器
- `properties`：该字段的子字段

例如下面的json文档：

```json
{
    "age": 21,
    "weight": 52.1,
    "isMarried": false,
    "info": "黑马程序员Java讲师",
    "email": "zy@itcast.cn",
    "score": [99.1, 99.5, 98.9],
    "name": {
        "firstName": "云",
        "lastName": "赵"
    }
}
```

:::info
- score是float类型
- 如果对score进行排序，排序时，ES很智能，降序选取值最大的，升序选取值最小的
- 是否需要创建索引，要看该字段是否需要搜索和排序
:::

### 索引库的CRUD

由于Elasticsearch采用的是`Restful`风格的API，因此其请求方式和路径相对都比较规范，而且请求参数也都采用JSON风格。

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-06-12_21-27-08.png)

#### 创建索引库和映射

**基本语法：**
- 请求方式：PUT
- 请求路径：/索引库名，可以自定义
- 请求参数：mapping映射

格式：
```json
PUT /索引库名称
{
  "mappings": {
    "properties": {
      "字段名":{
        "type": "text",
        "analyzer": "ik_smart"
      },
      "字段名2":{
        "type": "keyword",
        "index": "false"
      },
      "字段名3":{
        "properties": {
          "子字段": {
            "type": "keyword"
          }
        }
      },
      // ...略
    }
  }
}
```


示例：
```json
PUT /heima
{
  "mappings": {
    "properties": {
      "info":{
        "type":"text",
        "analyzer": "ik_smart"
      },
      "age":{
        "type": "byte"
      },
      "email":{
        "type": "keyword",
        "index": false
      },
      "name":{
        "type": "object", 
        "properties": {
          "firstName":{
            "type":"keyword"
          },
          "lastName":{
            "type":"keyword"
          }
        }
      }
    }
  }
}
```
执行结果
```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "heima"
}

```


#### 查询索引库

**基本语法：**
-  请求方式：GET 
-  请求路径：/索引库名 
-  请求参数：无 

格式：
```
GET /索引库名
```
示例：
```
GET /heima
```


#### 删除索引库

**语法：**
-  请求方式：DELETE 
-  请求路径：/索引库名 
-  请求参数：无 

格式：
```
DELETE /索引库名
```
示例
```
DELETE /heima
```

---

#### 修改索引库

倒排索引结构虽然不复杂，但是一旦数据结构改变（比如改变了分词器），就需要重新创建倒排索引，这简直是灾难。因此索引库**一旦创建，无法修改mapping**。

虽然无法修改mapping中已有的字段，但是却允许添加新的字段到mapping中，因为不会对倒排索引产生影响。因此修改索引库能做的就是向索引库中添加新字段，或者更新索引库的基础属性。

**语法说明：**
```json
PUT /索引库名/_mapping
{
  "properties": {
    "新字段名":{
      "type": "integer"
    }
  }
}
```

**示例：**
```json
PUT /heima/_mapping
{
  "properties": {
    "age":{
      "type": "integer"
    }
  }
}
```

```json
PUT /heima/_mapping
{
  "properties":{
    "otherInfo":{
      "type":"text"
    }
  }
}
```

---

**总结**

索引库操作有哪些？
- 创建索引库：PUT /索引库名
- 查询索引库：GET /索引库名
- 删除索引库：DELETE /索引库名
- 修改索引库，添加字段：PUT /索引库名/_mapping

可以看到，对索引库的操作基本遵循的Restful的风格，因此API接口非常统一，方便记忆。





























