! function () {
    function base64encode(a) {
        //...
    }

    /**
     * 创建通信iframe
     * setResultIframe 从端接收数据
     * readyMessageIframe 发送数据给端
     * @param {object} a document
     */
    function _createQueueReadyIframe(a) {
        _setResultIframe = a.createElement("iframe");
        _setResultIframe.id = "__WeixinJSBridgeIframe_SetResult";
        _setResultIframe.style.display = "none";
        a.documentElement.appendChild(_setResultIframe);

        _readyMessageIframe = a.createElement("iframe");
        _readyMessageIframe.id = "__WeixinJSBridgeIframe";
        _readyMessageIframe.style.display = "none";
        a.documentElement.appendChild(_readyMessageIframe);
    }

    /**
     * 将消息内容推送入栈，并通过_readyMessageIframe通知native
     * @param {string} a 
     */
    function _sendMessage(a) {
        _sendMessageQueue.push(a);
        // weixin://dispatch_message/
        _readyMessageIframe.src = _CUSTOM_PROTOCOL_SCHEME + "://" + _QUEUE_HAS_MESSAGE;
    }

    function _fetchQueue() {
        var a = __WeixinJSBridge._fetchQueue;
        if (a !== _fetchQueueIdentifier) return "";
        var b = JSON.stringify(_sendMessageQueue);
        if ("yes" === _isUseMd5) {
            var c = new Array;
            c[0] = b, c[1] = _xxyy;
            var d = c.join(""),
                e = "",
                f = CryptoJS.SHA1(d);
            e = f.toString();
            var g = {};
            g[_JSON_MESSAGE] = _sendMessageQueue, g[_SHA_KEY] = e, b = JSON.stringify(g)
        }
        return _sendMessageQueue = [], _setResultValue("SCENE_FETCHQUEUE", b), b
    }

    function _handleMessageFromWeixin(a) {
        var b = __WeixinJSBridge._handleMessageFromWeixin;
        if (b !== _handleMessageIdentifier) return "{}";
        var c, d;
        if ("yes" === _isUseMd5) {
            var e = a[_JSON_MESSAGE],
                f = a[_SHA_KEY],
                g = new Array;
            g[0] = JSON.stringify(e), g[1] = _xxyy;
            var h = g.join(""),
                i = "",
                j = CryptoJS.SHA1(h);
            if (i = j.toString(), i !== f) return _log("_handleMessageFromWeixin , shaStr : " + f + " , str : " + h + " , msgSha : " + i), "{}";
            d = e
        } else d = a;
        switch (d[_MESSAGE_TYPE]) {
            case "callback":
                if ("string" == typeof d[_CALLBACK_ID] && "function" == typeof _callback_map[d[_CALLBACK_ID]]) {
                    var c = _callback_map[d[_CALLBACK_ID]](d.__params);
                    return delete _callback_map[d[_CALLBACK_ID]], _setResultValue("SCENE_HANDLEMSGFROMWX", JSON.stringify(c)), JSON.stringify(c)
                }
                return _setResultValue("SCENE_HANDLEMSGFROMWX", JSON.stringify({
                    __err_code: "cb404"
                })), JSON.stringify({
                    __err_code: "cb404"
                });
            case "event":
                if ("string" == typeof d[_EVENT_ID]) {
                    if ("function" == typeof _event_hook_map_for3rd[d[_EVENT_ID]] && _isIn3rdApiList(d[_EVENT_ID])) {
                        var k = ["menu:share:timeline", "menu:share:qq", "menu:share:weiboApp", "menu:share:QZone", "menu:share:appmessage", "menu:share:email", "menu:share:facebook"];
                        k.indexOf(d[_EVENT_ID]) > -1 && _sendMessage(JSON.stringify({
                            __handleFromWeixin: _xxyy,
                            __fullApiName: d.__params.fullApiName
                        }));
                        var c = _event_hook_map_for3rd[d[_EVENT_ID]](d.__params);
                        return _setResultValue("SCENE_HANDLEMSGFROMWX", JSON.stringify(c)), JSON.stringify(c)
                    }
                    if ("function" == typeof _event_hook_map[d[_EVENT_ID]]) {
                        var c = _event_hook_map[d[_EVENT_ID]](d.__params);
                        return _setResultValue("SCENE_HANDLEMSGFROMWX", JSON.stringify(c)), JSON.stringify(c)
                    }
                }
                return _setResultValue("SCENE_HANDLEMSGFROMWX", JSON.stringify({
                    __err_code: "ev404"
                })), JSON.stringify({
                    __err_code: "ev404"
                })
        }
    }

    function _setResultValue(a, b) {
        void 0 === b && (b = "dummy"), _setResultQueue.push(a + "&" + base64encode(UTF8.encode(b))), _setResultQueueRunning || _continueSetResult()
    }

    function _continueSetResult() {
        var a = _setResultQueue.shift();
        void 0 === a ? _setResultQueueRunning = !1 : window.WeixinJSBridge._isBridgeByIframe ? (_setResultQueueRunning = !0, _setResultIframe.src = "weixin://private/setresult/" + a) : (_setResultQueueRunning = !0, console.log("weixin://private/setresult/" + a))
    }

    /**
     * 是否在第三方api列表
     * @param {*} a 
     */
    function _isIn3rdApiList(a) {
        var b = _runOn3rdApiList.some(function (b) {
            return b === a
        });
        return _log("_isIn3rdApiList , event : " + a + " , result : " + b), b
    }

    /**
     * 返回当前参数值
     * @param {*} a 
     */
    function _env(a) {
        var b = __WeixinJSBridge.env;
        return b !== _envIdentifier ? "" : _session_data[a]
    }

    /**
     * 打日志
     * @param {*} a 
     */
    function _log(a) {
        // .. 
        _call("log", {
            msg: e
        })
    }

    /**
     * 执行相关native方法
     * @param {string} func         执行函数名
     * @param {object} params       传递参数
     * @param {function} [callback]   
     */
    function _call(func, params, callback) {
        var callbackid = (_callback_count++).toString();

        if ('function' === typeof callback) {
            _callback_map[callbackid] = callback;
        }
        var f = {
            func: func,
            params: params
        };
        f[_MESSAGE_TYPE] = 'call';
        f[_CALLBACK_ID] = callbackid;
        _sendMessage(JSON.stringify(f));
    }

    /**
     * 
     * @param {string} func 
     * @param {function} callback 
     */
    function _on(func, callback) {
        _event_hook_map[func] = callback;
    }

    function _onfor3rd(func, callback) {
        _event_hook_map_for3rd[func] = callback;
    }

    /**
     * 执行js callback
     * @param {string} func 
     * @param {*} params 
     */
    function _emit(func, params) {
        _isIn3rdApiList(func) ? _event_hook_map_for3rd[func](params) : _event_hook_map[func](params);
    }

    /**
     * 通过链接调用原生imagePreview预览图片
     */
    function _enable_old_UrlStyleImagePreviews() {
        var a = "weixin://viewimage/";
        _WXJS('a[href^="weixin://viewimage/"]').on("click", function (b) {
            // <a href="weixin://viewimage/http://w3cboy.com/static/images/gravatar.png">预览图片</a>
            var c = "string" == typeof b.target.href && 0 === b.target.href.search(a) ? b.target : _WXJS(b.target).parents('a[href^="weixin://viewimage/"]')[0];
            var d = c.href.substr(a.length);
            var e = _WXJS('a[href^="weixin://viewimage/"]');
            var f = [];
            for (g = 0; g < e.length; g++) {
                f.push(e[g].href.substr(a.length));
            }
            _call("imagePreview", {
                urls: f, // 页面所有的预览图片链接
                current: d // 当前图片链接
            });
            b.preventDefault();
        })
    }

    /**
     * 通过链接执行回调，设置分享微博和朋友圈
     */
    function _enable_old_ReaderShareUrls() {
        _WXJS('a[href^="weixin://readershare/"]').on("click", function (a) {
            a.preventDefault();
            _emit("menu:share:weibo", _session_data.shareWeiboData || {})
        }), _WXJS('a[href^="weixin://readertimeline/"]').on("click", function (a) {
            a.preventDefault();
            _emit("menu:share:timeline", _session_data.shareTimelineData || {})
        })
    }

    function _enable_hashChangeNotify() {
        _WXJS(window).bind("hashchange", function () {
            _call("hashChange", {
                hash: window.location.hash
            })
        })
    }

    function _setDefaultEventHandlers() {

        /**
         * 右上角设置字体缩放
         */
        _on("menu:setfont", function (params) {
            if ("function" == typeof changefont) {
                var b = parseInt(params.fontSize);
                _log("set font size with changefont: %s", params.fontSize);
                return void changefont(b);
            }
            var c;
            switch (params.fontSize) {
                case "1":
                    c = "80%";
                    break;
                case "2":
                    c = "100%";
                    break;
                case "3":
                    c = "120%";
                    break;
                case "4":
                    c = "140%";
                    break;
                default:
                    return
            }
            _log("set font size with webkitTextSizeAdjust: %s", params.fontSize);
            _call("setFontSizeCallback", {
                fontSize: params.fontSize
            })
        });
        
        var findImage = function (callback) {

            /**
             * 找到第一个 css('display') !== 'none' && css('visibility') !== hidden
             * && width > 290 && height > 290 
             * 找到就设置为分享图片
             */
        };

        /**
         * 右上角分享朋友圈
         */
        _on("menu:share:timeline", function (b) {
            _log("share timeline");
            var c;

            if ("string" == typeof params.title) {
                c = params;
                _sendMessage(JSON.stringify({
                    __handleFromWeixin: _xxyy, // xx_yy
                    __fullApiName: "shareTimeline"
                }));
                _call("shareTimeline", c);
            } else {
                c = {
                    link: document.documentURI || _session_data.init_url,
                    desc: document.documentURI || _session_data.init_url,
                    title: document.title
                };
                var callback = function (img) {
                    if (img) {
                        c.img_url = img.src;
                        c.img_width = img.width;
                        c.img_height = img.height;
                        _sendMessage(JSON.stringify({
                            __handleFromWeixin: _xxyy,
                            __fullApiName: "shareTimeline"
                        }));
                        _call("shareTimeline", c)
                    }
                };
                findImage(callback);
            }
        }), _on("menu:share:qq", function (b) {
            // 同上
            //  __fullApiName: "shareQQ"
        }), _on("menu:share:weiboApp", function (b) {
            // __fullApiName: "shareWeiboApp"
        }), _on("menu:share:QZone", function (b) {
            // __fullApiName: "shareQZone"
        }), _on("menu:share:facebook", function (b) {
            // __fullApiName: "shareFacebook"
        }), _on("menu:share:appmessage", function (b) {
            // __fullApiName: "sendAppMessage"
        }), _on("menu:share:email", function (a) {
            // __fullApiName: "sendEmail"
            // params.content = document.documentURI || _session_data.init_url
            // params.title = document.title
        }), _on("sys:init", function (a) {
            // WeixinJSBridgeReady事件
            if (window.WeixinJSBridge._hasInit) return void _log("hasInit, no need to init again");
            window.WeixinJSBridge._hasInit = !0;
            var b = doc.createEvent("Events");
            b.initEvent("WeixinJSBridgeReady");
            doc.dispatchEvent(b);
        }), _on("sys:preInit", function (params) {
            // WeixinJSBridgePreReady事件
            if (window.WeixinJSBridge._hasInit) return void _log("preInit, has init, no need to init again");
            if (window.WeixinJSBridge._hasPreInit) return void _log("preInit, has pre init, no need to init again");
            window.WeixinJSBridge._hasPreInit = !0;
            
            // _session_data.init_url
            // _session_data.shareWeiboData
            // _session_data.shareTimelineData

            // _env()
            // _session_data.webview_type
            // _session_data.init_font_size
            _session_data = params;


            var b = doc.createEvent("Events");
            b.initEvent("WeixinJSBridgePreReady");
            doc.dispatchEvent(b);

        }), _on("sys:bridged", function (a) {
            if (!window.WeixinJSBridge._hasInit) {
                if ("1" === _env("webview_type")) {
                    _emit("menu:setfont", {
                        fontSize: _env("init_font_size")
                    });
                }
                try {
                    _enable_old_UrlStyleImagePreviews();
                    _enable_old_ReaderShareUrls();
                    _enable_hashChangeNotify();
                } catch (b) {
                    _log("error %s", b)
                }
            }
        }), _on("sys:attach_runOn3rd_apis", function (a) {
            "object" == typeof a[_RUN_ON_3RD_APIS] && (_runOn3rdApiList = a[_RUN_ON_3RD_APIS], _log("_runOn3rdApiList : " + _runOn3rdApiList))
        }), _on("sys:get_all_hosts", function (a) {
            var b = getDomainList();
            return _log("sys:get_all_hosts : " + b), "wxGetAllHosts:" + b
        }), _on("sys:get_html_content", function (a) {
            var b = getHtmlContent();
            return _log("sys:get_html_content : " + b), "wxGetHtmlContent:" + b
        })
    }

    function getDomain(a, b) {
        if (a && !(a.length <= 0))
            for (var c, d, e, f = /http(s)?\:\/\/([^\/\?]*)(\?|\/)?/, g = 0, h = a.length; h > g; ++g) c = a[g], c && (d = c.getAttribute(b), d && (e = d.match(f), e && e[2] && domain_list.push(e[2])))
    }

    function getDomainList() {
        domain_list = [];
        getDomain(document.getElementsByTagName("a"), "href");
        getDomain(document.getElementsByTagName("link"), "href");
        getDomain(document.getElementsByTagName("iframe"), "src");
        getDomain(document.getElementsByTagName("script"), "src");
        getDomain(document.getElementsByTagName("img"), "src");
        return domain_list.join(",")
    }

    function getHtmlContent() {
        return document.documentElement.innerHTML
    }

    function _test_start() {
        _emit("sys:init", {});
        _emit("sys:bridged", {});
    }
    if (!window.WeixinJSBridge) {
        /**
         * @desc polyfills: trim reduce
         */

        /**
         * zeptojs: event detect fx ajax form touch
         * touch: wx-swipe wx-swipeLeft wx-swipeRight wx-swipeUp wx-swipeDown wx-doubleTap wx-tap wx-singleTap wx-longTap
         */
        window._WXJS = _WXJS

        var _readyMessageIframe, _sendMessageQueue = [],
            _receiveMessageQueue = [],
            _callback_count = 1e3,
            _callback_map = {},
            _event_hook_map = {},
            _session_data = {},
            _MESSAGE_SEPERATOR = "__wxmsg_sep__",
            _CUSTOM_PROTOCOL_SCHEME = "weixin",
            _MESSAGE_TYPE = "__msg_type",
            _CALLBACK_ID = "__callback_id",
            _EVENT_ID = "__event_id",
            _QUEUE_HAS_MESSAGE = "dispatch_message/",
            _setResultIframe, _runOn3rdApiList = [],
            _event_hook_map_for3rd = {},
            _RUN_ON_3RD_APIS = "__runOn3rd_apis",
            _xxyy = "xx_yy",
            _JSON_MESSAGE = "__json_message",
            _MSG_QUEUE = "__msg_queue",
            _CONTEXT_KEY = "__context_key",
            _context_val = "",
            _isUseMd5 = "isUseMd5_check",
            _SHA_KEY = "__sha_key",
            _handleMessageIdentifier = _handleMessageFromWeixin,
            _fetchQueueIdentifier = _fetchQueue,
            _logIdentifier = _log,
            _envIdentifier = _env,
            _onfor3rdIdentifier = _onfor3rd,
            _callIdentifier = _call,
            _setResultQueue = [],
            _setResultQueueRunning = !1,
            domain_list = [],
            __WeixinJSBridge = {
                invoke: _call,
                call: _call,
                on: _onfor3rd,
                env: _env,
                log: _log,
                _fetchQueue: _fetchQueue,
                _hasInit: !1,
                _hasPreInit: !1,
                _isBridgeByIframe: !0,
                _continueSetResult: _continueSetResult
            };
        try {
            Object.defineProperty(__WeixinJSBridge, "_handleMessageFromWeixin", {
                value: _handleMessageFromWeixin,
                writable: !1,
                configurable: !1
            })
        } catch (e) {
            return
        }
        try {
            Object.defineProperty(window, "WeixinJSBridge", {
                value: __WeixinJSBridge,
                writable: !1,
                configurable: !1
            })
        } catch (e) {
            return
        }
        var doc = document;
        _createQueueReadyIframe(doc), _setDefaultEventHandlers()
    }
}();