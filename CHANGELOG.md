# 变更历史

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
