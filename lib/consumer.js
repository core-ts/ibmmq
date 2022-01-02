"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
function createConsumer(conf, logError, logInfo, json) {
  return new Consumer(conf, logError, logInfo, json);
}
exports.createConsumer = createConsumer;
function formatErr(err) {
  if (err) {
    return 'MQ call failed at ' + err.message;
  }
  else {
    return 'MQ call successful';
  }
}
exports.cleanupObjSubscription = function (mq, hObjSubscription, lgErr, lg) {
  try {
    mq.CloseSync(hObjSubscription, 0);
    if (lg) {
      lg('MQCLOSE (Subscription) successful');
    }
  }
  catch (err) {
    if (lgErr) {
      lgErr('MQCLOSE (Subscription) ended with reason ' + err);
    }
  }
};
exports.hexToBytes = function (hex) {
  var bytes = [];
  for (var c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, 2), 16));
  }
  return bytes;
};
function bytesToString(array) {
  return String.fromCharCode.apply(String, array);
}
exports.bytesToString = bytesToString;
var Consumer = (function () {
  function Consumer(conf, logError, logInfo, json) {
    this.conf = conf;
    this.logError = logError;
    this.logInfo = logInfo;
    this.json = json;
    this.mq = require('ibmmq');
    this.stringdecoderLib = require('string_decoder');
    this.mqmd = new this.mq.MQMD();
    this.gmo = new this.mq.MQGMO();
    this.gmo.WaitInterval = this.conf.interval;
    this.MQC = this.mq.MQC;
    this.gmo.Options = this.MQC.MQGMO_NO_SYNCPOINT |
      this.MQC.MQGMO_WAIT |
      this.MQC.MQGMO_CONVERT |
      this.MQC.MQGMO_FAIL_IF_QUIESCING;
    this.gmo.MatchOptions = this.MQC.MQMO_NONE;
    this.get = this.get.bind(this);
    this.consume = this.consume.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.queue = this.queue.bind(this);
  }
  Consumer.prototype.get = function (handle) {
    this.subscribe(handle);
  };
  Consumer.prototype.consume = function (handle) {
    this.subscribe(handle);
  };
  Consumer.prototype.subscribe = function (handle) {
    var _this = this;
    var StringDecoder = this.stringdecoderLib.StringDecoder;
    var decoder = new StringDecoder('utf8');
    var qMgr = this.conf.mgr;
    var topicString = this.conf.topic;
    var lg = this.logInfo;
    var lgErr = this.logError;
    var getMessage = function (hObj) {
      if (lg) {
        lg('Retrieving message.');
      }
      _this.mq.Get(hObj, _this.mqmd, _this.gmo, getCBSub);
    };
    var getCBSub = function (err, hObj, gmo, md, buf, hConn) {
      return __awaiter(_this, void 0, void 0, function () {
        var data, msg;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!err) return [3, 1];
              if (err.mqrc === this.MQC.MQRC_NO_MSG_AVAILABLE) {
                if (lg) {
                  lg('No available messages.');
                }
              }
              else {
                if (lgErr) {
                  lgErr(formatErr(err.mqrc));
                }
              }
              this.mq.GetDone(hObj);
              return [3, 3];
            case 1:
              data = this.json ? decoder.write(buf) : buf;
              msg = { data: data };
              return [4, handle(data, undefined, msg).then(function () {
                if (lg) {
                  lg('Update done.');
                }
              }).catch(function (err2) {
                if (lgErr) {
                  lgErr(formatErr(err2));
                }
              })];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3: return [2];
          }
        });
      });
    };
    var cno = core_1.authentication(this.mq, this.conf);
    this.mq.Connx(qMgr, cno, function (err, hConn) {
      if (err) {
        if (lgErr) {
          lgErr('MQCONN ended with reason code ' + err.mqrc);
        }
      }
      else {
        if (lg) {
          lg("MQCONN to " + qMgr + " successful ");
        }
        var sd = new _this.mq.MQSD();
        sd.ObjectString = topicString;
        sd.Options = _this.MQC.MQSO_CREATE
          | _this.MQC.MQSO_NON_DURABLE
          | _this.MQC.MQSO_FAIL_IF_QUIESCING
          | _this.MQC.MQSO_MANAGED;
        _this.mq.Sub(hConn, null, sd, function (err1, hObjPubQ, hObjSubscription) {
          if (err) {
            if (lgErr) {
              lgErr('MQSUB ended with reason ' + err1.mqrc);
            }
            clearInterval(_this.subInterval);
            exports.cleanupObjSubscription(_this.mq, hObjSubscription, lgErr, lg);
          }
          else {
            if (lg) {
              lg("MQSUB to topic " + topicString + " successful");
            }
            _this.subInterval = setInterval(function () { return getMessage(hObjPubQ); }, _this.conf.interval);
          }
        });
      }
    });
  };
  Consumer.prototype.queue = function (handle) {
    var _this = this;
    var lg = this.logInfo;
    var lgErr = this.logError;
    var MQC = this.mq.MQC;
    var StringDecoder = this.stringdecoderLib.StringDecoder;
    var decoder = new StringDecoder('utf8');
    var qMgr = this.conf.mgr;
    var qName = this.conf.queue;
    var msgId = null;
    var connectionHandle;
    var queueHandle;
    var getMessages = function () {
      var md = new _this.mq.MQMD();
      var gmo = new _this.mq.MQGMO();
      gmo.Options = MQC.MQGMO_NO_SYNCPOINT |
        MQC.MQGMO_WAIT |
        MQC.MQGMO_CONVERT |
        MQC.MQGMO_FAIL_IF_QUIESCING;
      gmo.MatchOptions = MQC.MQMO_NONE;
      if (msgId != null) {
        if (lg) {
          lg('Setting Match Option for MsgId');
        }
        gmo.MatchOptions = MQC.MQMO_MATCH_MSG_ID;
        md.MsgId = exports.hexToBytes(msgId);
      }
      _this.mq.Get(queueHandle, md, gmo, getCB);
    };
    var getCB = function (err, hObj, gmo, md, buf, hConn) {
      return __awaiter(_this, void 0, void 0, function () {
        var data, msg;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!err) return [3, 1];
              if (err.mqrc === MQC.MQRC_NO_MSG_AVAILABLE) {
                if (lg) {
                  lg('No more messages available.');
                }
              }
              else {
                if (lgErr) {
                  lgErr(formatErr(err.mqrc));
                }
              }
              this.mq.GetDone(hObj);
              return [3, 3];
            case 1:
              data = this.json ? decoder.write(buf) : buf;
              msg = { data: data };
              return [4, handle(data, undefined, msg).then(function () {
                if (lg) {
                  lg('Insert done');
                }
              }).catch(function (err2) {
                if (lgErr) {
                  lgErr(err2);
                }
              })];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3: return [2];
          }
        });
      });
    };
    var cno = core_1.authentication(this.mq, this.conf);
    var od = new this.mq.MQOD();
    od.ObjectName = qName;
    od.ObjectType = MQC.MQOT_Q;
    var openOptions = MQC.MQOO_INPUT_AS_Q_DEF;
    this.mq.Connx(qMgr, cno, function (err, hConn) {
      if (err) {
        if (lgErr) {
          lgErr(formatErr(err));
        }
      }
      else {
        if (lg) {
          lg("MQCONN to " + qMgr + " successful");
        }
        connectionHandle = hConn;
        _this.mq.Open(hConn, od, openOptions, function (err1, hObj) {
          queueHandle = hObj;
          if (err1) {
            if (lgErr) {
              lgErr(formatErr(err1));
            }
            core_1.cleanup(_this.mq, connectionHandle, queueHandle, lgErr, lg);
            clearTimeout(_this.interval);
          }
          else {
            if (lg) {
              lg("MQOPEN of " + qName + " successful");
            }
            _this.interval = setInterval(getMessages, _this.conf.interval);
          }
        });
      }
    });
  };
  return Consumer;
}());
exports.Consumer = Consumer;
