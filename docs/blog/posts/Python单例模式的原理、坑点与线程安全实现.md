---
title: Python单例模式的原理、坑点与线程安全实现
date: '2026-10-31'
category: 原理讲解
tags: [python, 单例]
description: Python单例模式保证一个类在程序运行期间只创建一个实例。本文从一段简洁的单例代码出发，解释它的运行原理、输出结果，以及线程安全、继承、__init__重复执行等容易踩的坑，最后对比几种常见单例实现方式。
read: 10
order: 1
---

# Python 单例模式

<ArticleMeta />

## 摘要

单例模式保证一个类在程序运行期间只创建一个实例。Python 中常见实现方式之一，是重写 `__new__` 方法并配合类属性缓存实例。本文从一段简洁的单例代码出发，解释它的运行原理、输出结果，以及线程安全、继承、`__init__` 重复执行等容易踩的坑，最后对比几种常见单例实现方式。

------

## 一、先看最基础的单例代码


```python
class Singleton(object):
    # 私有类属性
    __instance = None

    def __new__(cls, *args, **kwargs):
        if not cls.__instance:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    def __str__(self):
        return '<%s>' % self.__class__.__name__


if __name__ == '__main__':
    a = Singleton()
    b = Singleton()
    print(a is b)
    print(f'a : {a}')
    print(f'b : {b}')
```



输出结果：


```text
True
a : <Singleton>
b : <Singleton>
```



`a is b` 为 `True`，说明两次调用 `Singleton()` 得到的是同一个对象。这就是单例模式最核心的效果。

------

## 二、这段代码为什么能实现单例？

### 1. `__new__` 负责创建实例

在 Python 中，创建对象大致会经历两个阶段：

1. `__new__`：负责创建并返回实例；
2. `__init__`：负责初始化实例。

普通情况下，每次调用 `Singleton()` 都会创建一个新对象。但这里重写了 `__new__`：


```python
def __new__(cls, *args, **kwargs):
    if not cls.__instance:
        cls.__instance = super().__new__(cls)
    return cls.__instance
```



第一次创建时，`cls.__instance` 是 `None`，于是调用父类的 `__new__` 创建一个实例，并保存到类属性中。

第二次创建时，`cls.__instance` 已经存在，于是直接返回之前保存的实例。

所以：

python

```
a = Singleton()
b = Singleton()
```



`a` 和 `b` 指向同一个对象。

### 2. `__str__` 只是控制打印效果


```python
def __str__(self):
    return '<%s>' % self.__class__.__name__
```



它让 `print(a)` 或 f-string 格式化时输出 `<Singleton>`，让示例输出更直观。

### 3. `__instance` 的“私有”是名称改写

代码里写了：


```python
__instance = None
```



双下划线开头的属性会触发 Python 的名称改写机制。在 `Singleton` 类内部，`cls.__instance` 实际上会被改写成类似：


```python
cls._Singleton__instance
```



所以它并不是严格意义上的“私有属性”，而是通过名称改写降低了被外部直接访问的概率。

------

## 三、这段代码虽然短，但有几个坑

### 坑 1：不是线程安全的

如果多个线程同时第一次调用 `Singleton()`，可能都判断到 `cls.__instance` 为空，然后各自创建一个实例。

例如两个线程几乎同时执行：

```python
if not cls.__instance:
    cls.__instance = super().__new__(cls)
```



就可能出现竞争条件，最终单例被破坏。

线程安全版本可以加锁：


```python
import threading


class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
```



这里使用了双重检查：

- 第一次判断避免每次加锁；
- 加锁后再判断一次，防止并发时重复创建。

### 坑 2：`__init__` 每次都会执行

`__new__` 控制实例创建，但 `__init__` 仍然会在每次调用类时执行。

例如：


```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        print("init 被调用")
```



执行：


```python
a = Singleton()
b = Singleton()
```



会看到 `init 被调用` 打印两次。也就是说，实例是同一个，但初始化逻辑可能重复执行。

如果 `__init__` 里有副作用，可以加一个初始化标记：


```python
class Singleton:
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self.__class__._initialized:
            print("init 只执行一次")
            self.__class__._initialized = True
```



### 坑 3：继承时可能出问题

原代码中的 `cls.__instance` 在类定义时会被名称改写成与 `Singleton` 绑定的属性。子类继承后，可能仍然访问父类保存的实例，导致子类返回父类实例，而不是子类实例。

