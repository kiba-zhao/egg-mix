# egg-swagger #
基于[eggjs](https://eggjs.org/zh-cn/index.html)的属性代理工具,可用于适配指定的数据层.(mongose,mysql,http等)

## 安装 ##
```bash
npm install git+ssh://git@github.com:kiba-zhao/egg-mix.git --save
```

## 启用 ##
设置启用plugin: `config/plugin.js`
```javascript
exports.mix = {
  enable:true,
  package:'egg-mix'
};
```

## 配置 ##
配置swagger-ui: `config/config.default.js`
```javascript
exports.mix = {
  dao:{                                         // 代理注入的属性名
      inject: 'context',                        // 属性注入的对象
      default: [ 'app.model', 'httpApi' ],      // 获取属性的默认顺序
      mappings: {},                             // 获取属性的特定顺序
  }
};

```

## 示例 ##
通过数据层,请求数据
```javascript
/**
 * http数据层示例
 */
const { Service: Model } = require('egg');

class DemoModel extends Model {
    async find(condition){
        const { ctx, app, config } = this;
        const res = await app.curl(`${config.test.host}/xxx`,{dataType:'json',ctx}).then(app.httpError.throw);
        if (!res.data) { return null; }
        return res.data;
    }
}

/**
 * 服务层示例
 */
 
const Service = require('egg').Service;
class DemoService extends Service {
    async find(){
        const { ctx } = this;
        const res = await ctx.dao.DemoModel.find();
        return res;
    }
}
```


