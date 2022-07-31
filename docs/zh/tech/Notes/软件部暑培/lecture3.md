# C#
## .Net
``` 
dotnet --info //信息
dotnet new console --output ./Exp  //新建项目
dotnet run --project Exp    //运行项目
```

## C#类型
C# 是一种面向对象的强类型语言，具有一个庞大的类型系统。C# 类型系统的特点是，一切类型（除指针类型）均继承自 object （ System.Object ）类，即 object 类型是一切类型（除指针类型）的基类。

C# 的类型分为两种：值类型和引用类型（以及指针类型）。

System.ValueType 类（该类派生自 object 类）是所有值类型的直接或间接基类，其中结构类型
（ int 、自定义结构类型，等等）都直接派生自 System.ValueType 类，而枚举类型则直接派生自
System.Enum 类（该类派生自 System.ValueType 类）。

值类型不可被继承。

## 引用
引用类型对象实际上是两部分：一部分是对象真正的数据，开辟在托管堆上，另一部分是真正对象的引用，储存在内存栈或其他任何位置。

常用的引用类型包括 object 、 string ，或是程序员自己定义的类（ class ），接口（ interface ），委托（ delegate ），事件（ event ）等等。

## 装箱与拆箱
object 是C#的一个关键字，表示类型 System.Object ，它是所有类型（除指针类型）的公共基类，是一个引用类型。因此，object类型可以指向所有类型的托管对象。

我们知道，值类型不存在引用，那么一个 object 类型该如何指向值类型呢？

这就是装箱（Boxing）与拆箱（Unboxing）的机制。

当我们把一个值类型强制转换为 object 类型时，会在托管堆上 new 出一个 object 对象，用来存储这个值类型，这样就把值类型转换成了 object 类型。这个过程叫做“装箱” 。 

将一个装箱产生的 object 对象转回值类型的过程，就叫“拆箱”，这个过程会将储存在托管堆上的数据拿出来。

这样，通过装箱和拆箱，我们就实现了让每一个值类型都可以被转换为 object 类型。这种统一的类型系统为我们编程带来了巨大的便利。 

但是，频繁的装箱和拆箱也会有较大的性能损失，所以尽量避免大量的装箱与拆箱操作。 

``` C#
int x; 
object o = x; 
int y = (int)o;
```

值类型进行赋值是将该值类型的对象进行复制，而引用类型的复制是复制引用，而非对象本身。

函数传参时传入int并不会改变函数外int对象的值，而传入class会。

### GC
动态内存开辟在托管堆上。所谓托管堆，顾名思义，就是被托管了，开辟的空间资源不需要程序员手动回收，.NET提供了垃圾回收（GC）的机制完成GC。

## 类

### 访问修饰符

private : 这个字段只能够被本类所访问

public ：这个字段可以被随意访问

protected ：这个字段可以被本类及其派生类访问 

internal ：这个字段可以在本程序集内随意访问 

protected internal ：既可以被本来及其派生类访问，又可以在本程序集内随意访问

### 字段的默认值
C# 的字段可以定义默认值。若未指定默认值，则对于值类型默认值为 0 ，对于引用类型默认值为null 。

### 静态字段与常量
类可以含有静态字段，静态字段用 static 修饰。静态字段需要用“类名.字段名”的方式访问。 

类内也可以定义常量，用 const 修饰，常量不允许被修改。与静态字段一样，常量也必须由“类名.字段名”的方式访问。

``` C#
class Person 
{ public string name; 
private int age = 18; 
public static int population; 
public const string school = "THU"; }
```
### 属性
属性的访问器（大驼峰命名）
``` C#
private int age; 
public int Age { 
    get { Console.WriteLine("Get Age!"); 
            return age; }
    set { Console.WriteLine("Set Age!"); 
        age = value >= 0 ? value : 0; } } 

```
访问器包括:

``get 访问器``：当外部需要读取属性的值时，会调用 get 访问器。

``set 访问器``：当外部要设置属性的值时，会调用 set 访问器， value 是要设置的值。

``init 访问器（C# 9.0）``：只允许在对象构造期间设置属性的值。

### 简化函数体(=>)
如果函数体非常简短，可以使用 => 运算符：
```C#
class Adder 
{ static public int Add(int x, int y) => x + y; }
```

## 委托
“委托”是一种引用类型，作用与函数指针类似。需要用 delegate 关键字定义一个委托类型。委托类型的定义格式与方法类似，只是在返回值类型前加上 delegate 关键字：
```C#
delegate int Operate(int x, int y);
public static int Add(int x, int y) 
{ var res = x + y; 
Console.WriteLine($"{x} + {y} = {res}"); 
return res; }
Operate Op = new Operate(Add);
```

该段代码定义了一个委托类型，名字叫 Operate 。该委托可以接收参数为 (int, int) ，返回类型为int 的方法。

与其他引用类型一样，我们需要用 new 关键字创建一个委托，并将一个方法赋给这个委托。

```C#
Op(2, 1);
Op?.Invoke(2, 1);
```

## 继承
``` C#s
public class Derived : Base { }  
public sealed class Foo { } #密封类不可以被继承
```
## 事件
一般的多播委托存在一个问题：外部对象可以任意修改已发布的委托（如果该委托是一个公有成员），这就导致外部对象的订阅不再可靠。

例如，外部对象在订阅该委托时，直接将该委托置为 null ，这就直接导致其他订阅者的订阅失效，订阅因此不再可靠。

事件使用 ```event``` 关键字定义，其本质是一个特殊的多播委托。

事件只支持“订阅”与“取消订阅”两种操作，不允许直接对事件赋值，这保证了用户订阅的可靠性。

外部对象只能使用 += 、 -= 运算符对事件进行"订阅"、"取消订阅"。即事件只能放在 += 、 -= 运算符的左侧。
``` C#
public event EventHandler onWarning; // ...
onWarning += Function1; // Correct 
onWarning -= Function1; // Correct 
onWarning = null; // Error ! 
onWarning = onWarning + Function2; // Error ! 
onWarning?.Invoke(); 
```

## Lambda表达式

``` C#
(参数列表) => { 函数体 }
```

当参数只有一个时，参数列表的括号可以不写。

当函数体只有一句时，或只有返回值时，可以简写，如：

```C#
() => 1
```
lambda 表达式可以直接当作方法赋值给委托，例如:
```C#
var getAddOne = new Func<int, int>(x => x + 1); #尖括号内指定输入值和返回值
```

## partial类
C# 允许将类分开定义，可以使用 partial 关键字。
```C#
// in file 1: 
public partial class A { }
// in file 2 
public partial class A {  }
```