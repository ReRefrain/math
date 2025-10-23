# Personal Works<br>计算机科学导论 个人网站 牛顿分形绘制

## About the Repository
本项目基于 MIT 协议开源，详情请查阅 LICENSE 文件。<br>
为方便同学们学习html编写个人作品，参考往届代码程序和功能实现，我整理了本人计科导的代码，以作参考和调试。<br>
若想要进行在线网页尝试，请访问基于github构建的网站<a href="https://rerefrain.github.io/math" style="color: #fff;">Newton Fractal</a>。

## Function of the website
网站实现了牛顿分形的绘制功能，用户可自主输入多项式系数进行可视化，计算由CPU多线程并行完成，自动取计算机支持的最大核数；<br>
可自行更改canva像素数实现高分辨渲染或转webGL实现，性能有限可更改worker数量；<br>
进阶考虑复数域的全纯函数的迭代不动点或周期点导致的分形图案，可对Newton函数部分做相应更改调试；<br>
为实现代码高性能高耦合，部分函数分立性较差，变量命名不完全，阅读不便尽情谅解。

## Study Resources
<a href="https://developer.mozilla.org/zh-CN/" style="color: #fff;">MDN</a>的教程较适合html初学者入门，能够较为基础地把握html、CSS和script编写方法和一些规范，大体掌握网站编写流程。<br>

对短时间内完成个人作品而言，很难有速成的进阶教程可以帮助完成一些高阶的CSS渲染和script代码以实现理想的功能。
因此，我推荐可以善用AI，在理解的基础上实现这部分功能。切忌使用AI完成个人创新部分或除此之外的大部分代码，这样做效果有限。
若使用了AI辅助编程，务必标注使用AI完成的模块，且在致谢中说明。
