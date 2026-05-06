---
title: SQL查询&刷题
icon: pen-to-square
date: 2025-1-2
category:
  - Java
tag:
  - docker
  - Redis
---



## SQL查询解析

### select语法

```sql
-- 基础查询（必选部分）
SELECT [列名/表达式/通配符]
FROM [表名];

-- 完整语法（含常用可选子句，按执行顺序排列）
SELECT [DISTINCT] 列1 [AS 别名1], 列2 [AS 别名2], ...
FROM 表名
[JOIN 关联表名 ON 关联条件]  -- 多表联查
[WHERE 行过滤条件]  -- 过滤单个行数据
[GROUP BY 分组列1, 分组列2, ...]  -- 按列分组聚合
[HAVING 分组过滤条件]  -- 过滤分组后的结果
[ORDER BY 排序列1 [ASC/DESC], 排序列2 [ASC/DESC], ...]  -- 结果排序
[LIMIT 偏移量, 返回行数];  -- 限制返回结果数量
```



#### limit

- `LIMIT n`：返回前 `n` 行数据
- `LIMIT offset, n`：从第 `offset+1` 行开始（offset 从 0 开始），返回 `n` 行数据 ; 跳过前 offset 条，返回后续n条

### select执行顺序

```
1. FROM / JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT → 6. ORDER BY → 7. LIMIT
```



### 常用函数

> 这是我刷牛客上的《SQL必知必会》和《SQL大厂笔试真题》用到的

#### 条件函数（※）

##### IF() 函数

```sql
IF(expr, true_result, false_result)
```

- 参数说明
  - `expr`：需要判断的布尔表达式（返回 `TRUE`/`FALSE`，或等价的非 0/0、非 NULL/NULL）；
  - `true_result`：`expr` 为 `TRUE`（非 0、非 NULL）时返回的结果；
  - `false_result`：`expr` 为 `FALSE`（0、NULL）时返回的结果；
- **返回值**：支持任意数据类型（字符串、数字、日期等），`true_result` 和 `false_result` 尽量保持类型一致，避免隐式转换。

##### CASE WHEN 语句（支持多分支 / 复杂条件）

```sql
CASE
  WHEN condition1 THEN result1
  WHEN condition2 THEN result2
  ...
  WHEN conditionN THEN resultN
  ELSE default_result  -- 可选，无匹配条件时返回（默认返回 NULL）
END [AS 别名]
```

- **说明**：依次判断 `condition1`-`conditionN`，满足第一个条件即返回对应 `result`，后续条件不再执行；无匹配条件时，返回 `ELSE` 后的默认值（无 `ELSE` 则返回 `NULL`）。

> 简单式 CASE WHEN（仅匹配单个字段的固定值）

```sql
CASE expr
  WHEN value1 THEN result1
  WHEN value2 THEN result2
  ...
  WHEN valueN THEN resultN
  ELSE default_result  -- 可选
END [AS 别名]
```

- **说明**：将 `expr` 的值依次与 `value1`-`valueN` 做等值匹配，满足第一个匹配即返回对应 `result`，适用于「单个字段的固定值匹配」场景。

#### 窗口函数（※）

| 窗口函数                  | 功能说明                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `ROW_NUMBER()` OVER (...) | 连续排名，即使播放量相同，也会分配不同的名次（1,2,3,4...），无并列 |
| `RANK()` OVER (...)       | 跳跃排名，播放量相同则名次相同，后续名次跳跃（1,2,2,4...）   |
| `DENSE_RANK()` OVER (...) | 连续并列排名，播放量相同则名次相同，后续名次连续（1,2,2,3...） |



```sql
函数名() OVER (
  PARTITION BY 分组字段1, 分组字段2, ...  -- 可选：指定分组/分区维度，即“按什么分组排名”
  ORDER BY 排序字段1 [ASC/DESC], 排序字段2 [ASC/DESC], ...  -- 必选：指定分组内的排序依据，即“按什么值排名”
) AS 排名别名
```

1. `PARTITION BY`：相当于「分组内排名」的 “分组”，将数据按指定字段划分为多个独立分区，窗口函数仅在每个分区内独立计算排名（不合并分区内的行，与`GROUP BY`不同）。
2. `ORDER BY`：指定分区内的排序规则，决定排名的高低顺序（排名靠前的值为排序后的优先值，通常按统计值降序，如播放量`play_pv DESC`）。
3. 窗口函数不会改变原始数据的行数，仅为每一行增加一个排名列，这是与`GROUP BY`聚合查询的核心区别。

#### 日期相关

- year
- month
- day？

- DATE_FORMAT()：日期格式化

- DATEDIFF() ：返回 `日期1 - 日期2` 的差值，单位为「天」。

- TIMESTAMPDIFF（）：MySQL 中计算时间差的首选函数，支持跨天、跨月甚至跨年的时间差计算

##### DATE_FORMAT()

```sql
DATE_FORMAT(日期字段/日期值, 格式化字符串)
```

- 第一个参数：可以是`DATE`、`DATETIME`、`TIMESTAMP`类型的字段或常量（如`NOW()`、`'2022-01-01'`）。
- 第二个参数：格式化字符串，由**格式符**和普通字符（如`-`、`/`、`空格`、`:`）组成，用于定义最终的日期格式。

