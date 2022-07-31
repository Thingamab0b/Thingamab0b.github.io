# 标定 Calibration
> 优雅，太优雅了
## 标定的目的
- 一个就是矫正由于镜头畸变造成的图片的变形，例如，现实中的直线，拍摄成图像后会外凸或内凹，进行相机标定后可以对这种情况进行校正；

- 另一个是根据拍摄获得的二维图像来重构三维场景，因为标定的过程就是通过一系列的三维点和它对应的二维图像点进行数学变换，求出相机的内参数和外参数。

标定之后的相机，可以进行测距、三维场景的重建等。

## 标定方法
### 传统相机标定法
传统相机标定法需要使用尺寸已知的标定物，通过建立标定物上坐标已知的点与其图像点之间的对应，利用一定的算法获得相机模型的内外参数。根据标定物的不同可分为**三维标定物**和**平面型标定物**。

三维标定物可由单幅图像进行标定，标定精度较高，但高精密三维标定物的加工和维护较困难。平面型标定物比三维标定物制作简单，精度易保证，但标定时必须采用两幅或两幅以上的图像。传统相机标定法在标定过程中始终需要标定物，且标定物的制作精度会影响标定结果。同时有些场合不适合放置标定物也限制了传统相机标定法的应用。

### 基于主动视觉的相机标定法
基于主动视觉的相机标定法是指已知相机的某些运动信息对相机进行标定。该方法不需要标定物，但需要控制相机做某些特殊运动，利用这种运动的特殊性可以计算出相机内部参数。

基于主动视觉的相机标定法的优点是算法简单，往往能够获得线性解，故鲁棒性较高，缺点是系统的成本高、实验设备昂贵、实验条件要求高，而且不适合于运动参数未知或无法控制的场合。

### 零失真相机标定法
零失真相机标定法是以LCD显示屏为参考基准，以相移光栅为媒介，建立LCD像素与相机传感器像素之间的映射关系，确定每个相机像素点在LCD上的视点位置。镜头使相机在LCD上的视场为非矩形。在这个有畸变的视场内，可以构造一个内接的虚拟传感器，并保持相同的像素数。这样每个虚拟像素点就一定落在某四个相邻视点构成的任意四边形之内。虚拟像素点的亮度将由这四点的亮度经加权插值确定，而与其它像素点无关。用这四个加权系数的集合对原始图像作重采样（四次乘法、四次加法），就可以得到零畸变的输出图。对彩色相机的RGB三通道分别处理，但选用一个公共的虚拟传感器，则合成的彩色图像将是零畸变、零色差的。每个像素点（物理视点和虚拟点）的位置误差都是零均值，均方差都可小于1/1,000像素点距。

## 坐标系
### 平面旋转
![](img/%E5%B9%B3%E9%9D%A2%E6%97%8B%E8%BD%AC.png)
![](img/%E5%B9%B3%E9%9D%A2%E6%97%8B%E8%BD%AC2.png)

### 三维坐标旋转
![](img/%E4%B8%89%E7%BB%B4%E6%97%8B%E8%BD%AC1.png)
![](img/%E4%B8%89%E7%BB%B4%E6%97%8B%E8%BD%AC2.png)
![](img/%E4%B8%89%E7%BB%B4%E6%97%8B%E8%BD%AC3.png)

### 坐标变换
![](img/%E6%97%8B%E8%BD%AC%E5%92%8C%E5%B9%B3%E7%A7%BB.png)
旋转矩阵左乘得到


### 四个坐标系
世界坐标系：Xw、Yw、Zw。

相机坐标系： Xc、Yc、Zc。

图像坐标系：x、y。

像素坐标系：u、v。
#### **世界坐标系（参考坐标系）**
用户定义的三维世界的坐标系，为了描述目标物在真实世界里的位置以及相机所在的位置而被引入。    
![](img/%E4%B8%96%E7%95%8C%E5%9D%90%E6%A0%87%E7%B3%BB%E5%88%B0%E7%9B%B8%E6%9C%BA%E5%9D%90%E6%A0%87%E7%B3%BB.png)

#### **相机坐标系**
在相机上建立的坐标系，为了从相机的角度描述物体位置而定义，作为沟通世界坐标系和图像/像素坐标系的中间一环。   
![](img/%E7%9B%B8%E6%9C%BA%E5%9D%90%E6%A0%87%E7%B3%BB%E5%88%B0%E5%9B%BE%E5%83%8F%E5%9D%90%E6%A0%87%E7%B3%BB.png)
认为相机到图像的距离为f（OO‘），物体到相机的距离为z，实际上缩放因子就是z

一个有趣的现象是，一个两倍的物体放在两倍远的地方和原物体在相机中成像一样

#### **图像坐标系**
为了描述成像过程中物体从相机坐标系到图像坐标系的投影透射关系而引入，方便进一步得到像素坐标系下的坐标。
![](img/%E5%9B%BE%E5%83%8F%E5%9D%90%E6%A0%87%E7%B3%BB%E8%BD%AC%E5%83%8F%E7%B4%A0%E5%9D%90%E6%A0%87%E7%B3%BB.png)


#### **像素坐标系**
为了描述物体成像后的像点在数字图像上（相片）的坐标而引入，是我们真正从相机内读取到的信息所在的坐标系，单位为个（像素数目）。

![](img/%E5%9D%90%E6%A0%87%E5%8F%98%E6%8D%A2.png)
## 畸变
~~畸变偶不变符号看象限~~    

畸变是指光学系统对物体所成的像相对于物体本身而言的失真程度，是光学透镜的固有特性，其直接原因是因为透镜的边缘部分和中心部分的放大倍率不一样。

