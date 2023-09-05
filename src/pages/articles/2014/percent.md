---
title: padding、margin 纵向取值问题
tags:
  - CSS
  - margin
  - padding
id: 217
hero: ./percent.jpg
category: 技术
layout: post
date: 2014-12-23 23:30:53
---

今天要说一个很基础，但被我自己忽略至今的一个简单问题：padding、margin 在纵向取值为百分数时，它们相对的是父元素的高度吗？ 这个问题之所以被忽略，是因为使用场景有限。因为在布局的时候，我们通常只关注宽度，流式布局、响应式布局中，我们常常会给 padding 设置横向的百分比数值。但纵向上，我们通常还是倾向于设置固定值。回到问题本身，我一直以为在横向上参照父元素的宽度，那么在纵向上应该参照父元素的高度。这其实是不对的，都是参照父元素的宽度。验证很容易，我不做示例了，贴上 MDN 的资料：

> ### Values
>
> Specifies one, two, three or four of the following values:
>
> <dl>
> <dt>&lt;length&gt;</dt>
> <dd>Specifies a non-negative fixed width. See <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/length" target="_blank"><strong>&lt;length&gt;</strong></a> for details.</dd>
> <dt>&lt;percentage&gt;</dt>
> <dd>With respect to the <strong>width</strong> of the containing block.</dd>
> </dl>
>
> - **One** single value applies to _all 4 sides_
> - **Two** values apply to **1.** _top and bottom_ and **2.** to the _left and right_ side
> - **Three** values apply to **1.** _top_, **2.** _right and left_ and **3.** to the _bottom_ side
> - **Four** values apply to **1.** _top_, **2.** _right_, **3.** _bottom_ and **4.** to the _left_ side

- [MDN padding](https://developer.mozilla.org/en-US/docs/Web/CSS/padding 'MDN padding')
- [MDN margin](https://developer.mozilla.org/en-US/docs/Web/CSS/margin 'MDN margin')
