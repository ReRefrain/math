importScripts("https://unpkg.com/mathjs@14.5.0/lib/browser/math.js")
onmessage = function (e) {
    const {
        im_min, re_min, ci, cr, v, dis, dis0, coeffsw, shadowmax,
        max, rootsw, rootColors, pa, pc, tol, rootTol,
        height, width, istar, iend, w, numWorkers
    } = e.data;
    //复数对象变换
    let img = new ImageData(width, iend - istar);
    let shaderArr = new Float32Array(width * (iend - istar));
    let coeffs = coeffsw.map(s => math.complex(s[0], s[1]));
    let expr = ArrayToExpr(coeffs, tol);
    let f = math.compile(expr);
    let df = math.derivative(expr, 'x').compile();
    a = math.complex(pa);
    c = math.complex(pc);
    //处理a以使a!==1是有效判断,c同理
    if (a.re === 1 && a.im === 0) { a = 1; }
    if (c.re === 0 && c.im === 0) { c = 0; }
    let roots = rootsw.map(s => math.complex(s[0], s[1]));
    let lastPostTime = 0;
    //负责区域涂色
    for (let i = istar; i < iend; i++) {
        let y = im_min + ci + i * v;
        for (let j = 0; j < width; j++) {
            let x = re_min + cr + j * v;
            let z = math.complex(x, y);
            let color = [0, 0, 0];//提前声明与混沌区颜色（黑）
            let N0 = Newton(a, c, f, df, z, dis, max, tol);//收敛根计算
            let shader = 0;
            shaderArr[(i - istar) * width + j] = 1;
            if (N0 !== null) {
                let n0 = N0[0];
                if (N0[1] < shadowmax) {
                    shader = 1 - N0[1] / shadowmax;
                    shaderArr[(i - istar) * width + j] = 1 - shader; 
                }
                let nr = check(dis0, roots, n0, rootTol, tol, a, c);//对应所收敛的根
                if (valid(n0)) {
                    //防止空数组读取！
                    if (nr !== -1) {
                        color = rootColors[nr];
                    }
                }
            }
            //像素点颜色赋予
            let offset = 4 * (j + (i - istar) * width);
            if (w === numWorkers - 1 && Date.now() - lastPostTime > 50) {
                postMessage({ process: offset / img.data.length });
                lastPostTime = Date.now();
            }
            //有自动取整
            img.data[offset] = color[0] * shader * 255;
            img.data[offset + 1] = color[1] * shader * 255;
            img.data[offset + 2] = color[2] * shader * 255;
            img.data[offset + 3] = 255;
        }
    }
    //返回图像数据（buffer返回由AI指导）
    let msg = { imgData: img.data.buffer };
    msg.shaderData = shaderArr.buffer; 
    postMessage(msg, [img.data.buffer, shaderArr.buffer]);
}
//牛顿法（加上收敛判断）
function Newton(b, d, f, df, z, dis, max, tol) {
    let i;
    for (i = 0; i < max; i++) {
        //计算f和f'在z处数值
        let fz = f.evaluate({ x: z });
        let dfz = df.evaluate({ x: z });
        if (!valid(z) || (math.abs(dfz) < tol && math.abs(fz) > tol) || i === max - 1) {
            return null;
        }//防止无穷干扰计算
        let m = math.divide(fz, dfz);
        //收敛判断松紧依赖参数
        if (b !== 1 && valid(m)) {
            m = math.multiply(m, b);
            if (d === 0 && math.abs(m) < dis) { return [z, i]; }
        }//对参数非1进行m的修饰
        if (valid(m)) {
            z = math.subtract(z, m);
            if (d !== 0) {
                z = math.add(z, d);
                if (math.abs(math.subtract(m, d)) < dis) { return [z, i]; }
            }
            else if (math.abs(m) < tol) { return [z, i]; }
        }
    }
}
//系数数组到多项式
function ArrayToExpr(c, tol) {
    let expr = '';//提取声明
    for (let i = 0; i < c.length; i++) {
        if (math.abs(c[i]) < tol) { continue; }//跳过0
        else {
            expr += '+';//各项用+连接
            expr += '(' + c[i] + ')';//将系数括起来防止复数报错
            let e = (c.length - 1 - i) === 0 ? '' : (c.length - 1 - i) === 1 ? '*x' : `*x^${c.length - 1 - i}`;//各情况对x的形式要求
            expr += e;
        }
    }
    expr = expr.slice(1);//去除第一项的+
    return expr;
}
//运算定义良好（math.js可以处理）
function valid(z) {
    //排除无穷和未知
    return z && isFinite(math.re(z)) && isFinite(math.im(z)) && !isNaN(math.re(z)) && !isNaN(math.im(z));
}
//对应极限和已知解
function check(dis0, r, z, rootTol, tol, a, c) {
    if (!valid(z)) { return null; }//返回不空
    let i;
    //判断z、极限收敛到根的对应数组位置
    if (a !== 1 || c !== 0) { i = r.findIndex(root => dist(root, z) < dis0); }//a非1判断更宽
    else { i = r.findIndex(root => dist(root, z) < rootTol); }
    if (i === -1) { i = r.findIndex(root => dist(root, z) < tol * 10); }//对a为1，再次放宽以防误差
    return i;
}
//复数距离
function dist(a, b) {
    if (valid(a) && valid(b)) { return math.abs(math.subtract(a, b)); }//简化函数调用
}
