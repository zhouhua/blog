---
title: 深入了解 javascript 的 sort 方法
tags:
  - Javascript
  - quicksort
  - sort
  - 内省排序
  - 分治
  - 快速排序
  - 快速排序算法
  - 数组
  - 算法
  - 选择排序
category: 技术
hero: ./quicksort.jpg
type: post
featured: true
date: 2015-06-18 12:08:03
---

在 javascript 中，数组对象有一个有趣的方法 `sort`，它接收一个类型为函数的参数作为排序的依据。这意味着开发者只需要关注如何比较两个值的大小，而不用管“排序”这件事内部是如何实现的。不过了解一下 `sort` 的内部实现也不是一件坏事，何不深入了解一下呢？

算法课上，我们会接触很多种排序算法，什么冒泡排序、选择排序、快速排序、堆排序等等。那么 javascript 的 `sort` 方法采用哪种排序算法呢？要搞清楚这个问题，呃，直接看 [v8 源代码](https://github.com/v8/v8/blob/master/src/js/array.js) 好了。v8 中对 `Array.sort` 的实现是采用 javascript 完成的，粗看下来，使用了快速排序算法，但明显比我们熟悉的快速排序要复杂。那么到底复杂在什么地方？为什么要搞这么复杂？这是我们今天要探讨的问题。

## 快速排序算法

快速排序算法之所以被称为快速排序算法，是因为它能达到最佳和平均时间复杂度均为 $O(n\log{n})$，是一种应用非常广泛的排序算法。它的原理并不复杂，先找出一个基准元素（pivot，任意元素均可），然后让所有元素跟基准元素比较，比基准元素小的，放到一个集合中，其他的放到另一个集合中；再对这两个集合执行快速排序，最终得到完全排序好的序列。

所以快速排序的核心是不断把原数组做切割，切割成小数组后再对小数组进行相同的处理，这是一种典型的分治的算法设计思路。实现一个简单的快速排序算法并不困难。我们不妨试一下：

```javascript
function QuickSort(arr, func) {
  if (!arr || !arr.length)
    return [];
  if (arr.length === 1)
    return arr;
  const pivot = arr[0];
  const smallSet = [];
  const bigSet = [];
  for (let i = 1; i < arr.length; i++) {
    if (func(arr[i], pivot) < 0) {
      smallSet.push(arr[i]);
    }
    else {
      bigSet.push(arr[i]);
    }
  }
  return basicSort(smallSet, func).concat([pivot]).concat(basicSort(bigSet, func));
}
```

这是一个非常基础的实现，选取数组的第一项作为基准元素。

## 原地（in-place）排序

我们可以注意到，上面的算法中，我们其实是创建了一个新的数组作为计算结果，从空间使用的角度看是不经济的。javascript 的快速排序算法中并没有像上面的代码那样创建一个新的数组，而是在原数组的基础上，通过交换元素位置实现排序。所以，类似于 `push`、`pop`、`splice`这几个方法，`sort` 方法也是会修改原数组对象的！

我们前面说过，快速排序的核心在于切割数组。那么如果只是在原数组上交换元素，怎么做到切割数组呢？很简单，我们并不需要真的把数组切割出来，只需要记住每个部分起止的索引号。举个例子，假设有一个数组 [12, 4, 9, 2, 18, 25]，选取第一项 12 为基准元素，那么按照原始的快速排序算法，会把这个数组切割成两个小数组：[4, 9, 2], 12, [18, 25]。但是我们同样可以不切割，先通过比较、交换元素，将原数组修改成 [4, 9, 2, 12, 18, 25]，再根据基准元素 12 的位置，认为 0~2 号元素是一组，4~5 号元素是一组，为了表述方便，我这里将比基准元素小的元素组成的分区叫小数分区，另一个分区叫大数分区。这很像电脑硬盘的分区，并不是真的把硬盘分成了 C 盘、D 盘，而是记录下一些起止位置，在逻辑上分成了若干个分区。类似的，在快速排序算法中，我们也把这个过程叫做分区（partition）。所以相应的，我也要修改一下之前的说法了，快速排序算法的核心是分区。

说了这么多，还是实现一个带分区的快速排序吧：

```javascript
function swap(arr, from, to) {
  if (from == to)
    return;
  const temp = arr[from];
  arr[from] = arr[to];
  arr[to] = temp;
}

function QuickSortWithPartition(arr, func, from, to) {
  if (!arr || !arr.length)
    return [];
  if (arr.length === 1)
    return arr;
  from = from === void 0 ? 0 : from;
  to = to === void 0 ? arr.length - 1 : to;
  const pivot = arr[from];
  let smallIndex = from;
  let bigIndex = from + 1;
  for (; bigIndex <= to; bigIndex++) {
    if (func(arr[bigIndex], pivot) < 0) {
      smallIndex++;
      swap(arr, smallIndex, bigIndex);
    }
  }
  swap(arr, smallIndex, from);
  QuickSortWithPartition(arr, func, from, smallIndex - 1);
  QuickSortWithPartition(arr, func, smallIndex + 1, to);
  return arr;
}
```

看起来代码长了很多，不过并不算复杂。首先由于涉及到数组元素交换，所以先实现一个 swap 方法来处理元素交换。快速排序算法中，增加了两个参数，`from` 和 `to`，分别表示当前要处理这个数组的哪个部分，`from` 是起始索引，`to` 是终止索引；如果这两个参数缺失，则表示处理整个数组。

同样的，我用最简单的方式选取基准元素，即所要处理分区的第一个元素。然后我定义了 `smallIndex` 和 `bigIndex` 两个变量，分别表示的是左侧小数分区的终止索引和右侧大数分区的终止索引。什么意思？就是说从第一个元素（基准元素）到第 `smallIndex` 个元素间的所有元素都比基准元素小，从第 `smallIndex + 1` 到第 `bigIndex` 个元素都比基准元素大。一开始没有比较时，很显然这两部分分区都是空的，而比较的过程很简单，直接是 `bigIndex` 向右移，一直移到分区尾部。每当 `bigIndex` 增加 1，我们会进行一次判断，看看这个位置上的元素是不是比基准元素大，如果大的话，不用做处理，它已经处于大数分区了；但如果比基准元素小，就需要进行一次交换。怎么交换呢？首先将 `smallIndex` 增加 1，意味着小数分区增加了一个元素，但此时 `smallIndex` 位置的元素很明显是一个大数（这个说法其实不对，如果之前大数分区里面没有元素，此时 `smallIndex` 和 `bigIndex` 相等，但对交换没有影响），而在 `bigIndex` 位置的元素是一个小数，所以只要把这两个位置的元素交换一下就好了。

最后可别忘了一开始的起始元素，它的位置并不正确，不过只要将它和 `smallIndex` 位置的元素交换位置就可以了。同时我们得到了对应的小数分区 [from...smallIndex - 1] 和大数分区 [smallIndex + 1...to]。再对这两个分区递归排序即可。

## 分区过程的优化

上面的分区过程（仅仅）还是有一定的优化空间的，因为上面的分区过程中，大数分区和小数分区都是从左向右增长，其实我们可以考虑从两侧向中间遍历，这样能有效地减少交换元素的次数。举个例子，例如我们有一个数组 [2, 1, 3, 1, 3, 1, 3]，采用上面的分区算法，一共碰到三次比基准元素小的情况，所以会发生三次交换；而如果我们换个思路，把从右往左找到小于基准和元素，和从左往右找到大于基准的元素交换，这个数组只需要交换一次就可以了，即把第一个 3 和最后一个 1 交换。

我们也来尝试写一下实现：

```javascript
function QuickSortWithPartitionOp(arr, func, from, to) {
  if (!arr || !arr.length)
    return [];
  from = from === void 0 ? 0 : from;
  to = to === void 0 ? arr.length - 1 : to;
  if (from >= to - 1)
    return arr;
  const pivot = arr[from];
  let smallEnd = from + 1;
  let bigBegin = to;
  while (smallEnd < bigBegin) {
    while (func(arr[bigBegin], pivot) > 0 && smallEnd < bigBegin) {
      bigBegin--;
    }
    while (func(arr[smallEnd], pivot) < 0 && smallEnd < bigBegin) {
      smallEnd++;
    }
    if (smallEnd < bigBegin) {
      swap(arr, smallEnd, bigBegin);
    }
  }
  swap(arr, smallEnd, from);
  QuickSortWithPartitionOp(arr, func, from, smallEnd - 1);
  QuickSortWithPartitionOp(arr, func, smallEnd + 1, to);
  return arr;
}
```

## 分区与性能

前面我们说过，快速排序算法平均时间复杂度是 $O(n\log{n})$，但它的最差情况下时间复杂度会衰弱到 $O(n^2)$。而性能好坏的关键就在于分区是否合理。如果每次都能平均分成相等的两个分区，那么只需要 $\log{n}$ 层迭代；而如果每次分区都不合理，总有一个分区是空的，那么需要 $n$ 层迭代，这是性能最差的场景。

那么性能最差的场景会出现吗？对于一个内容随机的数组而言，不太可能出现最差情况。但我们平时在编程时，处理的数组往往并不是内容随机的，而是很可能预先有一定顺序。设想一下，如果一个数组已经排好序了，由于之前的算法中，我们都是采用第一个元素作为基准元素，那么必然会出现每次分区都会有一个分区为空。这种情况当然需要避免。

一种很容易的解决方法是不要选取固定位置的元素作为基准元素，而是随机从数组里挑出一个元素作为基准元素。这个方法很有效，极大概率地避免了最差情况。这种处理思想很简单，我就不另外写代码了。

然而极大概率地避免最差情况并不等于避免最差情况，特别是对于数组很大的时候，更要求我们在选取基准元素的时候要更谨慎些。

## 三数取中（median-of-three）

基准元素应当精心挑选，而挑选基准元素的一种方法为三数取中，即挑选基准元素时，先把第一个元素、最后一个元素和中间一个元素挑出来，这三个元素中大小在中间的那个元素就被认为是基准元素。

简单实现一下获取基准元素的方法：

```javascript
function getPivot(arr, func, from, to) {
  const middle = (from + to) >> 1;
  let i0 = arr[from];
  let i1 = arr[to];
  const i2 = arr[middle];
  let temp;
  if (func(i0, i1) > 0) {
    temp = i0;
    i0 = i1;
    i1 = temp;
  }
  if (func(i0, i2) > 0) {
    arr[middle] = i0;
    arr[from] = i2;
    arr[to] = i1;
    return i0;
  }
  else {
    arr[from] = i0;
    if (func(i1, i2) > 0) {
      arr[middle] = i1;
      arr[to] = i2;
      return i1;
    }
    else {
      arr[middle] = i2;
      arr[to] = i1;
      return i2;
    }
  }
}
```

这个例子里我完全没管基准元素的位置，一是降低复杂度，另一个原因是下面讨论重复元素处理时，基准元素的位置没什么意义。不过我把最小的值赋给了第一个元素，最大的值赋给了第二个元素，后面处理重复元素时会有帮助。

当然，仅仅是三数取中获得的基准元素，也不见得是可靠的。于是有一些其他的取中值的方法出现。有几种比较典型的手段，一种是平均间隔取一个元素，多个元素取中位数（即多取几个，增加可靠性）；一种是对三数取中进行递归运算，先把大数组平均分成三块，对每一块进行三数取中，会得到三个中值，再对这三个中值取中位数。

不过查阅 v8 的源代码，发现 v8 的基准元素选取更为复杂。如果数组长度不超过 1000，则进行基本的三数取中；如果数组长度超过 1000，那么 v8 的处理是除去首尾的元素，对剩下的元素每隔 200 左右（200~215，并不固定）挑出一个元素。对这些元素排序，找出中间的那个，并用这个元素跟原数组首尾两个元素一起进行三数取中。这段代码我就不写了。

## 针对重复元素的处理

到目前为止，我们在处理元素比较的时候比较随意，并没有太多地考虑元素相等的问题。但实际上我们做了这么多性能优化，对于重复元素引起的性能问题并没有涉及到。重复元素会带来什么问题呢？设想一下，一个数组里如果所有元素都相等，基准元素不管怎么选都是一样的。那么在分区的时候，必然出现除基准元素外的其他元素都被分到一起去了，进入最差性能的 case。

那么对于重复元素应该怎么处理呢？从性能的角度，如果发现一个元素与基准元素相同，那么它应该被记录下来，避免后续再进行不必要的比较。所以还是得改分区的代码。

```javascript
function QuickSortWithPartitionDump(arr, func, from, to) {
  if (!arr || !arr.length)
    return [];
  from = from === void 0 ? 0 : from;
  to = to === void 0 ? arr.length - 1 : to;
  if (from >= to - 1)
    return arr;
  const pivot = getPivot(arr, func, from, to);
  let smallEnd = from;
  let bigBegin = to;
  for (let i = smallEnd + 1; i < bigBegin; i++) {
    let order = func(arr[i], pivot);
    if (order < 0) {
      smallEnd++;
      swap(arr, i, smallEnd);
    }
    else if (order > 0) {
      while (bigBegin > i && order > 0) {
        bigBegin--;
        order = func(arr[bigBegin], pivot);
      }
      if (bigBegin == i)
        break;
      swap(arr, i, bigBegin);
      if (order < 0) {
        swap(arr, i, smallEnd);
        smallEnd++;
      }
    }
  }
  QuickSortWithPartitionDump(arr, func, from, smallEnd);
  QuickSortWithPartitionDump(arr, func, bigBegin, to);
  return arr;
}
```

简单解释一下这段代码，上文已经说过，在 `getPivot` 方法中，我将比基准小的元素放到第一位，把比基准大的元素放到最后一位。定义三个变量 `smallEnd`、`bigBegin`、`i`，从 `from` 到 `smallEnd` 之间的元素都比基准元素小，从 `smallEnd` 到 `i` 之间的元素都和基准元素一样大，从 `i` 到 `bigBegin` 之间的元素都是还没有比较的，从 `bigBegin` 到 `to` 之间的元素都比基准元素大。了解这个关系就好理解这段代码了。遍历从 `smallEnd + 1` 到 `bigBegin` 之间的元素：

- 如果这个元素小于基准，那么 `smallEnd` 增加 1，这时 `smallEnd` 位置的元素是等于基准元素的（或者此时 `smallEnd` 与 `i` 相等），交换 `smallEnd` 与 `i` 处的元素就可以了。
- 如果这个元素大于基准，相对比较复杂一点。此时让 `bigBegin` 减小 1，检查大数分区前面一个元素是不是大于基准，如果大于基准，重复此步骤，不断让 `bigBegin` 减小 1，直到找到不比基准大的元素（如果这个过程中，发现 `bigBegin` 与 `i` 相等，则中止遍历，说明分区结束）。找到这个不比基准大小元素时需要区分是不是比基准小。如果比基准小，需要做两步交换，先将 `i` 位置的大数和 `bigBegin` 位置的小数交换，这时跟第一种 `case` 同时， `smallEnd` 增加 1，并且将 `i` 位置的小数和 `smallEnd` 位置的元素交换。如果和基准相等，则只需要将 `i` 位置的大数和 `bigBegin` 位置的小数交换。
- 如果这个元素与基准相等，什么也不用做。

## 小数组优化

对于小数组（小于 16 项或 10 项。v8 认为 10 项以下的是小数组。），可能使用快速排序的速度还不如平均复杂度更高的选择排序。所以对于小数组，可以使用选择排序法要提高性能，减少递归深度。

```javascript
function insertionSort(a, func, from, to) {
  for (let i = from + 1; i < to; i++) {
    const element = a[i];
    for (var j = i - 1; j >= from; j--) {
      const tmp = a[j];
      if (func(tmp, element) > 0) {
        a[j + 1] = tmp;
      }
      else {
        break;
      }
    }
    a[j + 1] = element;
  }
}
```

## v8 引擎没有做的优化

由于快速排序的不稳定性（少数情况下性能差，前文已经详细描述过），David Musser 于 1997 设计了内省排序法（Introsort）。这个算法在快速排序的基础上，监控递归的深度。一旦长度为 $n$ 的数组经过了 $\log{n}$ 层递归（快速排序算法最佳情况下的递归层数）还没有结束的话，就认为这次快速排序的效率可能不理想，转而将剩余部分换用其他排序算法，通常使用堆排序算法（Heapsort，最差时间复杂度和最优时间复杂度均为 $O(n\log{n})$）。

## v8 引擎额外做的优化

快速排序递归很深，如果递归太深的话，很可以出现“爆栈”，我们应该尽可能避免这种情况。上面提到的对小数组采用选择排序算法，以及采用内省排序算法都可以减少递归深度。不过 v8 引擎中，做了一些不太常见的优化，每次我们分区后，v8 引擎会选择元素少的分区进行递归，而将元素多的分区直接通过循环处理，无疑这样的处理大大减小了递归深度。我大致把 v8 这种处理的过程写一下：

```javascript
function quickSort(arr, from, to) {
  while (true) {
    // 排序分区过程省略
    // ...

    if (to - bigBegin < smallEnd - from) {
      quickSort(a, bigBegin, to);
      to = smallEnd;
    }
    else {
      quickSort(a, from, smallEnd);
      from = bigBegin;
    }
  }
}
```

不得不说是一个很巧妙的实现。

## 总结

不知不觉这篇文章写了这么长。本来想对比各种优化之间的性能差异，现在看来也没有什么必要。虽然快速排序算法是一个很容易很基础的算法，但我相信很多人并没有能够这么深入地去了解、去优化一个算法。而读过了 v8 引擎对于这么一个简单算法的实现后，我发现它并没有简单地为了实现一个算法而去实现，而是确确实实地尽一切可能去提高算法效率，去消除可能引起性能问题的因素。结论是你真的可以放心地使用 `Array.sort` 方法，它的性能令人放心。那么剩下问题的就是：作为开发者，我们应该如何编写高质量高性能的代码？是不是应该更精益求精一点，让我们代码更经得起推敲，更值得信任？
