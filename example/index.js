var React = require('react');
var ReactDOM = require('react-dom');
var PullToRequest = require('../src/index');

var Demo = React.createClass({
  onDragDownHelper: function(status) {
      if (status == 'default') {
          return '向下拉加载最新';
      } else if (status == 'prepare') {
          return '释放刷新';
      } else if (status == 'load') {
          return '加载中...';
      }
  },
  onDragUpHelper: function(status){
    if (status == 'default') {
        return '向上拉加载更多';
    } else if (status == 'prepare') {
        return '释放刷新';
    } else if (status == 'load') {
        return '加载中...';
    }
  },
  onDragUpLoad: function(dragger) {
      setTimeout(function() {
          dragger.reset();
          console.log("up");
      }, 2000);
  },
  onDragDownLoad: function(dragger) {
      setTimeout(function() {
          dragger.reset();
          console.log("down");
      }, 2000);
  },
  render: function() {
    return (
      <div>
        <PullToRequest
          dragUpHelper={this.onDragUpHelper}
          dragDownHelper={this.onDragDownHelper}
          dragUpLoad={this.onDragUpLoad}
          dragDownLoad={this.onDragDownLoad}
        />
      </div>
    )
  }
})

ReactDOM.render(<Demo />, document.getElementById('demo'))