> 常用格式符

| 格式符 | 含义                           | 示例（对应日期`2022-03-15 16:30:45`） |
| ------ | ------------------------------ | ------------------------------------- |
| `%Y`   | 4 位完整年份                   | 2022                                  |
| `%y`   | 2 位简写年份                   | 22                                    |
| `%m`   | 2 位月份（补 0，01-12）        | 03                                    |
| `%c`   | 1 位月份（不补 0，1-12）       | 3                                     |
| `%d`   | 2 位日期（补 0，01-31）        | 15                                    |
| `%e`   | 1 位日期（不补 0，1-31）       | 15                                    |
| `%H`   | 24 小时制（补 0，00-23）       | 16                                    |
| `%h`   | 12 小时制（补 0，01-12）       | 04                                    |
| `%i`   | 2 位分钟（补 0，00-59）        | 30                                    |
| `%s`   | 2 位秒数（补 0，00-59）        | 45                                    |
| `%W`   | 英文星期全称                   | Tuesday                               |
| `%w`   | 数字星期（0 = 周日，6 = 周六） | 2                                     |
| `%p`   | 上午 / 下午（AM/PM）           | PM                                    |

##### DATEDIFF()

```sql
DATEDIFF(日期1, 日期2)
```

- 功能：返回 `日期1 - 日期2` 的差值，单位为「天」。

- 参数要求：两个参数可以是 `DATE`、`DATETIME`、`TIMESTAMP` 类型，或合法的日期格式字符串（如 `'2022-03-15'`）。

- 关键注意：

  参数顺序影响结果正负：

  - 若 `日期1 > 日期2`，返回正数（如 `DATEDIFF('2022-03-15', '2022-03-10')` 返回 `5`）。
  - 若 `日期1 < 日期2`，返回负数（如 `DATEDIFF('2022-03-10', '2022-03-15')` 返回 `-5`）。
  - 若两个日期相同，返回 `0`。

- 补充：`DATEDIFF()` 会自动忽略时间部分（仅对比年月日），如 `DATEDIFF('2022-03-15 16:30', '2022-03-10 08:00')` 仍返回 `5`。

#### 数学计算

- 四舍五入函数：`ROUND(数值/表达式, 保留小数位数)`

#### 字符串函数

-  字符串拼接函数：CONCAT()

## 题单

### 《SQL必知必会》

### 《SQL大厂笔试真题》

#### **每个月Top3的周杰伦歌曲**

>  [**每个月Top3的周杰伦歌曲**](https://www.nowcoder.com/share/jump/7465761241767358457226)

难点：

- 如何返回每个分组的top3
- 如何生成排序后的序号

> 窗口函数实现

#### **分析客户逾期情况**

> [分析客户逾期情况](https://www.nowcoder.com/practice/22633632da344e2492973ecf555e10c9?tpId=375&tqId=10497698&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 如何百分数形式输出并四舍五入保留 1 位小数

> 四舍五入函数+字符串函数拼接%

#### 获取指定客户每月的消费额

> [获取指定客户每月的消费额](https://www.nowcoder.com/practice/ed04f148b63e469e8f62e051d06a46f5?tpId=375&tqId=10858424&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 日期保留年月，格式化成`2023-09`

> DATE_FORMAT(日期字段/日期值, 格式化字符串)

#### 查询连续入住多晚的客户信息

> [查询连续入住多晚的客户信息](https://www.nowcoder.com/practice/5b4018c47dfd401d87a5afb5ebf35dfd?tpId=375&tqId=10858425&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 计算两个日期差了多少天

[统计所有课程参加培训人次_牛客题霸_牛客网](https://www.nowcoder.com/practice/98aad5807cf34a3b960cc8a70ce03f53?tpId=375&tqId=10858426&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

#### 统计所有课程参加培训人次

> [统计所有课程参加培训人次](https://www.nowcoder.com/practice/98aad5807cf34a3b960cc8a70ce03f53?tpId=375&tqId=10858426&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 条件语句

#### 查询培训指定课程的员工信息

> [查询培训指定课程的员工信息](https://www.nowcoder.com/practice/a0ef4574056e4a219ee7d651ba82efef?tpId=375&tqId=10858427&sourceUrl=%2Fexam%2Foj)

简单题

#### 推荐内容准确的用户平均评分

> [推荐内容准确的用户平均评分](https://www.nowcoder.com/practice/2dcac73b647247f0aef0b261ed76b47e?tpId=375&tqId=10858428&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 结果保留3位小数

#### 每个商品的销售总额

>  [每个商品的销售总额](https://www.nowcoder.com/practice/6d796e885ee44a9cb599f47b16a02ea4?tpId=375&tqId=10824294&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 每个商品在其所属类别内的排名

#### 统计各岗位员工平均工作时长

> [统计各岗位员工平均工作时长](https://www.nowcoder.com/practice/b7220791a95a4cd092801069aefa1cae?tpId=375&tqId=2452517&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D10%26subTabName%3Donline_coding_page)

难点：

- 两个时间戳之间的差值，以小时为单位
- 以小时为单位输出并保留三位小数
