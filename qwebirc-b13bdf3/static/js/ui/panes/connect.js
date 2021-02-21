qwebirc.ui.ConnectPane = new Class({
  Implements: [Events],
  initialize: function(parent, options) {
    var callback = options.callback, initialNickname = options.initialNickname, initialChannels = options.initialChannels, autoNick = options.autoNick;
    this.options = options;
    this.cookie = new Hash.Cookie("optconn", {duration: 3650, autoSave: false});
    var uiOptions = options.uiOptions;
    this.__windowName = "authgate_" + Math.floor(Math.random() * 100000);

    var delayfn = function() { parent.set("html", "<div class=\"loading\">Loading. . .</div>"); };
    var cb = delayfn.delay(500);

    var r = qwebirc.ui.RequestTransformHTML({url: qwebirc.global.staticBaseURL + "panes/connect.html", update: parent, onSuccess: function() {
      $clear(cb);

      var rootElement = parent.getElement("[name=connectroot]");
      this.rootElement = rootElement;
      
      this.util.exec = function(n, x) { rootElement.getElements(n).each(x); };
      var util = this.util;
      var exec = util.exec;

      exec("[name=loginbox]", util.setVisible(true));

      if($defined(uiOptions.logoURL)) {
        var logoBar = parent.getElement("[class=bar-logo]");
        if(uiOptions.logoURL)
          logoBar.setAttribute("style", "background: url(" + uiOptions.logoURL + ") no-repeat center top; _filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + uiOptions.logoURL + "',sizingMethod='crop');");

        util.makeVisible(parent.getElement("[name=loginheader]"));
      } else {
        util.makeVisible(parent.getElement("[name=nologologinheader]"));
      }

      if(initialNickname === null && initialChannels === null) {
        var n2 = this.cookie.get("nickname");
        if(n2 !== null)
          initialNickname = n2;

        var c2 = this.cookie.get("autojoin");
        if(c2 !== null)
          initialChannels = c2;
      }

      if(initialChannels === null) {
        initialChannels = "";
      }

      var n2 = this.cookie.get("network");
      if(n2 !== null)
        exec("[name=network]", util.setText(n2));

      exec("[name=nickname]", util.setText(initialNickname));
      exec("[name=channels]", util.setText(initialChannels));
      exec("[name=prettychannels]", function(node) { this.__buildPrettyChannels(node, initialChannels); }.bind(this));
      exec("[name=networkname]", util.setText(uiOptions.networkName));

      var focus = "connect";
      if(!initialNickname) {
        focus = "nickname";
      } else if(initialNickname && !initialChannels) {
        focus = "channels";
      }

      this.__validate = this.__validateLoginData;

      var login = qwebirc.auth.loggedin(true);
      if(login) {
        exec("[name=authname]", util.setText(login[0]));
        exec("[name=connectbutton]", util.makeVisible);
        exec("[name=loginstatus]", util.makeVisible);
      } else {
        if(qwebirc.ui.isAuthRequired()) {
          exec("[name=loginconnectbutton]", util.makeVisible);
          if(focus == "connect")
            focus = "loginconnect";
        } else {
          exec("[name=connectbutton]", util.makeVisible);
          exec("[name=loginbutton]", util.makeVisible);
        }
      }

      if(window == window.top) /* don't focus when we're iframe'd */
        exec("[name=" + focus + "]", util.focus);
      exec("[name=connect]", util.attachClick(this.__connect.bind(this)));
      exec("[name=loginconnect]", util.attachClick(this.__loginConnect.bind(this)));

      exec("[name=login]", util.attachClick(this.__login.bind(this)));

      if(qwebirc.ui.isHideAuth())
       exec("[name=login]", util.setVisible(false));
    }.bind(this)});
    r.get();
  },
  util: {
    makeVisible: function(x) { x.setStyle("display", ""); },
    setVisible: function(y) { return function(x) { x.setStyle("display", y ? "" : "none"); }; },
    focus: function(x) { try { x.focus(); } catch (e) { } },
    attachClick: function(fn) { return function(x) { x.addListener("click", fn); } },
    setText: function(x) { return function(y) {
      if(typeof y.value === "undefined") {
        y.set("text", x);
      } else {
        y.value = x === null ? "" : x;
      }
    } }
  },
  validate: function() {
    return this.__validate();
  },
  __connect: function(e) {
    new Event(e).stop();
    var data = this.validate();
    if(data === false)
      return;

    this.__cancelLogin();
    this.fireEvent("close");
    this.cookie.extend(data);
    this.cookie.save();
    this.options.callback(data);
  },
  __cancelLogin: function(noUIModifications) {
    if(this.__cancelLoginCallback)
      this.__cancelLoginCallback(noUIModifications);
  },
  __loginConnect: function(e) {
    new Event(e).stop();
    if(this.validate() === false)
      return;

    this.__performLogin(function() {
      var data = this.validate();
      if(data === false) {
        /* we're logged in -- show the normal join button */
        this.util.exec("[name=connectbutton]", this.util.setVisible(true));
        return;
      }

      this.fireEvent("close");
      this.options.callback(data);
    }.bind(this), "loginconnectbutton");
  },
  __login: function(e) {
    new Event(e).stop();

    this.__cancelLogin(true);

    this.__performLogin(function() {
      var focus = "connect";
      var nick = this.rootElement.getElement("input[name=nickname]").value;
      var chan = this.rootElement.getElement("input[name=channels]").value;
      if(!nick) {
        focus = "nickname";
      } else if(!chan) {
        focus = "channels";
      }
      this.util.exec("[name=" + focus + "]", this.util.focus);
    }.bind(this), "login");
  },
  __performLogin: function(callback, calleename) {
    var handle = window.open("/auth", this.__windowName, "status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=0,scrollbars=1,height=280,width=550");

    if(handle === null || handle === undefined) {
      return;
    }

    var closeDetector = function() {
      if(handle.closed)
        this.__cancelLoginCallback();
    }.bind(this);
    var closeCallback = closeDetector.periodical(100);

    this.__cancelLoginCallback = function(noUIModifications) {
      $clear(closeCallback);

      try {
        handle.close();
      } catch(e) {
      }

      if(!noUIModifications) {
        this.util.exec("[name=loggingin]", this.util.setVisible(false));
        this.util.exec("[name=" + calleename + "]", this.util.setVisible(true));
      }
      this.__cancelLoginCallback = null;
    }.bind(this);

    __qwebircAuthCallback = function(qticket, qticketUsername, realExpiry) {
      if (typeof sessionStorage === "undefined")
      {
        alert("No session storage support in this browser -- login not supported");
        this.__cancelLoginCallback(false);
        return;
      }

      this.__cancelLoginCallback(true);
      sessionStorage.setItem("qticket", qticket);
      sessionStorage.setItem("qticket_username", qticketUsername);
      sessionStorage.setItem("qticket_expiry", realExpiry);

      this.util.exec("[name=loggingin]", this.util.setVisible(false));
      this.util.exec("[name=loginstatus]", this.util.setVisible(true));
      this.util.exec("[name=authname]", this.util.setText(qticketUsername));
      callback();
    }.bind(this);

    this.util.exec("[name=loggingin]", this.util.setVisible(true));
    this.util.exec("[name=" + calleename + "]", this.util.setVisible(false));
  },
  __validateConfirmData: function() {
    return {nickname: this.options.initialNickname, autojoin: this.options.initialChannels};
  },
  __validateLoginData: function() {
    var nickname = this.rootElement.getElement("input[name=nickname]").value;
    var channels = this.rootElement.getElement("input[name=channels]").value;
    var network = this.rootElement.getElement("select[name=network]").value;
    if(channels == "#") /* sorry channel "#" :P */
      channels = "";

    if(!nickname || !channels || !network) {
      alert("昵称和频道不能为空");
      return false;
    }

    var data = {nickname: nickname, autojoin: channels, network: network};
    return data;
  },
  __buildPrettyChannels: function(node, channels) {
    var c = channels.split(" ")[0].split(",");
    node.appendChild(document.createTextNode("channel" + ((c.length>1)?"s":"") + " "));
    for(var i=0;i<c.length;i++) {
      if((c.length > 1) && (i == c.length - 1)) {
        node.appendChild(document.createTextNode(" and "));
      } else if(i > 0) {
        node.appendChild(document.createTextNode(", "));
      }
      node.appendChild(new Element("b").set("text", c[i]));
    }
  }
});

qwebirc.ui.isAuthRequired = (function() {
  var args = qwebirc.util.parseURI(String(document.location));
  var value = $defined(args) && args.get("authrequired");
  return function() {
    return value && qwebirc.auth.enabled();
  };
})();

qwebirc.ui.isHideAuth = (function() {
  var args = qwebirc.util.parseURI(String(document.location));
  var value = $defined(args) && args.get("hideauth");
  return function() {
    return value;
  };
})();