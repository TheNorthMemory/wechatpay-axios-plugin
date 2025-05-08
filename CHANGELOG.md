# 变更历史

## v0.9.4 (2025-05-08)

- 优化`文件上传API`功能，支持`Axios`的`Automatic serialization to FormData`用法，伪代码示例如下:
 ```js
 wxpay.v3.merchant.media.upload.post({
  meta: JSON.stringify({ filename, sha256 }),
  file: fs.createReadStream(localfilepath),
}, {
  meta: { filename, sha256 },
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## v0.9.3 (2025-03-30)

- 优化`Rsa.encrypt` 及 `Rsa.decrypt` 第三参数放弃支持 `RSA_PKCS1_PADDING` 填充方案;
- 标记`Rsa.RSA_PKCS1_PADDING`封装常量为废弃，下一主要版本将剔除；

## v0.9.2 (2025-03-22)

- 支持 `Hash.keyObjectFrom` 及 `Hash.md5` 第一个参数是`KeyObject`对象的用法;

## v0.9.1 (2025-03-15)

- 隔离`APIv2`和`APIv3`配置和客户端实例；
- 重构`Transformer.signer`以支持`GET`或`POST`请求自动签名；
- 将初始化声明的`merchant{key，cert}`移动到`transformer.signer`内部，当需要时，通过每个请求声明的`security:true`加载；
- 修复文件流下载的`Transformer.parse(xml)`异常问题；
- 修复`Rsa.fromPkcs1(str，KEY_TYPE_PUBLIC)`加载公钥异常问题；
- 优化文档，`Q/A`简单说明`Rsa.from[Pkcs8|Pkcs1|Spki]`加载公/私钥新机制;

## v0.9.0 (2025-03-09)

- 调整`node`最低版本要求至`12`，不再支持`node10`；
- 调整依赖 `@thenorthmemory/multipart` 及 `fast-xml-parser`；
- 调整依赖 `axios` 版本到 `^1.8.2`；
- 废弃并删除`Aes.encrypt`、`Aes.decrypt`方法；
- 废弃并删除其他标记`@deprecated`的方法及属性；
- 调整`Aes.AesGcm.encrypt`、`Aes.AesGcm.decrypt`参数顺序，遵循`里式代换原则`;
- 调整`APIv2`上已知`请求无nonce_str`及`返回无sign`内置化判断，优化`return_code`及/或`result_code`非`SUCCESS`时无需验签；
- 调整`APIv2`及`APIv3`接口请求返回异常时，`Promise.reject`从`AssertError`改成标准`AxiosError`，便于调试追踪问题；
- 调整`new Wechatpay()`从单例到实例，并显式露出`async [get|post|put|patch|delete]`方法，便于多商户实例应用使用；
- 新增`wxpay.chain()`实例方法，便于源`URI`末尾是`delete`单词的另类链构型；
- 新增`Hash.isKeyObject`、`Hash.keyObjectFrom`、`Rsa.isKeyObject`、`Rsa.from[Pkcs8|Pkcs1|Spki]`静态方法；
- 新增`Rsa.from('file://', 'private'|'public')`方式加载本地RSA公/私文件；
- 优化`AxiosConfig<'secret'|privateKey'|'certs'>`在实例后类型从`BinaryLike`调整成`KeyObject`，增强安全性；

---

**针对APIv2的主要优化内容**

`APIv2`的返回值验签与传输的载荷(`XML`)无关，本次优化:
- 内置了「忽略无签(`sign`)可验」逻辑
- 「加强判断状态码(`return_code`)/业务结果(`result_code`)非`SUCCESS`情形」，当数据校核异常时，载荷数据均以解析后的对象形式抛送`AxiosError`

**针对APIv3的主要优化内容**

`APIv3`的返回值验签与传输的载荷(`JSON`/`binary`)强相关，本次优化：
- 内置「按所请求的`URL`，自动忽略下载行为(`binary`)的验签」逻辑，交由应用端自行验签，微信支付官方强烈建议商户对下载的数据进行验签
- 对于 `HTTP状态码 20X` 区间时的客户端异常`AxiosError.response.data`标注为原始传输的载荷，有可能是`JSON`字符串，也可能是`空`字符串
- 对于 `HTTP状态码 4XX/5XX`时的异常`AxiosError.response.data`类型，其有可能是`JSON`解析后的对象，也可能是`html`字符串

**注意：破坏性更新**

从`0.8`几乎无需过多调整代码即可升级到`0.9`，仅在以下几个点上不兼容：

- OpenAPI`chainable`链末尾的大写`GET`/`POST`/`PUT`/`PATCH`/`DELETE`方法均已删除，请使用小写;

