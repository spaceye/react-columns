export default function mapNodesToColumns({ children = [], columns = 1, dimensions = [] } = {}) {
  const nodes = [];
  const heights = [];

  if (columns === 1) {
    return children;
  }
  // use dimensions to calculate the best column for each child
  if (dimensions.length && dimensions.length === children.length) {
    for (let i = 0; i < columns; i++) {
      nodes[i] = [];
      heights[i] = 0;
    }

    children.forEach((child, i) => {
      const { width, height } = dimensions[i];
      const index = heights.indexOf(Math.min(...heights));
      nodes[index].push(child);
      heights[index] += height / width;
    });
  }
  // equally spread the children across the columns
  else {
    for (let i = 0; i < columns; i++) {
      nodes[i] = children.filter((child, j) => j % columns === i);
    }
  }

  return nodes;
}
