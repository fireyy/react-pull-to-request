var React = require('react');
var ReactDOM = require('react-dom');
var transitionEnd = require('./transitionEnd');

var PullToRequest = React.createClass({
  ActionStatus: {
    default: 'default',
    prepare: 'prepare',
    load: 'load'
  },

  propTypes: {
    disableDragDown: React.PropTypes.bool,
    disableDragUp: React.PropTypes.bool,
    threshold: React.PropTypes.number,
    dragDownThreshold: React.PropTypes.number,
    dragUpThreshold: React.PropTypes.number,
    dragDownRegionCls: React.PropTypes.string,
    dragUpRegionCls: React.PropTypes.string,
    dragDownHelper: React.PropTypes.func,
    dragUpHepler: React.PropTypes.func,
    preventDragHelper: React.PropTypes.bool,
    beforeDrag: React.PropTypes.func,
    dragDownDefault: React.PropTypes.func,
    dragDownPrepare: React.PropTypes.func,
    dragDownLoad: React.PropTypes.func,
    dragUpDefault: React.PropTypes.func,
    dragUpPrepare: React.PropTypes.func,
    dragUpLoad: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      threshold: 80,
      dragDownThreshold: 80,
      dragUpThreshold: 80,
      dragDownRegionCls: "latest",
      dragUpRegionCls: "more"
    }
  },

  getInitialState: function() {
    return {
      downRegion: 0,
      downRegionHtml: '',
      upRegion: 0,
      upRegionHtml: ''
    };
  },

  componentDidMount: function() {
    this.ct = ReactDOM.findDOMNode(this.refs.container);

    this._events = {};
    this._draggable = true;

    this._setupEvent();
  },

  _setupEvent: function() {
    this.ct.addEventListener('touchstart', this, false);
    var _eventName = '', that = this;
    for(var z in this.ActionStatus){
      ['Up','Down'].forEach(function(key){
        _eventName = 'drag' + key + z.charAt(0).toUpperCase() + z.substr(1);
        if(that.props[_eventName]){
          that.on(_eventName, that.props[_eventName]);
        }
      })
    };
  },

  _createDragDownRegion: function() {
    this._removeDragDownRegion();
    this._touchCoords.status = this._processStatus('down', 0, null, true);
    this.setState({
      downRegion: 1
    });
    return ReactDOM.findDOMNode(this.refs.header);
  },

  _removeDragDownRegion: function() {
    this.setState({
      downRegion: 0
    });
  },

  _createDragUpRegion: function() {
    this._removeDragUpRegion();
    this._touchCoords.status = this._processStatus('up', 0, null, true);
    this.setState({
      upRegion: 1
    });
    return ReactDOM.findDOMNode(this.refs.footer);
  },

  _removeDragUpRegion: function() {
    this.setState({
      upRegion: 0
    });
  },

  _processDragDownHelper: function(status) {
    var options = this.props,
        helper = options.dragDownHelper;
    if (!options.preventDragHelper && helper) {
      this.setState({
        downRegionHtml: helper.call(this, status)
      });
    }
  },

  _processDragUpHelper: function(status) {
    var options = this.props,
        helper = options.dragUpHelper;
    if (!options.preventDragHelper && helper) {
      this.setState({
        upRegionHtml: helper.call(this, status)
      });
    }
  },

  /*
   * status:
   *   default 默认状态
   *   prepare 释放加载
   *   load 加载
   */
  _processStatus: function(orient, offsetY, currentStatus, moved) {
    var options = this.props,
        ActionStatus = this.ActionStatus,
        overflow, nextStatus = currentStatus,
        upperStr;
    if (orient) {
      upperStr = orient.charAt(0).toUpperCase() + orient.substr(1);
      overflow = offsetY > options['drag' + upperStr + 'Threshold'];
      if (!overflow && currentStatus != ActionStatus.default) {
        this['_processDrag' + upperStr + 'Helper'].call(this, ActionStatus.default);
        this._fireEvent('drag' + upperStr + 'Default', [this]);
        nextStatus = ActionStatus.default;
      } else if (moved && overflow && currentStatus != ActionStatus.prepare) {
        this['_processDrag' + upperStr + 'Helper'].call(this, ActionStatus.prepare);
        this._fireEvent('drag' + upperStr + 'Prepare', [this]);
        nextStatus = ActionStatus.prepare;
      } else if (!moved && overflow && currentStatus != ActionStatus.load) {
        this['_processDrag' + upperStr + 'Helper'].call(this, ActionStatus.load);
        this._fireEvent('drag' + upperStr + 'Load', [this]);
        nextStatus = ActionStatus.load;
      }
    }
    return nextStatus;
  },

  _onTouchStrat: function(e) {
    this.ct.removeEventListener('touchmove', this, false);
    this.ct.removeEventListener('touchend', this, false);
    var body = document.body,
        startScrollY = this.ct === body ? (window.pageYOffset || window.scrollY || document.documentElement.scrollTop) : this.ct.scrollTop;
    if (this._draggable && (this.props.disableDragDown !== true || this.props.disableDragUp !== true) && this._fireEvent('beforeDrag') !== false) {
      this._draggable = false;
      this.ct.addEventListener('touchmove', this, false);
      this.ct.addEventListener('touchend', this, false);
      this._touchCoords = {};
      this._touchCoords.startY = e.touches[0].screenY;
      this._touchCoords.startScrollY = startScrollY;
    }
  },

  _onTouchMove: function(e) {
    var ct = this.ct, header = ReactDOM.findDOMNode(this.refs.header), footer = ReactDOM.findDOMNode(this.refs.footer),
        options = this.props,
        innerHeight = window.innerHeight,
        ctHeight = ct.scrollHeight,
        coords = this._touchCoords,
        startScrollY = coords.startScrollY,
        blockY = coords.blockY,
        startY = coords.startY,
        stopY = e.touches[0].screenY,
        offsetY, overY;

    if (typeof coords.canDragDown === 'undefined') {
      coords.canDragDown = options.disableDragDown !== true && startY < stopY && startScrollY <= 0;
    }
    if (typeof coords.canDragUp === 'undefined') {
      coords.canDragUp = options.disableDragUp !== true && startY > stopY && startScrollY + innerHeight >= ctHeight;
    }

    if (coords.canDragDown && coords.dragUp !== true && (coords.dragDown || startY - stopY + startScrollY < 0)) {
      e.preventDefault();
      coords.dragDown = true;
      if (!header) {
        header = this._createDragDownRegion();
      }
      if (typeof blockY === 'undefined') {
        coords.blockY = blockY = stopY;
      }
      offsetY = stopY - blockY;
      offsetY = offsetY > 0 ? offsetY : 0;
      overY = offsetY - options.dragDownThreshold;
      if (overY > 100) {
        offsetY = options.dragDownThreshold + 75 + (overY - 100) * 0.25;
      } else if (overY > 50) {
        offsetY = options.dragDownThreshold + 50 + (overY - 50) * 0.5;
      }
      header.style.height = offsetY + 'px';
      coords.status = this._processStatus('down', offsetY, coords.status, true);
    } else if (coords.canDragUp && coords.dragDown !== true && (coords.dragUp || startY - stopY + startScrollY + innerHeight > ctHeight)) {
      e.preventDefault();
      coords.dragUp = true;
      if (!footer) {
          footer = this._createDragUpRegion();
      }
      if (typeof blockY === 'undefined') {
          coords.blockY = blockY = stopY;
      }
      offsetY = blockY - stopY;
      offsetY = offsetY > 0 ? offsetY : 0;
      overY = offsetY - options.dragUpThreshold;
      if (overY > 100) {
          offsetY = options.dragUpThreshold + 75 + (overY - 100) * 0.2;
      } else if (overY > 50) {
          offsetY = options.dragUpThreshold + 50 + (overY - 50) * 0.5;
      }
      ct.scrollTop = startScrollY + offsetY;
      footer.style.height = offsetY + 'px';
      coords.status = this._processStatus('up', offsetY, coords.status, true);
    } else {
      coords.blockY = stopY;
    }
  },

  _onTouchEnd: function(e) {
    this.ct.removeEventListener('touchmove', this, false);
    this.ct.removeEventListener('touchend', this, false);
    this._translate();
  },

  _translate: function() {
    var me = this,
        header = ReactDOM.findDOMNode(this.refs.header),
        footer = ReactDOM.findDOMNode(this.refs.footer),
        options = me.props,
        coords = me._touchCoords, orient,
        target, targetHeight,
        adjustHeight,
        maxDuration = 200, duration,
        upperStr, threshold,
        endFn = function() {
          coords.status = me._processStatus(orient, targetHeight, coords.status, false);
          if (!orient || coords.status !== me.ActionStatus.load) {
            me._removeDragDownRegion();
            me._removeDragUpRegion();
            me._touchCoords = null;
            me._draggable = true;
          } else if (orient == 'down') {
            me._removeDragUpRegion();
          } else if (orient == 'up') {
            me._removeDragDownRegion();
          }
        };

    if (!coords) return;

    orient = coords.dragDown ? 'down' : (coords.dragUp ? 'up' : null);
    if (orient) {
      target = orient == 'down' ? header : footer;
      targetHeight = target.offsetHeight;
      upperStr = orient.charAt(0).toUpperCase() + orient.substr(1);
      threshold = options['drag' + upperStr + 'Threshold'];
      adjustHeight = (!options.preventDragHelper && targetHeight > threshold) ? threshold : 0;
      duration = Math.ceil((targetHeight - adjustHeight) / threshold * maxDuration);
      duration = duration > maxDuration ? maxDuration : duration;
      transitionEnd(target, duration, endFn);
      target.style['webkitTransition'] = 'height ' + duration + 'ms';
      setTimeout(function() {
          target.style.height = adjustHeight + 'px';
      }, 0);
    } else {
      endFn();
    }
  },

  reset: function() {
    this._translate();
  },

  on: function(type, fn) {
    if (!this._events[type]) {
      this._events[type] = [];
    }
    this._events[type].push(fn);
  },

  off: function(type, fn) {
    if (this._events[type]) {
      this._events[type].every(function(cb, i) {
        if (cb === fn) {
          this._events[type].splice(i, 1);
          return false;
        }
      });
    }
  },

  _fireEvent: function(type, args) {
    var me = this, ret;
    if (me._events[type]) {
      me._events[type].forEach(function(fn) {
        ret = fn.apply(me, args || []);
      });
    }
    return ret;
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart':
        this._onTouchStrat(e);
        break;
      case 'touchmove':
        this._onTouchMove(e);
        break;
      case 'touchend':
        this._onTouchEnd(e);
        break;
    }
  },

  render: function(){
    return(
      <div ref="container" className="container">
        {this.state.downRegion ? <div ref="header" className={this.props.dragDownRegionCls}><div>{this.state.downRegionHtml}</div></div> : null}
          <div className="list">
            <ul>
              {
                this.props.component
              }
            </ul>
          </div>
        {this.state.upRegion ? <div ref="footer" className={this.props.dragUpRegionCls}><div>{this.state.upRegionHtml}</div></div>: null}
      </div>
    )
  }
});

module.exports = PullToRequest;