- 标记为`@deprecated`的方法及属性均已删除，请参照之前的废弃提示用同等`原值`代替；

- `AesGcm`加解密，参数顺序进行了调整，微信支付官方的`webhook`通知解密时需要格外注意，例如：
 ```diff
 - AesGcm.decrypt(nonce, secret, ciphertext, aad);
 + AesGcm.decrypt(ciphertext, secret, nonce, aad);
 ```

- 单例模式注册转换器打印日志方式，调整为实例方式，并且`.client` Getter仅在根级实例有效，例如：
 ```diff
 - Wechatpay.client.v2.defaults.transformRequest.push(data => (console.log(data), data))
 + wxpay.client.v2.defaults.transformRequest.push(data => (console.log(data), data))
 ```

## v0.8.14 (2025-01-01)
- 优化README增加`微信支付公钥`相关说明，备注`pfx`格式的商户API密钥在高版本`nodejs`上的额外转换说明;

## v0.8.13 (2024-03-27)
- 针对`APIv3`返回的HTTP status code非20x场景，不再尝试去验签，异常类型从`AssertionError`回退为`AxiosError`;

## v0.8.12 (2024-03-09)
- 修正 `Transformer.toObject` 类型标注错误;
- [动态`uri_template`参数](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/57)类型标注，感谢 @taoliujun 报告此问题；

## v0.8.11 (2024-03-01)

- 最后一版支持**node10**环境;
- 修正部分 `dts` 类型标注;
- homepage 调整到 https://wechatpay.js.org

## v0.8.10 (2024-02-14)

- 升级依赖 `axios@^0.28.0` for the CVE-2023-45857;

## v0.8.9 (2024-02-12)

- 取消对`axios/lib/utils`的依赖。

## v0.8.8 (2024-01-28)

- 升级依赖 `axios@0.21.2-0.27`, `xml2js@0.5-0.6`;

## v0.8.7 (2023-04-12)
- 升级依赖 `xml2js@^0.5.0` for CVE-2023-0842;

## v0.8.6 (2022-08-25)
- 修复多个 `uri_template` 占位符变量，无法正确替换问题；

## v0.8.5 (2022-03-09)
- 优化`README`，增加v2版付款到零钱示例不验签使用方法；
- 解决`CLI`下初始化参数`mchid`必须是字符串类型的遗留问题；

## v0.8.4 (2022-01-27)
- 修正`Hash.md5`当给正确的`key`时，返回错误的签名值问题；

## v0.8.3 (2022-01-19)
- 优化了一点点`类型声明`;
- 修正测试用例覆盖`axios@0.25.0`的`url`非空字符串限定场景；

## v0.8.2 (2022-01-16)
- 优化`Rsa.encrypt`及`Rsa.decrypt`以支持`Java`的`RSA/ECB/PKCS1Padding`填充方案;

## v0.8.1 (2022-01-09)
- 补充`Formatter`遗漏的导出函数，感谢 @Nxys PR;

## v0.8.0 (2022-01-02)
- 优化，严格限定初始化参数`mchid`为字符串，避免带参请求远端接口时，被校验不通过情况；
- 优化，`Aes`, `Rsa`, `Hash` 等类实现，支持通过`解构`语法仅获取封装的静态方法，例如 `{ sign } = require('./lib/rsa')`；

## v0.7.13 (2021-09-20)
  - 增加V2版合单支付中的`combine_mch_id`校验能力支持;

