"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/* eslint-disable no-undef */
var globalFetch = typeof window !== 'undefined' && window.fetch || typeof global !== 'undefined' && global.fetch; // eslint-disable-next-line global-require

var fetch = globalFetch || require('node-fetch');

var _require = require('zipkin'),
    JSON_V1 = _require.jsonEncoder.JSON_V1;

var _require2 = require('events'),
    EventEmitter = _require2.EventEmitter;

var defaultFetchImpl = fetch;

var HttpLogger = /*#__PURE__*/function (_EventEmitter) {
  _inherits(HttpLogger, _EventEmitter);

  var _super = _createSuper(HttpLogger);

  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.endpoint HTTP endpoint which spans will be sent
   * @param {number} options.httpInterval How often to sync spans.
   * @param {JsonEncoder} options.jsonEncoder JSON encoder to use when sending spans.
   * @param {number} options.timeout Timeout for HTTP Post when sending spans.
   * @param {number} options.maxPayloadSize Max payload size for zipkin span.
   * @param {Object<string, string>} options.headers Additional HTTP headers to be sent with span.
   * @param {Agent|Function} options.agent HTTP(S) agent to use for any networking related options.
   * @param {ErrorLogger} options.log Internal error logger used within the transport.
   * @param {(url: string, options: object) => Promise<Response>} options.fetchImplementation
   */
  function HttpLogger(_ref) {
    var _this;

    var endpoint = _ref.endpoint,
        _ref$headers = _ref.headers,
        headers = _ref$headers === void 0 ? {} : _ref$headers,
        _ref$agent = _ref.agent,
        agent = _ref$agent === void 0 ? null : _ref$agent,
        _ref$httpInterval = _ref.httpInterval,
        httpInterval = _ref$httpInterval === void 0 ? 1000 : _ref$httpInterval,
        _ref$jsonEncoder = _ref.jsonEncoder,
        jsonEncoder = _ref$jsonEncoder === void 0 ? JSON_V1 : _ref$jsonEncoder,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? 0 : _ref$timeout,
        _ref$maxPayloadSize = _ref.maxPayloadSize,
        maxPayloadSize = _ref$maxPayloadSize === void 0 ? 0 : _ref$maxPayloadSize,
        _ref$log = _ref.log,
        log = _ref$log === void 0 ? console : _ref$log,
        _ref$fetchImplementat = _ref.fetchImplementation,
        fetchImplementation = _ref$fetchImplementat === void 0 ? defaultFetchImpl : _ref$fetchImplementat;

    _classCallCheck(this, HttpLogger);

    _this = _super.call(this); // must be before any reference to *this*

    _this.log = log;
    _this.endpoint = endpoint;
    _this.agent = agent;
    _this.maxPayloadSize = maxPayloadSize;
    _this.queue = [];
    _this.queueBytes = 0;
    _this.jsonEncoder = jsonEncoder;
    _this.fetchImplementation = fetchImplementation;
    _this.errorListenerSet = false;
    _this.headers = Object.assign({
      'Content-Type': 'application/json'
    }, headers); // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
    // only supported by node-fetch; silently ignored by browser fetch clients
    // @see https://github.com/bitinn/node-fetch#fetch-options

    _this.timeout = timeout;
    var timer = setInterval(function () {
      _this.processQueue(_this.fetchImplementation);
    }, httpInterval);

    if (timer.unref) {
      // unref might not be available in browsers
      timer.unref(); // Allows Node to terminate instead of blocking on timer
    }

    return _this;
  }

  _createClass(HttpLogger, [{
    key: "_getPayloadSize",
    value: function _getPayloadSize(nextSpan) {
      // Our payload is in format '[s1,s2,s3]', so we need to add 2 brackets and
      // one comma separator for each payload, including the next span if defined
      return nextSpan ? this.queueBytes + 2 + this.queue.length + nextSpan.length : this.queueBytes + 2 + Math.min(this.queue.length - 1, 0);
    }
  }, {
    key: "on",
    value: function on() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var eventName = args[0]; // if the instance has an error handler set then we don't need to
      // skips error logging

      if (eventName.toLowerCase() === 'error') this.errorListenerSet = true;

      _get(_getPrototypeOf(HttpLogger.prototype), "on", this).apply(this, args);
    }
  }, {
    key: "logSpan",
    value: function logSpan(span) {
      var encodedSpan = this.jsonEncoder.encode(span);

      if (this.maxPayloadSize && this._getPayloadSize(encodedSpan) > this.maxPayloadSize) {
        this.processQueue(this.fetchImplementation);

        if (this._getPayloadSize(encodedSpan) > this.maxPayloadSize) {
          // Payload size is too large even with an empty queue, we can only drop
          var err = 'Zipkin span got dropped, reason: payload too large';
          if (this.errorListenerSet) this.emit('error', new Error(err));else this.log.error(err);
          return;
        }
      }

      this.queue.push(encodedSpan);
      this.queueBytes += encodedSpan.length;
    } // We need to receive the fetch implementation as argument to avoid the
    // lose of context when compiling this with webpack and babel. See this
    // PR for more details https://github.com/openzipkin/zipkin-js/pull/497

  }, {
    key: "processQueue",
    value: function processQueue(fetchImpl) {
      var _this2 = this;

      var self = this;

      if (self.queue.length > 0) {
        const formattedQueue = self.queue.map((trace) => {
          const formatTrace = JSON.parse(trace)
          
          if (formatTrace.annotations[0].endpoint) {
            formatTrace.localEndpoint = {}
            formatTrace.localEndpoint.serviceName = formatTrace.annotations[0].endpoint.serviceName
            delete formatTrace['annotations']
          }
          
          return JSON.stringify(formatTrace)
        })
        // console.log(typeof logger.queue[0])
        
        const postBody = `[${formattedQueue.join(',')}]`
        // var postBody = "[".concat(self.queue.join(','), "]");
        var fetchOptions = {
          method: 'POST',
          body: postBody,
          headers: self.headers,
          timeout: self.timeout,
          agent: self.agent
        };
        console.log(self.headers)
        fetchImpl(self.endpoint, fetchOptions).then(function (response) {
          if (response.status !== 202 && response.status !== 200) {
            var err = 'Unexpected response while sending Zipkin data, status:' + "".concat(response.status, ", body: ").concat(postBody);
            if (self.errorListenerSet) _this2.emit('error', new Error(err));else _this2.log.error(err);
          } else {
            _this2.emit('success', response);
          }
        })["catch"](function (error) {
          var err = "Error sending Zipkin data ".concat(error);
          if (self.errorListenerSet) _this2.emit('error', new Error(err));else _this2.log.error(err);
        });
        self.queue.length = 0;
        self.queueBytes = 0;
      }
    }
  }]);

  return HttpLogger;
}(EventEmitter);

module.exports = HttpLogger;