// @ts-check
class MST {
  /**
   * @param data where our graph is stored
   */
  constructor(data) {
    /**
     * @type {DataNode[]}
     */
    this.data = data;
  }

  /**
   * @returns {{nodes: DataNode[], links: {weight: number, source: number, target: number}[]}}
   */
  calculate() {
    const graph = this.makeGraph(this.data);
    const vertices = graph.nodes,
      edges = graph.links.slice(0),
      selectedEdges = [],
      edgeGroups = new DisjointSet();

    // Each vertex begins disconnected from all the others
    vertices.forEach((vertex) => {
      edgeGroups.makeSet(vertex.id);
    });

    // Sort edges in descending order of weight
    edges.sort((a, b) => {
      return -(a.weight - b.weight);
    });

    while (edges.length && edgeGroups.size() > 1) {
      const edge = edges.pop(); // Start with "cheapest" edge

      if (edgeGroups.findRoot(edge.source) !== edgeGroups.findRoot(edge.target)) {
        edgeGroups.union(edge.source, edge.target);
        selectedEdges.push(edge);
      }
    }

    vertices.forEach((v) => (v.links = selectedEdges.filter((l) => l.source === v.id || l.target === v.id)));

    return {
      nodes: vertices,
      links: selectedEdges,
    };
  }

  /**
   * Connect all original nodes to get a fully connected graph
   * @param {DataNode[]} nodeList
   * @returns {{nodes: DataNode[], links: {weight: number, source: number, target: number}[]}}
   */
  makeGraph(nodeList) {
    // @ts-ignore
    return {
      nodes: nodeList,
      links: nodeList.flatMap((source) =>
        nodeList.filter((target) => target !== source).map((target) => ({ weight: this.distance(source, target), source: source.id, target: target.id }))
      ),
    };
  }

  /**
   * Compute Euclidean distance between points
   * @param {DataNode} source
   * @param {DataNode} target
   * @returns {number}
   */
  distance(source, target) {
    const a = source.xCoord - target.xCoord;
    const b = source.yCoord - target.yCoord;
    return Math.sqrt(a ** 2 + b ** 2);
  }
}

class GraphNode {
  constructor(id) {
    this.id = id;
    this.parent = this;
    this.rank = 0;
    this.degree = 0;
  }
}

class DisjointSet {
  constructor() {
    this.index = new Map();
  }

  makeSet(id) {
    this.index.set(id, new GraphNode(id));
  }

  /**
   * Return root node of branch
   * @param {number} nodeId
   * @returns id
   */
  findRoot(nodeId) {
    if (!this.index.has(nodeId)) {
      return undefined;
    }

    let current = this.index.get(nodeId).parent;
    while (current !== current.parent) {
      current = current.parent;
    }
    return current.id;
  }

  /**
   * When connecting x and y, assign them to the corresponding set
   * @param {number} x
   * @param {number} y
   */
  union(x, y) {
    let xRoot = this.index.get(this.findRoot(x));
    let yRoot = this.index.get(this.findRoot(y));

    if (xRoot === undefined || yRoot === undefined || xRoot === yRoot) {
      // x and y already belong to the same set.
      return;
    }

    if (xRoot.rank < yRoot.rank) {
      // move x into the set of y
      xRoot.parent = yRoot;
    } else if (yRoot.rank < xRoot.rank) {
      // move y into the set of x
      yRoot.parent = xRoot;
    } else {
      // move y into the set x is a member of
      yRoot.parent = xRoot;
      xRoot.rank++;
    }
  }

  /**
   * Return the current number of disjoint sets
   * @returns {number}
   */
  size() {
    return Array.from(this.index.keys()).length;
  }
}
