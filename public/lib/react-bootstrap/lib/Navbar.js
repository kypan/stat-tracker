var React = require('react');

var BootstrapMixin = require('./BootstrapMixin');
var classSet = require('classnames');
var cloneElement = React.cloneElement;

var ValidComponentChildren = require('./utils/ValidComponentChildren');
var createChainedFunction = require('./utils/createChainedFunction');
var Nav = require('./Nav');


var Navbar = React.createClass({displayName: "Navbar",
  mixins: [BootstrapMixin],

  propTypes: {
    fixedTop: React.PropTypes.bool,
    fixedBottom: React.PropTypes.bool,
    staticTop: React.PropTypes.bool,
    inverse: React.PropTypes.bool,
    fluid: React.PropTypes.bool,
    role: React.PropTypes.string,
    componentClass: React.PropTypes.node.isRequired,
    brand: React.PropTypes.node,
    toggleButton: React.PropTypes.node,
    toggleNavKey: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    onToggle: React.PropTypes.func,
    navExpanded: React.PropTypes.bool,
    defaultNavExpanded: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      bsClass: 'navbar',
      bsStyle: 'default',
      role: 'navigation',
      componentClass: 'Nav'
    };
  },

  getInitialState: function () {
    return {
      navExpanded: this.props.defaultNavExpanded
    };
  },

  shouldComponentUpdate: function() {
    // Defer any updates to this component during the `onSelect` handler.
    return !this._isChanging;
  },

  handleToggle: function () {
    if (this.props.onToggle) {
      this._isChanging = true;
      this.props.onToggle();
      this._isChanging = false;
    }

    this.setState({
      navExpanded: !this.state.navExpanded
    });
  },

  isNavExpanded: function () {
    return this.props.navExpanded != null ? this.props.navExpanded : this.state.navExpanded;
  },

  render: function () {
    var classes = this.getBsClassSet();
    var ComponentClass = this.props.componentClass;

    classes['navbar-fixed-top'] = this.props.fixedTop;
    classes['navbar-fixed-bottom'] = this.props.fixedBottom;
    classes['navbar-static-top'] = this.props.staticTop;
    classes['navbar-inverse'] = this.props.inverse;

    return (
      React.createElement(ComponentClass, React.__spread({},  this.props, {className: classSet(this.props.className, classes)}), 
        React.createElement("div", {className: this.props.fluid ? 'container-fluid' : 'container'}, 
          (this.props.brand || this.props.toggleButton || this.props.toggleNavKey != null) ? this.renderHeader() : null, 
          ValidComponentChildren.map(this.props.children, this.renderChild)
        )
      )
    );
  },

  renderChild: function (child, index) {
    return cloneElement(child, {
      navbar: true,
      collapsable: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey,
      expanded: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey && this.isNavExpanded(),
      key: child.key ? child.key : index,
    });
  },

  renderHeader: function () {
    var brand;

    if (this.props.brand) {
      brand = this.props.brand;

      brand = React.isValidElement(brand) ?
        cloneElement(brand, {
          className: classSet(brand.props.className,'navbar-brand')
        }) 
        : React.createElement("span", {className: "navbar-brand"}, brand);
    }

    return (
      React.createElement("div", {className: "navbar-header"}, 
        brand, 
        (this.props.toggleButton || this.props.toggleNavKey != null) ? this.renderToggleButton() : null
      )
    );
  },

  renderToggleButton: function () {
    var children;

    if (React.isValidElement(this.props.toggleButton)) {

      return cloneElement(this.props.toggleButton, {
        
        className: classSet(this.props.toggleButton.props.className,'navbar-toggle'),

        onClick: createChainedFunction(this.handleToggle, this.props.toggleButton.props.onClick)
      });
    }

    children = (this.props.toggleButton != null) ?
      this.props.toggleButton : [
        React.createElement("span", {className: "sr-only", key: 0}, "Toggle navigation"),
        React.createElement("span", {className: "icon-bar", key: 1}),
        React.createElement("span", {className: "icon-bar", key: 2}),
        React.createElement("span", {className: "icon-bar", key: 3})
    ];

    return (
      React.createElement("button", {className: "navbar-toggle", type: "button", onClick: this.handleToggle}, 
        children
      )
    );
  }
});

module.exports = Navbar;
