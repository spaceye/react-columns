import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Columns from './index';

export default class DynamicColumns extends Component {
  static displayName = 'DynamicColumns';

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    itemProps: PropTypes.object,
    itemComponent: PropTypes.func,
    className: PropTypes.string,
    gap: PropTypes.string
  };

  static defaultProps = {
    className: 'dynamic-columns',
    gap: '10px'
  };

  constructor(...args) {
    super(...args);

    this.state = {
      itemsDimensions: {}
    };

    this.onColumnsChange = this.onColumnsChange.bind(this);
    this.setRef = this.setRef.bind(this);
    this.unsetRef = this.unsetRef.bind(this);
  }

  componentDidMount() {
    this.setItems();
  }

  componentWillUpdate(newProps, newState) {
    this.itemsChanged = newProps.items.length !== this.props.items.length;
    this.columnsChanged = newState.columns !== this.state.columns;
  }

  componentDidUpdate() {
    if (this.itemsChanged || this.columnsChanged) {
      this.setItems();
    }
  }

  onColumnsChange(columns) {
    this.setState({
      columns,
      itemsDimensions: {}
    });
  }

  getDimensions() {
    const { itemsDimensions } = this.state;
    const { items = [] } = this.props;

    return items.map(({ id, w, h }) => {
      const item = itemsDimensions[id];
      const width = item ? item.width : w;
      const height = item ? item.height : h;

      return {
        width,
        height
      };
    });
  }

  getIsItemInvisible(id) {
    const { columns, itemsDimensions } = this.state;

    if (columns === 1) {
      return false;
    }

    return itemsDimensions[id] === undefined;
  }

  setRef(id, ref) {
    if (this.items === null) {
      this.items = {};
    }

    this.items[id] = ref;
  }

  setItems() {
    const { items = [] } = this.props;
    const itemsDimensions = !this.columnsChanged && this.itemsChanged ? { ...this.state.itemsDimensions } : {};

    items.forEach((item) => {
      const { id } = item;
      const ref = this.items && this.items[id];

      if (!itemsDimensions[id] && ref) {
        const { width, height } = ref.getBoundingClientRect();
        itemsDimensions[id] = { width, height };
      }
    });

    this.setState({
      itemsDimensions
    });
  }

  unsetRef(id) {
    if (this.items) {
      delete this.items[id];
    }
  }

  itemsChanged = false;

  columnsChanged = true;

  items = null;

  renderItems() {
    const { items = [], itemProps = {}, itemComponent } = this.props;
    const IC = itemComponent;

    return items.map((item) => {
      const id = item.id;

      itemProps.style = {
        visibility: this.getIsItemInvisible(id) ? 'hidden' : null
      };

      return (
        <IC
          key={id}
          setRef={this.setRef}
          unsetRef={this.unsetRef}
          {...item}
          {...itemProps}
        />
      );
    });
  }

  render() {
    const { queries, gap, className } = this.props;
    const { columns } = this.state;

    return (
      <Columns
        className={className}
        queries={queries}
        columns={columns}
        onColumnsChange={this.onColumnsChange}
        gap={gap}
        dimensions={this.getDimensions()}>
        {this.renderItems()}
      </Columns>
    );
  }
}
