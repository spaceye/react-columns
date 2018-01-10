import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mediaQueryMapper, matchMediaQuery } from './mq';
import mapNodesToColumns from './mapNodesToColumns';

export default class Columns extends Component {
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
