import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mediaQueryMapper, matchMediaQuery } from './mq';
import mapNodesToColumns from './mapNodesToColumns';

class Columns extends Component {
  static displayName = 'Columns';

  static getColumnsNumber(queries) {
    return matchMediaQuery(queries, 'columns', 1);
  }

  constructor(props) {
    super(props);
    this.setColumns = this.setColumns.bind(this);
    this.state = {
      columns: Columns.getColumnsNumber(props.queries)
    };
  }

  componentDidMount() {
    this.updateColumns(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const queriesChanged = this.props.queries !== nextProps.queries;

    if (queriesChanged) {
      this.updateColumns(nextProps);
    }
  }

  componentWillUnmount() {
    this.removeColumnListeners();
  }

  setColumns() {
    const { columns, onColumnsChange } = this.props;
    const nextColumns = this._columns.getValue();

    if (nextColumns !== columns) {
      if (onColumnsChange) {
        onColumnsChange(nextColumns);
      } else {
        this.setState(() => ({
          columns: this._columns.getValue()
        }));
      }
    }
  }

  updateColumns(props) {
    if (props.queries.length) {
      this.removeColumnListeners();
      this._columns = mediaQueryMapper({
        queries: props.queries,
        valueKey: 'columns',
        defaultValue: props.queries.length ? 1 : props.columns,
        onChange: this.setColumns
      });
    }
  }

  removeColumnListeners() {
    if (this._columns) {
      this._columns.removeListeners();
    }
  }

  renderColumns(columns) {
    const { children, dimensions, gap } = this.props;
    const columnStyles = {
      boxSizing: 'border-box',
      float: 'left',
      width: `${1 / columns * 100}%`,
      paddingLeft: gap,
      paddingRight: gap
    };

    let renderedColumns = children;

    if (columns > 1) {
      const columnsContainers = mapNodesToColumns({ children, columns, dimensions });
      renderedColumns = columnsContainers.map((column, i) => (
        <div key={`column-${i}`} style={columnStyles}>{column}</div>
      ));
    }

    return renderedColumns;
  }

  render() {
    const { className, gap, rootStyles, columns: propsColumns } = this.props;
    const { columns: stateColumns } = this.state;
    const columns = propsColumns || stateColumns;
    const rowStyles = columns === 1 ? {} : {
      marginLeft: `calc(${gap} * -1)`,
      marginRight: `calc(${gap} * -1)`
    };

    return (
      <div className={className} style={rootStyles}>
        <div style={rowStyles}>
          {this.renderColumns(columns)}
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }
}

Columns.defaultProps = {
  className: '',
  rootStyles: {
    overflowX: 'hidden'
  },
  queries: [],
  gap: '0px'
};

Columns.propTypes = {
  className: PropTypes.string,
  rootStyles: PropTypes.object,
  onColumnsChange: PropTypes.func,
  queries: PropTypes.array,
  columns: PropTypes.number,
  gap: PropTypes.string
};


export class DynamicColumns extends Component {
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

export default Columns;
