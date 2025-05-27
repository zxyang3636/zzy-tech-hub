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



## 快速入门案例(Simple模式)
SpringAmqp的官方地址：https://spring.io/projects/spring-amqp


**AMQP**

Advanced Message Queuing Protocol，是用于在应用程序之间传递业务消息的开放标准。该协议与语言和平台无关，更符合微服务中独立性的要求。


**Spring AMQP**

Spring AMQP是基于AMQP协议定义的一套API规范，提供了模板来发送和接收消息。包含两部分，其中spring-amqp是基础抽象，spring-rabbit是底层的默认实现。

---

需求如下：
- 利用控制台创建队列simple.queue
- 在publisher服务中，利用SpringAMQP直接向simple.queue发送消息
- 在consumer服务中，利用SpringAMQP编写消费者，监听simple.queue队列

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-26_21-52-20.png)




新建一个队列
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-26_22-22-48.png)


1. 引入依赖
```xml
<!--AMQP依赖，包含RabbitMQ-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

2. 配置RabbitMQ服务端信息
```yaml [application.yaml]
spring:
  rabbitmq:
    host: 192.168.146.131 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123321 # 密码
```


在test包中建一个消息发送者
```java
@SpringBootTest
class SpringAmqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    public void testSimpleQueue() {
        String queueName = "simple.queue";
        String message = "Hello Spring AMQP!";
        rabbitTemplate.convertAndSend(queueName, message);
    }

}
```


在项目代码中建一个消息消费者，并注册为bean
```java
@Component
@Slf4j
public class SpringRabbitListener {

    @RabbitListener(queues = "simple.queue")
    public void listenSimpleQueue(String msg) {
        log.info("监听到simple.queue的消息:{}", msg);
    }
}
```


## WorkQueue(Work模式)
`Work queues`，任务模型。简单来说就是让多个消费者绑定到一个队列，共同消费队列中的消息。

成员：一个生产者，一个队列，多个消费者

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-26_22-27-11.png)


```java
@Test
public void testWorkQueue() {
    String queueName = "work.queue";
    for (int i = 1; i <= 50; i++) {
        String message = "Hello Spring AMQP!" + "  " + i;
        rabbitTemplate.convertAndSend(queueName, message);
    }
}
```

```java
    @RabbitListener(queues = "work.queue")
    public void listenWorkQueue1(String msg) {
        System.out.println("消费者1接收到消息：" + msg + "  " + LocalDateTime.now());
    }

    @RabbitListener(queues = "work.queue")
    public void listenWorkQueue2(String msg) {
        System.err.println("消费者2接收到消息：" + msg + "  " + LocalDateTime.now());
    }
```


默认情况下，RabbitMQ的会将消息依次轮询投递给绑定在队列上的每一个消费者。但这并没有考虑到消费者是否已经处理完消息，可能出现消息堆积。

因此我们需要修改application.yml，设置preFetch值为1，确保同一时刻最多投递给消费者1条消息：
```yaml{11-13}[application.yml]
logging:
  pattern:
    dateformat: MM-dd HH:mm:ss:SSS
spring:
  rabbitmq:
    host: 192.168.146.131 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123321 # 密码
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息

```

---

Work模型的使用：
- 多个消费者绑定到一个队列，可以加快消息处理速度
- 同一条消息只会被一个消费者处理
- 通过设置prefetch来控制消费者预取的消息数量，处理完一条再处理下一条，实现能者多劳

## Fanout交换机

交换机的作用主要是接收发送者发送的消息，并将消息路由到与其绑定的队列。

常见交换机的类型有以下三种：
- Fanout：广播
- Direct：定向
- Topic：话题

---


Fanout，英文翻译是扇出，我觉得在MQ中叫广播更合适。

在广播模式下，消息发送流程是这样的：
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-26_23-04-30.png)

- 1）  可以有多个队列
- 2）  每个队列都要绑定到Exchange（交换机）
- 3）  生产者发送的消息，只能发送到交换机
- 4）  交换机把消息发送给绑定过的所有队列
- 5）  订阅队列的消费者都能拿到消息




实现思路如下：
- 在RabbitMQ控制台中，声明队列fanout.queue1和fanout.queue2
- 在RabbitMQ控制台中，声明交换机hmall.fanout，将两个队列与其绑定
- 在consumer服务中，编写两个消费者方法，分别监听fanout.queue1和fanout.queue2
- 在publisher中编写测试方法，向hmall.fanout发送消息


![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-26_23-08-02.png)


```java
    @Test
    public void testFanoutQueue() {
        // 队列名称
        String exchangeName = "hmall.fanout";
        String message = "Hello everyone";
        // 发送消息，参数分别是:交互机名称、RoutingKey(暂时为空)、消息
        rabbitTemplate.convertAndSend(exchangeName, null, message);
    }
