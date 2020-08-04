一、安装注意事项
使用pip2.7 install 依次安装如下依赖库
 - autobahn==17.7.1
 - simplejson==3.11.1
 - Twisted==20.3.0(官方要求的版本17.5.0无法正常工作)

二、问题跟踪记录
问题：在Aliyun的CentOS上无法运行，提示如下错误：
  File "/usr/lib/python2.7/site-packages/autobahn/twisted/choosereactor.py", line 31, in <module>
    import txaio
  File "/usr/lib/python2.7/site-packages/txaio/__init__.py", line 29, in <module>
    from txaio.interfaces import IFailedFuture, ILogger
  File "/usr/lib/python2.7/site-packages/txaio/interfaces.py", line 41, in <module>
    class IBatchedTimer(abc.ABC):
AttributeError: 'module' object has no attribute 'ABC'
定位原因：默认安装的txaio库是python3版本，需要降级
解决方法：
 #pip uninstall txaio
 #pip2.7 install txaio
