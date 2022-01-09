"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
function formatErr(err) {
  return 'MQ call failed in ' + err.message;
}
var Producer = (function () {
  function Producer(conf, logError, logInfo) {
    this.conf = conf;
    this.logError = logError;
    this.logInfo = logInfo;
    this.mq = require('ibmmq');
    this.put = this.put.bind(this);
    this.produce = this.produce.bind(this);
    this.queue = this.queue.bind(this);
    this.send = this.send.bind(this);
    this.write = this.write.bind(this);
    this.publish = this.publish.bind(this);
  }
  Producer.prototype.put = function (data) {
    return this.publish(data);
  };
  Producer.prototype.produce = function (data) {
    return this.publish(data);
  };
  Producer.prototype.send = function (data) {
    return this.publish(data);
  };
  Producer.prototype.write = function (data) {
    return this.publish(data);
  };
  Producer.prototype.publish = function (data) {
    var _this = this;
    var lg = this.logInfo;
    var lgErr = this.logError;
    return new Promise(function (resolve, reject) {
      var MQC = _this.mq.MQC;
      var qMgr = _this.conf.mgr;
      var topicString = _this.conf.topic;
      var publishMessage = function (hObj) {
        var succeed = true;
        var msg = JSON.stringify(data);
        var mqmd = new _this.mq.MQMD();
        var pmo = new _this.mq.MQPMO();
        pmo.Options = MQC.MQPMO_NO_SYNCPOINT |
          MQC.MQPMO_NEW_MSG_ID |
          MQC.MQPMO_NEW_CORREL_ID;
        pmo.Options |= MQC.MQPMO_WARN_IF_NO_SUBS_MATCHED;
        _this.mq.Put(hObj, mqmd, pmo, msg, function (err) {
          if (err) {
            if (lgErr) {
              lgErr(formatErr(err));
              succeed = false;
            }
          }
          else {
            if (lg) {
              lg('MQPUT successful');
            }
          }
        });
        return succeed;
      };
      if (lg) {
        lg('Sample AMQSPUB.JS start');
      }
      var cno = core_1.authentication(_this.mq, _this.conf);
      _this.mq.Connx(qMgr, cno, function (err, hConn) {
        if (err) {
          if (lgErr) {
            lgErr(formatErr(err));
            return reject(formatErr(err));
          }
        }
        else {
          if (lg) {
            lg("MQCONN to " + qMgr + " successful ");
          }
          var od = new _this.mq.MQOD();
          od.ObjectString = topicString;
          od.ObjectType = MQC.MQOT_TOPIC;
          var openOptions = MQC.MQOO_OUTPUT;
          _this.mq.Open(hConn, od, openOptions, function (err1, hObj) {
            if (err1) {
              if (lgErr) {
                lgErr(formatErr(err1));
                return reject(formatErr(err1));
              }
              core_1.cleanup(_this.mq, hConn, hObj, lgErr, lg);
            }
            else {
              if (lg) {
                lg("MQOPEN of " + topicString + " successful");
              }
              if (publishMessage(hObj)) {
                return resolve();
              }
            }
          });
        }
      });
    });
  };
  Producer.prototype.queue = function (data) {
    var _this = this;
    var lg = this.logInfo;
    var lgErr = this.logError;
    return new Promise(function (resolve, reject) {
      var MQC = _this.mq.MQC;
      var cno = core_1.authentication(_this.mq, _this.conf);
      _this.mq.ConnxPromise(_this.conf.mgr, cno)
        .then(function (hConn) {
          if (lg) {
            lg("MQCONN to " + _this.conf.mgr + " successful ");
          }
          _this.ghConn = hConn;
          var od = new _this.mq.MQOD();
          od.ObjectName = _this.conf.queue;
          od.ObjectType = MQC.MQOT_Q;
          var openOptions = MQC.MQOO_OUTPUT;
          return _this.mq.OpenPromise(hConn, od, openOptions);
        }).then(function (hObj) {
          if (lg) {
            lg("MQOPEN of " + _this.conf.queue + " successful");
          }
          var msg = JSON.stringify(data);
          var mqmd = new _this.mq.MQMD();
          var pmo = new _this.mq.MQPMO();
          pmo.Options = MQC.MQPMO_NO_SYNCPOINT |
            MQC.MQPMO_NEW_MSG_ID |
            MQC.MQPMO_NEW_CORREL_ID;
          _this.ghObj = hObj;
          return _this.mq.PutPromise(hObj, mqmd, pmo, msg);
        })
        .then(function () {
          if (lg) {
            lg('Done.');
          }
        })
        .catch(function (err) {
          if (lgErr) {
            lgErr(formatErr(err));
          }
          core_1.cleanup(_this.mq, _this.ghConn, _this.ghObj, lgErr, lg);
        });
    });
  };
  return Producer;
}());
exports.Producer = Producer;
exports.Publisher = Producer;
exports.Sender = Producer;
exports.Writer = Producer;
var TopicProducer = (function () {
  function TopicProducer(conf, logError, logInfo) {
    this.conf = conf;
    this.logError = logError;
    this.logInfo = logInfo;
    this.mq = require('ibmmq');
    this.put = this.put.bind(this);
    this.produce = this.produce.bind(this);
    this.send = this.send.bind(this);
    this.write = this.write.bind(this);
    this.publish = this.publish.bind(this);
  }
  TopicProducer.prototype.put = function (topic, data) {
    return this.publish(topic, data);
  };
  TopicProducer.prototype.produce = function (topic, data) {
    return this.publish(topic, data);
  };
  TopicProducer.prototype.send = function (topic, data) {
    return this.publish(topic, data);
  };
  TopicProducer.prototype.write = function (topic, data) {
    return this.publish(topic, data);
  };
  TopicProducer.prototype.publish = function (topic, data) {
    var _this = this;
    var lg = this.logInfo;
    var lgErr = this.logError;
    return new Promise(function (resolve, reject) {
      var MQC = _this.mq.MQC;
      var qMgr = _this.conf.mgr;
      var publishMessage = function (hObj) {
        var ok = true;
        var msg = JSON.stringify(data);
        var mqmd = new _this.mq.MQMD();
        var pmo = new _this.mq.MQPMO();
        pmo.Options = MQC.MQPMO_NO_SYNCPOINT |
          MQC.MQPMO_NEW_MSG_ID |
          MQC.MQPMO_NEW_CORREL_ID;
        pmo.Options |= MQC.MQPMO_WARN_IF_NO_SUBS_MATCHED;
        _this.mq.Put(hObj, mqmd, pmo, msg, function (err) {
          if (err) {
            if (lgErr) {
              lgErr(formatErr(err));
              ok = false;
            }
          }
          else {
            if (lg) {
              lg('MQPUT successful');
            }
          }
        });
        return ok;
      };
      if (lg) {
        lg('Sample AMQSPUB.JS start');
      }
      var cno = core_1.authentication(_this.mq, _this.conf);
      _this.mq.Connx(qMgr, cno, function (err, hConn) {
        if (err) {
          if (lgErr) {
            lgErr(formatErr(err));
          }
        }
        else {
          if (lg) {
            lg("MQCONN to " + qMgr + " successful ");
          }
          var od = new _this.mq.MQOD();
          od.ObjectString = topic;
          od.ObjectType = MQC.MQOT_TOPIC;
          var openOptions = MQC.MQOO_OUTPUT;
          _this.mq.Open(hConn, od, openOptions, function (err1, hObj) {
            if (err1) {
              if (lgErr) {
                lgErr(formatErr(err1));
                return reject(formatErr(err1));
              }
              core_1.cleanup(_this.mq, hConn, hObj, lgErr, lg);
            }
            else {
              if (lg) {
                lg("MQOPEN of " + topic + " successful");
              }
              if (publishMessage(hObj)) {
                resolve();
              }
            }
          });
        }
      });
    });
  };
  return TopicProducer;
}());
exports.TopicProducer = TopicProducer;
exports.TopicPublisher = TopicProducer;
exports.TopicSender = TopicProducer;
exports.TopicWriter = TopicProducer;
var QueueProducer = (function () {
  function QueueProducer(conf, logError, logInfo) {
    this.conf = conf;
    this.logError = logError;
    this.logInfo = logInfo;
    this.mq = require('ibmmq');
    this.put = this.put.bind(this);
    this.produce = this.produce.bind(this);
    this.send = this.send.bind(this);
    this.write = this.write.bind(this);
    this.publish = this.publish.bind(this);
  }
  QueueProducer.prototype.put = function (queue, data) {
    return this.publish(queue, data);
  };
  QueueProducer.prototype.produce = function (queue, data) {
    return this.publish(queue, data);
  };
  QueueProducer.prototype.send = function (queue, data) {
    return this.publish(queue, data);
  };
  QueueProducer.prototype.write = function (queue, data) {
    return this.publish(queue, data);
  };
  QueueProducer.prototype.publish = function (queue, data) {
    var _this = this;
    var lg = this.logInfo;
    var lgErr = this.logError;
    return new Promise(function (resolve, reject) {
      var MQC = _this.mq.MQC;
      var cno = core_1.authentication(_this.mq, _this.conf);
      _this.mq.ConnxPromise(_this.conf.mgr, cno)
        .then(function (hConn) {
          if (lg) {
            lg("MQCONN to " + _this.conf.mgr + " successful ");
          }
          _this.ghConn = hConn;
          var od = new _this.mq.MQOD();
          od.ObjectName = queue;
          od.ObjectType = MQC.MQOT_Q;
          var openOptions = MQC.MQOO_OUTPUT;
          return _this.mq.OpenPromise(hConn, od, openOptions);
        }).then(function (hObj) {
          if (lg) {
            lg("MQOPEN of " + queue + " successful");
          }
          var msg = JSON.stringify(data);
          var mqmd = new _this.mq.MQMD();
          var pmo = new _this.mq.MQPMO();
          pmo.Options = MQC.MQPMO_NO_SYNCPOINT |
            MQC.MQPMO_NEW_MSG_ID |
            MQC.MQPMO_NEW_CORREL_ID;
          _this.ghObj = hObj;
          return _this.mq.PutPromise(hObj, mqmd, pmo, msg);
        })
        .then(function () {
          if (lg) {
            lg('Done.');
            return resolve();
          }
        })
        .catch(function (err) {
          if (lgErr) {
            lgErr(formatErr(err));
            return reject(formatErr(err));
          }
          core_1.cleanup(_this.mq, _this.ghConn, _this.ghObj, lgErr, lg);
        });
    });
  };
  return QueueProducer;
}());
exports.QueueProducer = QueueProducer;
exports.QueuePublisher = QueueProducer;
exports.QueueSender = QueueProducer;
exports.QueueWriter = QueueProducer;