如果希望每个类各自拥有单例，可以用一个字典按类保存：


```python
import threading


class Singleton:
    _instances = {}
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__new__(cls)
        return cls._instances[cls]
```



这样 `Singleton` 和它的子类可以分别持有自己的实例。

### 坑 4：`if not cls.__instance` 不如 `if cls.__instance is None`

如果实例对象定义了 `__bool__` 或 `__len__`，它的布尔值可能为 `False`，从而影响判断。更稳妥的写法是：


```python
if cls.__instance is None:
    ...
```



### 坑 5：单例不一定是最好的设计

单例会引入全局状态，可能带来：

- 测试困难；
- 隐式依赖；
- 并发共享状态问题；
- 生命周期不清晰。

很多场景下，模块级对象、依赖注入、工厂模式可能更合适。

------

## 四、更推荐的完整写法

一个相对完整的示例：


```python
import threading


class Singleton:
    _instances = {}
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__new__(cls)
        return cls._instances[cls]

    def __str__(self):
        return f"<{self.__class__.__name__}>"


if __name__ == "__main__":
    a = Singleton()
    b = Singleton()

    print(a is b)
    print(f"a : {a}")
    print(f"b : {b}")
```



输出仍然是：


```text
True
a : <Singleton>
b : <Singleton>
```



这个版本解决了线程安全问题，也避免了一部分继承问题。

------

## 五、Python 中还有哪些单例实现方式？

### 1. 模块级对象

Python 模块天然只加载一次，模块中的对象可以作为单例使用。


```python
# singleton.py
class _Config:
    def __init__(self):
        self.debug = False

config = _Config()
```



其他文件 `from singleton import config`，拿到的就是同一个对象。这是 Python 中最简单、最常用的“单例”。

### 2. 装饰器实现单例

通过闭包缓存实例：


```python
def singleton(cls):
    instances = {}

    def wrapper(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return wrapper


@singleton
class Database:
    pass


a = Database()
b = Database()
print(a is b)  # True
```



注意：装饰器返回的是函数 `wrapper`，不再是类，因此会丢失类的一些特性（如继承、`isinstance` 判断）。

### 3. 元类实现单例

在实例创建阶段统一控制：


```python
class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class Singleton(metaclass=SingletonMeta):
    pass


a = Singleton()
b = Singleton()
print(a is b)  # True
```



元类方式对使用者透明，但理解成本较高，且同样要注意线程安全。

### 4. Borg 模式

不保证只有一个对象，但让多个对象共享同一份状态：


```python
class Borg:
    _shared_state = {}

    def __init__(self):
        self.__dict__ = self._shared_state


a = Borg()
b = Borg()
a.x = 1
print(b.x)  # 1
print(a is b)  # False
```



Borg 模式适合“共享状态”比“唯一对象”更重要的场景。

### 实现方式对比

| 方式           | 是否唯一对象   | 线程安全 | 继承友好 | 理解成本 | 适用场景           |
| :------------- | :------------- | :------- | :------- | :------- | :----------------- |
| 重写 `__new__` | 是             | 需加锁   | 一般     | 低       | 教学、简单场景     |
| 模块级对象     | 是             | 天然安全 | 不涉及   | 最低     | 配置、全局服务     |
| 装饰器         | 是             | 需加锁   | 差       | 低       | 简单类             |
| 元类           | 是             | 需加锁   | 好       | 高       | 框架、需要统一控制 |
| Borg 模式      | 否（共享状态） | 视实现   | 好       | 中       | 共享配置、状态     |

------

## 六、总结

你给出的这段代码展示了 Python 单例模式最经典的实现思路：

- 用类属性保存实例；
- 重写 `__new__` 控制实例创建；
- 用 `is` 判断两个变量是否指向同一对象；
- 用 `__str__` 控制打印输出。

但它也有明显局限：

- 不是线程安全的；
- `__init__` 会重复执行；
- 继承时可能混淆；
- 单例本身可能带来全局状态问题。

如果只是写示例，这段代码足够清晰；如果用于生产环境，建议至少补上线程安全和按类缓存实例的处理。对于大多数业务代码，模块级对象往往已经够用；只有在确实需要“全局唯一对象”语义时，再考虑完整的单例模式。