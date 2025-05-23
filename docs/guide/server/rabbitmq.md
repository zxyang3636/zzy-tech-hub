# RabbitMQ

## 初识MQ


**同步调用**

>同步调用的优势是什么？
- 时效性强，等待到结果后才返回。

---

>同步调用的问题是什么？
- 拓展性差
- 性能下降
- 级联失败问题


---

**异步调用**

异步调用通常是基于消息通知的方式，包含三个角色：
- 消息发送者：投递消息的人，就是原来的调用者
- 消息接收者：接收和处理消息的人，就是原来的服务提供者
- 消息代理：管理、暂存、转发消息，你可以把它理解成微信服务器



支付服务不再同步调用业务关联度低的服务，而是发送消息通知到Broker。

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-22_22-16-43.png)

在异步调用中，发送者不再直接同步调用接收者的业务接口，而是发送一条消息投递给消息Broker。然后接收者根据自己的需求从消息Broker那里订阅消息。每当发送方发送消息后，接受者都能获取消息并处理。

这样，发送消息的人和接收消息的人就完全解耦了。

除了扣减余额、更新支付流水单状态以外，其它调用逻辑全部取消。而是改为发送一条消息到Broker。而相关的微服务都可以订阅消息通知，一旦消息到达Broker，则会分发给每一个订阅了的微服务，处理各自的业务。

不管后期增加了多少消息订阅者，作为支付服务来讲，执行问扣减余额、更新支付流水状态后，发送消息即可。业务耗时仅仅是这三部分业务耗时，仅仅100ms，大大提高了业务性能。

另外，不管是交易服务、通知服务，还是积分服务，他们的业务与支付关联度低。现在采用了异步调用，解除了耦合，他们即便执行过程中出现了故障，也不会影响到支付服务。

异调用的优势是什么？
- 耦合度低，拓展性强
- 异步调用，无需等待，性能好
- 故障隔离，下游服务故障不影响上游业务
- 缓存消息，流量削峰填谷

异步调用的问题是什么？
- 不能立即得到调用结果，时效性差
- 不确定下游业务执行是否成功
- 业务安全依赖于Broker的可靠性


## MQ技术选型

MQ （MessageQueue），中文是消息队列，字面来看就是存放消息的队列。也就是异步调用中的Broker。


目比较常见的MQ实现：
- ActiveMQ
- RabbitMQ
- RocketMQ
- Kafka


几种常见MQ的对比：
|        |	RabbitMQ	|ActiveMQ|	RocketMQ	|Kafka
|-----------|----|-------|-----|-----|
|公司/社区	|Rabbit|	Apache|	阿里|	Apache
|开发语言	|Erlang	|Java	|Java	|Scala&Java
|协议支持	|AMQP，XMPP，SMTP，STOMP|	OpenWire,STOMP，REST,XMPP,AMQP	|自定义协议|	自定义协议
|可用性	|  高	|一般	|高  	|高
|单机吞吐量	|一般	|差	|高	|非常高
|消息延迟	|微秒级|	毫秒级|	毫秒级	|毫秒以内
|消息可靠性|	高	|一般	|高	|一般

- 追求可用性：Kafka、 RocketMQ 、RabbitMQ
- 追求可靠性：RabbitMQ、RocketMQ
- 追求吞吐能力：RocketMQ、Kafka
- 追求消息低延迟：RabbitMQ、Kafka

据统计，目前国内消息队列使用最多的还是RabbitMQ，再加上其各方面都比较均衡，稳定性也好


## 安装部署rabbitmq

上传我们的`mq.tar`,rabbitmq的镜像文件
```Bash
docker load -i mq.tar 
```

执行docker命令
```Bash
docker run \
 -e RABBITMQ_DEFAULT_USER=itheima \
 -e RABBITMQ_DEFAULT_PASS=123321 \
 -v mq-plugins:/plugins \
 --name mq \
 --hostname mq \
 -p 15672:15672 \
 -p 5672:5672 \
 --network hm-net\
 -d \
 rabbitmq:3.8-management

```

:::info
15672是访问控制rabbitmq的控制台

5672是将来收发消息的端口
:::



我们访问 http://192.168.146.131:15672  即可看到管理控制台。首次访问需要登录，默认的用户名和密码在配置文件中已经指定了。

登录后即可看到管理控制台总览页面;

---

RabbitMQ对应的架构如图：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-23_21-09-41.png)

其中包含几个概念：
- publisher：生产者，也就是发送消息的一方
- consumer：消费者，也就是消费消息的一方
- queue：队列，存储消息。生产者投递的消息会暂存在消息队列中，等待消费者处理
- exchange：交换机，负责消息路由。生产者发送的消息由交换机决定投递到哪个队列。
- virtual host：虚拟主机，起到数据隔离的作用。每个虚拟主机相互独立，有各自的exchange、queue



### 快速入门
需求:在RabbitMO的控制台完成下列操作:
1. 新建队列hello.queue1和hello.queue2
2. 向默认的amp.fanout交换机发送一条消息
3. 查看消息是否到达hello.queue1和hello.queue2

**队列**

我们打开Queues选项卡，新建一个队列：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-23_21-24-03.png)

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-23_21-24-34.png)
再以相同的方式，创建一个队列，命名为hello.queue2

**绑定关系**

点击Exchanges选项卡，点击amq.fanout交换机，进入交换机详情页，然后点击Bindings菜单，在表单中填写要绑定的队列名称：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-23_21-25-56.png)

**发送消息**

再次回到`exchange`页面，找到刚刚绑定的`amq.fanout`，点击进入详情页，再次发送一条消息

回到`Queues`页面，可以发现`hello.queue`中已经有一条消息了

点击队列名称，进入详情页，查看队列详情，这次我们点击`get message`

可以看到消息到达队列了

---

**消息发送的注意事项有哪些?**
- 交换机只能路由消息，无法存储消息
- 交换机只会路由消息给与其绑定的队列，因此队列必须与交
换机绑定



### 数据隔离
**用户管理**

点击Admin选项卡，首先会看到RabbitMQ控制台的用户管理界面：

这里的用户都是RabbitMQ的管理或运维人员。目前只有安装RabbitMQ时添加的`itheima`这个用户。仔细观察用户表格中的字段，如下：
- Name：`itheima`，也就是用户名
- Tags：`administrator`，说明`itheima`用户是超级管理员，拥有所有权限
- Can access virtual host： /，可以访问的`virtual host`，这里的`/`是默认的`virtual host`


对于小型企业而言，出于成本考虑，我们通常只会搭建一套MQ集群，公司内的多个不同项目同时使用。这个时候为了避免互相干扰， 我们会利用`virtual host`的隔离特性，将不同项目隔离。一般会做两件事情：
- 给每个项目创建独立的运维账号，将管理权限分离。
- 给每个项目创建不同的`virtual host`，将每个项目的数据隔离。