## v0.7.12 (2021-09-06)
  - 安全更新，升级下游依赖包Axios>=0.21.2，相关见[这里](https://github.com/axios/axios/issues/3979);
  - 仿照[这里](https://github.com/axios/axios/pull/3981)，增加 `SECURITY.md` 文件;

## v0.7.11 (2021-08-24)
  - 当平台证书下载工具工作`异常`时，捕获并打印出异常提示信息；
    - 当`商户证书序列号`错误时，打印出`商户证书序列号有误`服务端返回信息;
    - 当`商户RSA私钥`错误时，打印出`错误的签名，验签失败`服务端返回信息；
    - 当`APIv3密钥`错误时，打印出`Error: Invalid key length`错误堆栈；

## v0.7.10 (2021-08-12)
  - 修正 [#35 v2付款接口无法使用的问题](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/35) ，感谢 @Starrah 报告及PR修正；

## v0.7.9 (2021-07-26)
  - 新增 `Hash.equals` 用来判断签名值是否相等；

## v0.7.8 (2021-07-11)
  - 改进 `Formatter.nonce` 发生器算法；
  - 调整 `Formatter.authorization` 字典排序，关键信息优先展示；
  - 修正 内置常量拼写错误，优化文档；

## v0.7.7 (2021-06-28)
  - 优化 APIv3 `Decorator.jsonBased` 逻辑，平台证书`certs`配置项，排除掉配置项的商户`serial`序列号；

## v0.7.6 (2021-06-26)
  - 优化 APIv3 `Decorator.responseVerifier`，对于验签逻辑异常原样返回 `response{data,headers}` 结构，方便排查问题，相关 [#28](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/28), [#30](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/30)；
  - 新增 `OpenAPI` mock测试，使用 `nock` 驱动，覆盖 [#28](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/28), [#30](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/30) 问题；

## v0.7.5 (2021-06-12)
  - 解决`index.d.ts`上的`AesEcb`类型签名遗漏，感谢 @zhoulingfengofcd
  - 新增 `aes-128-cbc/pkcs7padding` 加解密功能, `AesCbc::encrypt` 与其他语言兼容，详情见 [PR #29](https://github.com/TheNorthMemory/wechatpay-axios-plugin/pull/29) 感谢 @zhoulingfengofcd
  - 新增 `AesCbc` 单元测试用例覆盖， 感谢 @zhoulingfengofcd
  - 调整文档，使用内置 `Multipart` 类上传图片，使用 `form-data` 包的同学需要看下 [PR #26](https://github.com/TheNorthMemory/wechatpay-axios-plugin/pull/26) 内置包与下游包功能实现上的异同，感谢 @wptad

## v0.7.4 (2021-06-08)
  - 解决`index.d.ts`上的`Iterator<Tuple>`异常问题
  - 暂时使用`// @ts-ignore: FIXEME`备注上不准确的`Proxy chain`写法，欢迎熟悉这块的同学贡献解决方案

## v0.7.3 (2021-05-28)
  - 修正`Multipart#delete`方法，其在删除多`name`的值时，存在bug
  - 增加测试用例覆盖`Multipart.delete`

## v0.7.2 (2021-05-22)
  - 调整`Multipart#entries, keys, values`严格遵从`Iterator protocols`，其返回值均为`Array Iterator`
  - 优化`Multipart#get`方法的返回值，当且当无键时返回`undefined`
  - 增加测试用例覆盖`Multipart.FormData`

## v0.7.1 (2021-05-20)
  - 完善`Multipart#set, delete, has, get, getAll, keys, values`等方法

## v0.7.0 (2021-05-15)
  - 新增`Multipart`类，不再`peerDependency`,`form-data`说明及用法见 [#22](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/22)

## v0.6.1 (2021-04-22)
  - 优化CLI，扩展`wxpay <uri>`的`-b`参数为可变布尔量，兼容之前版本用法，以支持 [#21](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/21)

## v0.6.0 (2021-04-20)
  - 代码重构，`APIv2`的返回数据默认强校验，特殊接口需给特殊`transformResponse`，相关见 [#20](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/20)
  - 代码重构，删除了`interceptor.js`包装文件，不再兼容0.1系列，返回数据默认强校验，特殊接口需给特殊`transformResponse`，相关见 [#19](https://github.com/TheNorthMemory/wechatpay-axios-plugin/issues/19)

## v0.5.5 (2021-04-13)
  - 优化文档，`证书`相关名词与官方文档保持一致
  - 优化代码，使用ES6 `Reflect.set`代替`param-reassign`，性能更高
  - 新增函数`Hash.hmac`方法，广度支持`Hash-based Message Authentication Code`
  - 调整函数`Hash.hmacSha256`为不推荐方法，内部改写为固定`Hash.hmac`调用
  - 调整CLI `req <uri>`成功调用仅返回`{config, headers, data}`数据结构

## v0.5.4 (2021-04-08)
  - 优化CLI，`wxpay crt` 下载平台证书仅在成功验签完成后写入文件
  - 优化文档，`AesGcm` 解密示例
  - 优化内部`chain`逻辑，遵循 `RFC3986` 规范，`baseURL`支持带部分路径的海外接入点
  - 优化代码`SonarQube`检测结果`3A+0.5%`

## v0.5.3 (2021-04-02)
  - 优化CLI，`wxpay <uri>` 向前兼容以支持slash(/)结尾的请求，形如 `v3/applyment4sub/applyment/`

## v0.5.2 (2021-04-01)
  - 优化CLI，`wxpay <uri>` 现在支持型如 `v2.pay.micropay`, `v3.pay.transactions.native` 调用
  - 优化`README`文档，适配最新CLI用法；增加APIv3消息通知QA章节；增加技术交流QQ群说明

## v0.5.1 (2021-03-29)
  - 优化CLI，可以直接 `wxpay <uri>` 发起请求
  - 优化`README`文档，适配最新CLI用法

## v0.5.0 (2021-03-27)
  - 新增命令行方式与微信支付接口交互工具
  - 调整可选依赖包为`peerDependencies`，使用完整功能需手动安装 `form-data` 或/及 `yargs`

## v0.4.6 (2021-03-25)
  - 使用最新版`eslint`及`eslint-config-airbnb-base`
  - 增加`utils.merge`依赖函数测试校验

## v0.4.5 (2021-03-16)
  - 支持APIv2版的俩账单下载，调用方法与APIv3类同；
  - 增加测试用例覆盖，初始化参数`secret`(for APIv2)如未设置，`HMAC-SHA256`数据签名时，可能引发 #14

## v0.4.4 (2021-03-07)
  - 优化`Wechatpay`在多次实例化时赋值`Symbol(CLIENT)`异常问题，增加`wechatpay.test.js`测试用例覆盖

## v0.4.3 (2021-03-06)
  - 支持 *企业微信-企业支付* 链式调用，需要额外注入签名规则，见上述文档用法示例

## v0.4.2 (2021-03-03)
  - 文件名大小写问题 #11 感谢 @LiuXiaoZhuang 报告此问题

## v0.4.1 (2021-03-02)
  - 解决了一个`AES-GCM`在`Node10`上的解密兼容性问题，程序在`Node10`上有可能崩溃，建议`Node10`用户升级至此版本

## v0.4.0 (2021-02-28)
  - 重构 `Wechatpay` 类，同时支持 APIv2&v3's 链式调用
  - 改变 `Wechatpay.client` 返回值为`Wechatpay.client.v3`，`Wechatpay.client.v2` 为 `xmlBased` 接口客户端
  - 废弃 `withEntities` 方法，其在链式多次调用时，有可能达不到预期，详情见 #10，感谢 @ali-pay 报告此问题
  - README 文档中文化
  - 完善补缺 `tsd` 声明

## v0.3.4 (2021-01-22)
  - Typed and tips on `Wechatpay` class(#9), thanks @ipoa

## v0.3.3 (2021-01-06)
  - Upgrade Axios for the CVE-2020-28168

## v0.3.2 (2020-09-19)
  - Optim: Let `Aes.pkcs7.padding` strictly following the `rfc2315` spec
  - Optim: Better of the `Hash.md5` and `Hash.hmacSha256`
  - Coding comments and README

## v0.3.1 (2020-09-15)
  - Optim: new param on `xmlBased({mchid})`, while passed in, then `Transformer.signer` doing the `assert` with the post data.
  - Feature: Customize the HTTP `User-Agent`.
  - Refactor: Split `aes.js` as of `Aes`, `AesGcm` and `AesEcb` classes for `aes-256-ecb/pkcs7padding` algo.

## v0.3.0 (2020-09-11)
  - Feature: The XML based API requests.

## v0.2.3 (2020-09-09)
  - Optim: Coding quality.

## v0.2.2 (2020-07-21)
  - Fix: #8 `verfier` on the `204` status case.

## v0.2.1 (2020-07-13)
  - Optim: Back compatible for `12.4.0` < `Node` ≧ `10.15.0`.

## v0.2.0 (2020-07-07)
  - Feature: `OOP` developing style of the wechatpay APIv3.

## v0.1.0 (2020-07-02)
  - Optim: Toggle the `Nodejs` version ≧ `10.15.0`.
  - Optim: Documentation and coding comments.

## v0.0.9 (2020-06-26)
  - Feature: definition of the `Typescript`

## v0.0.8 (2020-06-21)
  - Optim: on `castCsvBill`, drop the `trim` on each rows
  - Optim: on `response` validation, checking ± 5 mins first then to `Rsa.verify`
  - Optim: moved the `commander` optional dependency, because it's only for the `CLI` tool
  - Feature: shipped 99 tests(`npm test`)

## v0.0.7 (2020-06-18)
  - Feature: billdownload and castCsvBill
  - eslint enabled (`npm run lint`)

## v0.0.6 (2020-06-16)
  - Chinese document

## v0.0.5 (2020-06-15)
  - Renew document and codes comments

## v0.0.4 (2020-06-14)
  - Feature: certificate downloader, deps on `commander`

## v0.0.3 (2020-06-14)
  - Feature: media file upload, optional deps on `form-data`

## v0.0.2 (2020-06-13)
  - Feature: Assert the response's timestamp ± 5 mins
  - Refactor as CommonJS style(#6)
  - Limits the communicating parameters(#7)
  - Coding styles(#5)
  - Coding comments and Document(#4, #3, #2, #1)

## v0.0.1 (2020-06-12)
  - Init ES2015+ style
