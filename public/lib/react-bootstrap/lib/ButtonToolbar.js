var React = require('react');

var classSet = require('classnames');
var BootstrapMixin = require('./BootstrapMixin');
var Button = require('./Button');

var ButtonToolbar = React.createClass({displayName: "ButtonToolbar",
  mixins: [BootstrapMixin],

  getDefaultProps: function () {
    return {
      bsClass: 'button-toolbar'
    };
  },

  render: function () {
    var classes = this.getBsClassSet();

    return (
      React.createElement("div", React.__spread({}, 
        this.props, 
        {role: "toolbar", 
        className: classSet(this.props.className, classes)}), 
        this.props.children
      )
    );
  }
});

module.exports = ButtonToolbar;