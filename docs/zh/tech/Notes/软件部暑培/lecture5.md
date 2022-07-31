# Makefile & CMake
## makefile
在makefile的同目录下输入 ```make``` ，就可以按照makefile所指定的编译规则自动编译整个工程。    

在makefile的同目录下输入 ```make clean```，可以删除编译生成的中间文件（如 .o 文件等）和可执行文件。

在makefile的同目录下输入 ```make install``` （一般需要root权限），可以安装编译好的可执行文件（默认路径为 /usr/local/bin ，安装好后可以在命令行中直接调用）、库（默认路径为 /usr/local/lib ，安装好后可以直接链接）、头文件（默认路径为 /usr/local/include ，安装好后可以直接使用 #include <xxx.h> 引用）。

```Cmake
cmake_minimum_required(VERSION 3.5) 
project (hello_world) 
add_executable(hello_world main.cpp)
```
```cmake_minimum_required(VERSION 3.5)``` CMake需要的最小版本。CMake的版本可以在命令行中输入 cmake --version 获取，一般无强制要求。     

```project(<project_name>)``` 指定工程名称。 

```add_executable(<executable_name> <cppfile_name>)``` 生成可执行文件


操作方法如下：
1. 输入 ``cmake CMakeLists.txt`` ，目录下将会生成一个 Makefile 文件。
2. 输入 ``make`` ，即可将源代码编译生成可执行文件。此处将会在与 CMakeLists.txt 相同目录的位置生成一个可执行文件 ``hello_word`` ，输入 ``./hello_word`` 即可运行该可执行文件。
3. 此外，输入 ``make help`` ，你也可以查看使用当前的 Makefile 所能执行的所有指令，例如 make clean （清楚生成的可执行文件和中间文件）。


1. ``set(<variable> <value>)`` 设置变量 

2. ``target_include_directories(<project_name> <INTERFACE|PUBLIC|PRIVATE> <headfile_directory>) ``指定所要包含的头文件。 
3. ``message("your message")`` 在终端打印信息。