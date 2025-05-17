# Markdown 展示示例

示例如下

## 链接图标

B 站链接图标：[哔哩哔哩](https://www.bilibili.com/)

### c

####

d

## 荧光文本

**Input**

```md
<sapn class="marker-evy">这里是尤雨溪的主页样式，鼠标放在我上面看效果</sapn>
```

<sapn class="marker-evy">这里是尤雨溪的主页样式，鼠标放在我上面看效果</sapn>

## 文本 >

**Input**

```md
> xxxx 文本
```

> xxxx 文本

## 图片引用

**Input**

```md
![LOGO](./public/logo.png)
```

![](./public/logo.png)
![](https://images.pexels.com/photos/106118/pexels-photo-106118.jpeg)

## 视频引用

<video src="./public/U7zAVzZOzwxIfjc.mp4" controls="controls"></video>

<!-- <xgplayer url="./public/iBXUuTy6.mp4" poster="./public/logo.png" /> -->

## 链接

**Input**

```md
[Baidu](https://www.baidu.com)
```

[Baidu](https://www.baidu.com)

## 表格

**Input**

```md
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

## Emoji

:tada: :100:🌅

> Emoji 大全：https://www.emojiall.com/zh-hans/

## 代码带标题

_input_

````md
```c [HelloWorld.c]
#include <stdio.h>

int main(){

  printf("Hello World !!!");

  return 0;
}
```
````

```c [HelloWorld.c]
#include <stdio.h>

int main(){

  printf("Hello World !!!");

  return 0;
}

```

## 折叠语法

**Input**

```md
<details>
  <summary>点我展开</summary>
  Markdown默认折叠语法，Vitepress可以使用容器折叠语法，更加美观
</details>
```

**Output**

<details>
  <summary>点我展开</summary>
  Markdown默认折叠语法，Vitepress可以使用容器折叠语法，更加美观
</details>

## 代码组带图标

**input**

````md
::: code-group

```sh [pnpm]
#查询pnpm版本
pnpm -v
```

```sh [yarn]
#查询yarn版本
yarn -v
```

:::
````

::: code-group

```sh [pnpm]
#查询pnpm版本
pnpm -v
```

```sh [yarn]
#查询yarn版本
yarn -v
```

:::

# Markdown Extension Examples

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## Syntax Highlighting

VitePress provides Syntax Highlighting powered by [Shiki](https://github.com/shikijs/shiki), with additional features like line-highlighting:

**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## More

Check out the documentation for the [full list of markdown extensions](https://vitepress.dev/guide/markdown).