```


```java [SpringRabbitListener.java]
    @RabbitListener(queues = "fanout.queue1")
    public void listenFanoutQueue1(String msg) {
        log.info("消费者1监听到fanout.queue1的消息:{}", msg);
    }

    @RabbitListener(queues = "fanout.queue2")
    public void listenFanoutQueue2(String msg) {
        log.info("消费者2监听到fanout.queue2的消息:{}", msg);
    }
```


交换机的作用是什么?
- 接收publisher发送的消息
- 将消息按照规则路由到与之绑定的队列
- FanoutExchange的会将消息路由到每个绑定的队列


## Direct交换机

在Fanout模式中，一条消息，会被所有订阅的队列都消费。但是，在某些场景下，我们希望不同的消息被不同的队列消费。这时就要用到Direct类型的Exchange。

`Direct Exchange` 会将接收到的消息根据规则路由到指定的`Queue`，因此称为定向路由。
- 每一个`Queue`都与`Exchange`设置一个`BindingKey`
- 发布者发送消息时，指定消息的`RoutingKey`
- `Exchange`将消息路由到`BindingKey`与消息`RoutingKey`一致的队列

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-27_21-58-51.png)

---
**案例需求如图：**
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-27_22-09-52.png)

1. 创建两个`queue`

- direct.queue1

- direct.queue2

2. 创建交换机并绑定：
- hmall.direct

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-27_22-09-17.png)

3. 生产者
```java
    @Test
    public void testDirectQueue() {
        String exchangeName = "hmall.direct";
        String message = "Hello red";
        rabbitTemplate.convertAndSend(exchangeName, "red", message);
    }


    @Test
    public void testDirectQueue() {
        String exchangeName = "hmall.direct";
        String message = "Hello blue";
        rabbitTemplate.convertAndSend(exchangeName, "blue", message);
    }
```

4. 消费者
```java
    @RabbitListener(queues = "direct.queue1")
    public void listenDirectQueue1(String msg) {
        log.info("消费者1监听到direct.queue1的消息:{}", msg);
    }

    @RabbitListener(queues = "direct.queue2")
    public void listenDirectQueue2(String msg) {
        log.info("消费者2监听到direct.queue2的消息:{}", msg);
    }
```

---

**总结**

描述下Direct交换机与Fanout交换机的差异？
- Fanout交换机将消息路由给每一个与之绑定的队列
- Direct交换机根据RoutingKey判断路由给哪个队列
- 如果多个队列具有相同的RoutingKey，则与Fanout功能类似


## Topic交换机

`Topic`类型的`Exchange`与`Direct`相比，都是可以根据`RoutingKey`把消息路由到不同的队列。

只不过`Topic`类型`Exchange`可以让队列在绑定`BindingKey` 的时候使用通配符！


`BindingKey` 一般都是有一个或多个单词组成，多个单词之间以`.`分割，例如： `item.insert`

通配符规则：
- `#`：匹配一个或多个词
- `*`：匹配不多不少恰好1个词

举例：
- `item.#`：能够匹配`item.spu.insert` 或者 `item.spu`
- `item.*`：只能匹配`item.spu`

![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-27_22-55-44.png)


---

**利用SpringAMQP演示DirectExchange的使用**

需求如下：
- 在RabbitMQ控制台中，声明队列topic.queue1和topic.queue2
- 在RabbitMQ控制台中，声明交换机hmall. topic ，将两个队列与其绑定
- 在consumer服务中，编写两个消费者方法，分别监听topic.queue1和topic.queue2
- 在publisher中编写测试方法，利用不同的RoutingKey向hmall. topic发送消息

1. 创建队列
- `topic.queue1`
- `topic.queue2`

2. 创建交换机类型为`topic`，并绑定队列

- `hmall.topic`
![](https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/Snipaste_2025-05-27_23-02-31.png)

3. 生产者
```java
    @Test
    public void testTopiceQueue() {
        String exchangeName = "hmall.topic";
        String message = "Hello all";
        // china.news所有消费者都能收到
        rabbitTemplate.convertAndSend(exchangeName, "china.news", message);
    }
```



4. 消费者
```java
    @RabbitListener(queues = "topic.queue1")
    public void listenTopicQueue1(String msg) {
        log.info("消费者1监听到topic.queue1的消息:{}", msg);
    }

    @RabbitListener(queues = "topic.queue2")
    public void listenTopicQueue2(String msg) {
        log.info("消费者2监听到topic.queue2的消息:{}", msg);
    }
```

---

**总结**

描述下`Direct`交换机与`Topic`交换机的差异？
- `Topic`交换机接收的消息`RoutingKey`必须是多个单词，以 `.`分割
- `Topic`交换机与队列绑定时的`bindingKey`可以指定通配符
- `#`：代表0个或多个词
- `*`：代表1个词