# 使用手册

## 通过终端使用
![terminal_usage](screenshots/terminal_usage.png)

为了在使用 Magisk/KernelSU/APatch 时均能访问如图所示的多个选项，您可以
- 通过 Termux (或者其他类似的终端 app)
    ```shell
    > su
    > bindhosts
    ```

- 通过 SDK Platform Tools (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### 例如
```
    bindhosts --action          模拟 bindhosts 的 action 操作应用规则或重置 hosts 文件，这取决于 bindhosts 当前正处于何种运行模式
    bindhosts --tcpdump         通过您当前的网络模式 (WiFi 或数据，确保没有使用像 CloudFlare 之类的 DNS 服务) 嗅探当前活动的IP地址
    bindhosts --query <URL>     从 hosts 文件查询网址
    bindhosts --force-reset     强制重置 bindhosts，这意味着重置 hosts 文件为初始状态
    bindhosts --custom-cron     为 bindhosts 设定一天中运行定时任务的时刻
    bindhosts --enable-cron     为 bindhosts 启用定时任务以更新您当前使用的列表中的 (默认情况下是早上十点)
    bindhosts --disable-cron    为 bindhosts 禁用和删除之前设置的定时任务
    bindhosts --help            显示帮助信息 (上述图像和文本展示的内容)
```

## Action
 点击 action 以在更新和重置的状态间切换
 
 ![manager_action](screenshots/manager_action.gif)

## WebUI
  添加您的自定义规则、规则（源）、白名单或黑名单。
 
 ![manager_action](screenshots/manager_webui.gif)