透镜的畸变是不可消除的，但在实际的应用中可以通过一些软件来进行畸变的补偿，如OpenCV、MATLAB等。

### 畸变的分类
- 径向畸变：主要由于透镜不同部位放大倍率不同造成的，又分枕型畸变，桶形畸变两种
![](img/%E5%BE%84%E5%90%91%E7%95%B8%E5%8F%98.png)
- 切向畸变：主要由于透镜安装与成像平面不垂直造成的，类似透视原理（近大远小，圆变椭圆等等）
![](img/%E5%88%87%E5%90%91%E7%95%B8%E5%8F%98.jpeg)
- 薄棱镜畸变：由于透镜设计缺陷和加工安装误差造成，又称为线性畸变。影响较小，一般忽略不计

通常情况下径向畸变的影响要远远大于其他畸变

### 畸变模型
![](img/%E5%A4%B1%E7%9C%9F.png)
![](img/%E6%A8%A1%E5%9E%8B.png)
理解径向畸变：指的是按照径向距离进行畸变（也就是和x/y成比例关系，但不是线性关系）。

由泰勒展开得到。

### 像方畸变和物方畸变
像方畸变模型：即将畸变模型作为附属参数添加至图像平面。通俗的来讲就是认为，图像透过透镜之前是正常的(理想的)，透过透镜后，在图像平面成像时产生了畸变。

物方畸变模型：即将畸变模型作为附属参数添加至相机坐标系。通俗的讲就是认为，图像从进入相机开始就已经产生了畸变，之后这种畸变一直保持存在。

像方畸变模型和物方畸变模型都是对图像的校正模型，只是采取的参考系不同而已。

Inpho等传统摄影测量软件通常情况下都是采用像方畸变模型

OpenCV、Matlab等计算机视觉软件通常采用物方畸变模型

## 张正友标定法
张正友标定法标定相机的内外参数的思路如下：
1. 求解内参矩阵与外参矩阵的积（H）
H被（U，V）和（u，v）约束着，前者是现实世界的人为定义好的，后者用图像识别算法找到对应像素的，从而求出有8个自由度的H

2. 求解内参矩阵；
H=A(R1 R2 t)    
$B=A^{-T}A^{-1}$，是个对称阵
通过多张图片最小二乘可以求解b，然后得到内参矩阵
![](img/%E5%BC%A0%E6%AD%A3%E5%8F%8B%E6%A0%87%E5%AE%9A.png)

3. 求解外参矩阵。
用H和A求解外参

内容太多了就不copy了：      
[张正友标定法](https://zhuanlan.zhihu.com/p/94244568?ivk_sa=1024320u)   

[最小二乘法的矩阵形式](https://zhuanlan.zhihu.com/p/87582571)

![](img/%E5%BC%A0%E6%AD%A3%E5%8F%8B%E6%A0%87%E5%AE%9A2.png)

## 代码实现
### cv2.findChessboardCorners

``` C++
bool cv::findChessboardCorners	(InputArray 	image,Size patternSize,OutputArray 	corners,int 	flags =CALIB_CB_ADAPTIVE_THRESH+CALIB_CB_NORMALIZE_IMAGE 
)		
```
```python
cv.findChessboardCorners(	image, patternSize[, corners[, flags]]	) ->	retval, corners
```


image: 棋盘视图。它必须是8位灰度或彩色图像。

patternSize:每个棋盘行和列的内角数（ patternSize = cv::Size(points_per_row,points_per_colum) = cv::Size(columns,rows) ）。

corners: 检测到的角的输出数组。

flags: 可以为零或以下值组合的各种操作标志：

CALIB_CB_ADAPTIVE_THRESH使用自适应阈值将图像转换为黑白，而不是固定阈值级别（根据平均图像亮度计算）。

CALIB_CB_NORMALIZE_IMAGE在应用固定或自适应阈值之前，使用 equalizeHist 标准化图像伽玛。

CALIB_CB_FILTER_QUADS使用附加标准（如轮廓面积、周长、类似正方形的形状）过滤掉在轮廓检索阶段提取的错误四边形。

CALIB_CB_FAST_CHECK对图像进行快速检查以查找棋盘角，如果没有找到则快捷调用。当没有观察到棋盘时，这可以大大加快退化条件下的调用。

检测到的坐标是近似的，为了更准确地确定它们的位置，该函数调用cornerSubPix。如果返回的坐标不够准确，您也可以使用带有不同参数的函数cornerSubPix。

### cv2.drawChessboardCorners
``` C++
void cv::drawChessboardCorners	(	InputOutputArray 	image,
Size 	patternSize,
InputArray 	corners,
bool 	patternWasFound 
)		
```
``` python
cv.drawChessboardCorners(image, patternSize,corners,patternWasFound	) ->image
```

### cv2.calibrateCamera
``` C++
double cv::calibrateCamera	(	InputArrayOfArrays 	objectPoints,
InputArrayOfArrays 	imagePoints,
Size 	imageSize,
InputOutputArray 	cameraMatrix,
InputOutputArray 	distCoeffs,
OutputArrayOfArrays 	rvecs,
OutputArrayOfArrays 	tvecs,
OutputArray 	stdDeviationsIntrinsics,
OutputArray 	stdDeviationsExtrinsics,
OutputArray 	perViewErrors,
int 	flags = 0,
TermCriteria 	criteria = TermCriteria(TermCriteria::COUNT+TermCriteria::EPS, 30, DBL_EPSILON) 
)		
```
``` Python
cv.calibrateCamera(	objectPoints, imagePoints, imageSize, cameraMatrix,distCoeffs[, rvecs[, tvecs[, flags[,criteria]]]]
```
