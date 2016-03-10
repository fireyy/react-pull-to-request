var React = require('react');
var ReactDOM = require('react-dom');
var PullToRequest = require('../src/index');

var DemoData = [
  '测试数据','测试数据','测试数据','测试数据','测试数据','测试数据',
  '测试数据','测试数据','测试数据','测试数据','测试数据','测试数据',
  '测试数据','测试数据','测试数据','测试数据','测试数据','测试数据',
  '测试数据','测试数据','测试数据','测试数据','测试数据','测试数据'
];

var Demo = React.createClass({
  getInitialState: function() {
    return {
      list: []
    };
  },
  componentDidMount: function() {
    this.setState({
      list: DemoData
    });
  },
  getData: function(fn) {
    setTimeout(function() {
      var arr = this.state.list.concat(DemoData);
      this.setState({
        list: arr
      });
      fn && fn();
    }.bind(this), 2000);
  },
  onDragUpLoad: function(dragger) {
    console.log("up");
    this.getData(function(){
      dragger.reset();
    });
  },
  onDragDownLoad: function(dragger) {
    console.log("down");
    this.getData(function(){
      dragger.reset();
    });
  },
  render: function() {
    var list = this.state.list.map(function(item, i){
      return <li key={'li'+i}>{item}</li>
    });
    return (
      <div>
        <PullToRequest
          component={list}
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
