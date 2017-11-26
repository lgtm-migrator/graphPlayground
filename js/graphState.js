define(["jquery", "graphAlgorithms", "graphHelpers", "genericHelpers"],
	($, gAlgo, gHelp, help) =>{
		let self = {
			upToDate: [
				{name: "Chromatic Number", upToDate: false, type: "property"},
				{name: "graphColoring", upToDate: false, type: "state"},
				{name: "vertices", upToDate: true, always: true, type: "property"},
				{name: "edges", upToDate: true, always: true, type: "property"},
				{name: "eulerian", upToDate: true, always: true, type: "property"}
			],
			state: {
				graph: new jsgraphs.Graph(), nodes: [], edges: [], adjacency: [], degrees: [],
			},
			graphProperties: {
				vertices: 0,
				edges: 0,
				eulerian: false,
				"Chromatic Number": null
			},
			setUpToDate: function (value = false, listOptions){
				let all = listOptions === null || typeof listOptions === "undefined";
				self.upToDate.forEach((v) =>{
					if((!("always" in v) || !v.always) && (all || listOptions.indexOf(v.name) > -1)){
						v.upToDate = value;
					}
				});
			},
			getProperty: function (property){
				let a = self.upToDate.find((v) =>{
					return ("name" in v && v.name === property);
				});

				if(!a.upToDate){
					return null;
				}
				if(a.type === "state"){
					return self.state[property];
				}
				return self.graphProperties[property];
			},

			makeAndPrintProperties: function (recalcLong = false){
				let gs = self.state;

				let d = self.getGraphData();
				gs.nodes = d.nodes;
				gs.edges = d.edges;
				self.graphProperties.vertices = gs.nodes.length;
				self.graphProperties.edges = gs.edges.length;

				gs.adjacency = gs.graph.adjList;
				gs.degrees = gHelp.findVertexDegrees(gs.adjacency);
				self.graphProperties.eulerian = gAlgo.hasEulerianCircuit(gs.degrees);

				let p = Object.keys(self.graphProperties);
				if(recalcLong){
					p.forEach((v) =>{
						if(self.getProperty(v) === null){
							if(v === "Chromatic Number"){
								main.makeAndPrintGraphColoring();
							}
						}
					});
					// TODO: Hamiltonicity, diameter, girth,...
					// TODO: https://en.wikipedia.org/wiki/Graph_property#Integer_invariants
				}

				let printableProperties = {};
				p.forEach((v) =>{
					printableProperties[v] = self.getProperty(v);
				});
				self.printGraphProperties(printableProperties);
			},

			printGraphProperties: function (properties){
				let p = "";
				for(let k in properties){
					if(properties[k] !== null){
						p += help.toTitleCase(k) + ": " + properties[k] + "\n";
					}
				}
				p = p.trim();
				p = help.htmlEncode(p);
				$("#graphProps").html("<p class='nav-link'>" + p + "</p>");
			},

			addEdge: function (from, to){
				let d = self.getGraphData();
				d.edges.push({from: from, to: to, weight: 0});
				d.nodes = self.clearColorFromNodes(d.nodes);
				main.setData({nodes: d.nodes, edges: d.edges});
			},

			addNode: function (data){
				let d = self.getGraphData();
				d.nodes.push({id: d.nodes.length, label: data.label, x: data.x, y: data.y});
				main.setData({nodes: d.nodes, edges: d.edges});
			},

			editNode: function (id, label){
				self.state.graph.node(id).label = label;
				let d = self.getGraphData();
				main.setData({nodes: d.nodes, edges: d.edges}, false, false);
			},

			deleteEdge: function (from, to){
				let d = self.getGraphData();
				let newEdges = [];
				d.edges.forEach((v) =>{
					if(v.from !== from && v.to !== to){
						newEdges.push(v);
					}
				});
				main.setData({nodes: d.nodes, edges: newEdges});
			},

			deleteNode: function (id){
				let d = self.getGraphData();

				let newNodes = [];
				let nodes = d.nodes;
				nodes.forEach((v) =>{
					if(v.id !== id){
						newNodes.push(v);
					}
				});
				let newEdges = [];
				let edges = d.edges;
				edges.forEach((v) =>{
					if(v.from !== id && v.to !== id){
						newEdges.push(v);
					}
				});
				main.setData({nodes: newNodes, edges: newEdges});
			},

			clearColorFromNodes: function (nodes){
				nodes.forEach((v) =>{
					v.color = null;
				});
				return nodes;
			},

			getGraphData: function (graph){
				if(graph === null || typeof graph === "undefined"){
					graph = self.state.graph;
				}
				let nodes = [];
				let edges = [];

				let i = 0;
				graph.nodeInfo.forEach((v) =>{
					let n = {id: i++, label: v.label, x: v.x, y: v.y, color: v.color};
					nodes.push(n);
				});

				Object.keys(graph.edges).forEach((k) =>{
					let v = graph.edges[k];
					edges.push({from: v.from(), to: v.to(), weight: v.weight});
				});
				return {nodes: nodes, edges: edges};
			},

			getGraphAsDataSet: function (graph){
				let d = self.getGraphData(graph);
				return {nodes: new vis.DataSet(d.nodes), edges: new vis.DataSet(d.edges)};
			},

			dataSetToGraph: function (nodes, edges, oldNodes){
				let d = self.alignData(0, nodes, edges);
				nodes = d.nodes;
				edges = d.edges;

				let g = new jsgraphs.Graph(nodes.length);
				if(settings.getOption("direction") && settings.getOption("weights")){
					g = new jsgraphs.WeightedDiGraph(nodes.length);
				}
				else if(settings.getOption("direction") && !settings.getOption("weights")){
					g = new jsgraphs.DiGraph(nodes.length);
				}
				else if(!settings.getOption("direction") && settings.getOption("weights")){
					g = new jsgraphs.WeightedGraph(nodes.length);
				}

				edges.forEach((v) =>{
					if(settings.getOption("weights")){
						g.addEdge(new jsgraphs.Edge(v.from, v.to, v.weight));
					}
					else{
						g.addEdge(v.from, v.to);
					}
				});

				nodes.forEach((v) =>{
					let n = g.node(v.id);
					n.label = v.label;
					if(oldNodes !== null && typeof oldNodes !== "undefined" && v.id in oldNodes){
						n.x = oldNodes[v.id].x;
						n.y = oldNodes[v.id].y;
					}
					else{
						n.x = v.x;
						n.y = v.y;
					}
					n.color = v.color;
				});

				return g;
			},

			alignData: function (start, nodes, edges){
				let nodeMap = {};
				let nodeCount = start;
				let newNodes = [];
				nodes.forEach((v) =>{
					if(v.label === v.id.toString()){
						v.label = nodeCount.toString();
					}
					let thisNode = {id: nodeCount, label: v.label, color: v.color, x: v.x, y: v.y};
					newNodes.push(thisNode);
					nodeMap[v.id] = nodeCount++;
				});

				let newEdges = [];
				edges.forEach((v) =>{
					let thisEdge = {from: nodeMap[v.from], to: nodeMap[v.to], label: v.label, weight: v.weight};
					newEdges.push(thisEdge);
				});

				return {nodes: newNodes, edges: newEdges};
			},
		};

		return self;
	});
