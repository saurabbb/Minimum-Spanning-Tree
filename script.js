// Wait for the DOM content to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {

    // Get the button element with id 'createGraph'
    const createGraphButton = document.getElementById('createGraph');

    // Add an event listener to the button to trigger the 'createGraph' function when clicked
    createGraphButton.addEventListener('click', createGraph);

    // Function to create the graph
    function createGraph() {

        // Prompt the user for the number of vertices
        const numVertices = prompt("Enter the number of vertices:");

        // Validate the input for the number of vertices
        if (!numVertices || isNaN(numVertices) || numVertices <= 0) {
            alert("Please enter a valid number of vertices.");
            return;
        }

        // Get the canvas element for the main graph
        const graphCanvas = document.getElementById('graphCanvas');
        const graphCtx = graphCanvas.getContext('2d');

        // Clear the canvas
        graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

        // Get the canvas element for the MST (Minimum Spanning Tree)
        const mstCanvas = document.getElementById('mstCanvas');
        const mstCtx = mstCanvas.getContext('2d');

        // Clear the MST canvas
        mstCtx.clearRect(0, 0, mstCanvas.width, mstCanvas.height);

        // Generate random positions for the vertices
        const positions = generateRandomPositions(numVertices, graphCanvas.width, graphCanvas.height);

        // Draw vertices on the main graph
        for (let i = 0; i < numVertices; i++) {
            drawVertex(graphCtx, positions[i], `Vertex ${i + 1}`);
        }

        // Create a random adjacency matrix for the graph
        const adjacencyMatrix = createRandomGraph(numVertices);

        // Prompt user for edge distances and update the adjacency matrix
        for (let i = 0; i < numVertices; i++) {
            for (let j = i + 1; j < numVertices; j++) {
                const distance = parseFloat(prompt(`Distance between Vertex ${i + 1} and Vertex ${j + 1}:`));
                if (isNaN(distance) || distance < 0) {
                    alert("Please enter a valid positive distance.");
                    return;
                }

                if (distance > 0) {
                    adjacencyMatrix[i][j] = distance;
                    adjacencyMatrix[j][i] = distance;
                    drawEdge(graphCtx, positions[i], positions[j]);
                    labelEdge(graphCtx, positions[i], positions[j], distance);
                }
            }
        }

        // Find the Minimum Spanning Tree using Prim's algorithm
        const minimumSpanningTree = prim(adjacencyMatrix);

        // Draw vertices on the MST canvas
        for (let i = 0; i < numVertices; i++) {
            drawVertex(mstCtx, positions[i], `Vertex ${i + 1}`);
        }

        // Highlight the MST edges in green on the MST canvas
        for (const edge of minimumSpanningTree) {
            const [vertex1, vertex2] = edge;
            const start = positions[vertex1];
            const end = positions[vertex2];
            drawEdge(mstCtx, start, end, '#00FF00'); // Highlight in green
        }

        // Display the minimum weight of the spanning tree
        const minimumWeightDiv = document.getElementById('minimumWeight');
        const minimumWeight = calculateMSTWeight(minimumSpanningTree, adjacencyMatrix);
        minimumWeightDiv.textContent = `Minimum Weight of spanning tree= ${minimumWeight.toFixed(2)}`;
    }

    // Function to generate random positions for vertices
    function generateRandomPositions(numVertices, maxWidth, maxHeight) {
        const positions = [];
        for (let i = 0; i < numVertices; i++) {
            positions.push({
                x: Math.random() * maxWidth,
                y: Math.random() * maxHeight
                // it makes a random x and y position within the given width and height limits.
            });
        }
        return positions;
    }

    // Function to draw a vertex on the canvas
    function drawVertex(ctx, position, label) {
        ctx.beginPath(); //This starts a new path, or a sequence of lines or curves. It's like lifting a pen off the paper to start drawing a new shape.
        ctx.arc(position.x, position.y, 15, 0, Math.PI * 2); // This is a method to draw a circle.
        ctx.fillStyle = '#000';
        ctx.fill();

        ctx.fillStyle = '#808080';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, position.x, position.y + 20);
        // this function draws a circle to represent a vertex, fills it with a black color,
        // and then writes a label  near the vertex in white color. It's like drawing a dot on a piece of paper and writing a label next to it.
    }

    // Function to draw an edge between two vertices
    function drawEdge(ctx, start, end, color = '#000') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);//This moves the "pen" to the starting point of the edge. It's like placing the pen on a specific spot on the paper to start drawing.
        ctx.lineTo(end.x, end.y);//This draws a line from the current position (the starting point set by moveTo) to the ending point of the edge.
        ctx.strokeStyle = color;
        ctx.stroke();//This actually draws the line on the canvas. It's like pressing the pen down onto the paper to leave a mark.
    }

    // Function to label an edge with a distance
    function labelEdge(ctx, start, end, distance) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(distance.toFixed(2), midX, midY);

        //this function calculates the midpoint of an edge, prepares to write text in black, chooses a specific font and alignment, and then writes the distance label at the midpoint of the edge. It's like writing a number in the middle of a line on a piece of paper.
    }

    // Function to create a random adjacency matrix for the graph
    function createRandomGraph(numVertices) {
        const adjacencyMatrix = [];
        for (let i = 0; i < numVertices; i++) {
            adjacencyMatrix[i] = [];
            for (let j = 0; j < numVertices; j++) {
                if (i === j) {
                    adjacencyMatrix[i][j] = 0; 
                } else {
                    adjacencyMatrix[i][j] = Infinity; 
                }
            }
        }
        return adjacencyMatrix;
        //this function creates a matrix that represents a graph. It initializes all connections to be "infinity" except for the connections from a vertex to itself, which are set to 0. This matrix is used to represent the distances (or weights) between different vertices in the graph.
    }

    // Function to find the Minimum Spanning Tree using Prim's algorithm
    function prim(graph) {
        const numVertices = graph.length;// This calculates the number of vertices in the graph. It takes the length of the graph array, which is essentially the number of rows in the adjacency matrix.
        const parent = new Array(numVertices).fill(-1);//Initially, no one has a designated "parent" leading them, so everyone's parent is set as -1.
        const key = new Array(numVertices).fill(Infinity);//At the start, we consider the distance of each student from the destination to be infinite, since we haven't started the trip yet.
        const mstSet = new Array(numVertices).fill(false);//Initially, no student is part of the group going on the field trip, so everyone is marked as "not included" (false).

        key[0] = 0;//It sets the first vertex as the starting point.


        for (let count = 0; count < numVertices - 1; count++) {
            const u = minKey(key, mstSet);//We're choosing one student (u) who is closest to the destination and hasn't been on the trip yet.
            mstSet[u] = true;//We're saying, "This student (u) is now on the trip!"

            for (let v = 0; v < numVertices; v++) {
                //Now, we're looking at every student (v) to see if they should be on the trip next.
                if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v])
                //For each student (v), we're checking if they're connected to the student already on the trip (u). If they are, and v isn't already on the trip, and going through u to v is a shorter route than what we knew before
                 {
                    parent[v] = u;
                    key[v] = graph[u][v];
                }
                // this part of the code is like organizing a field trip. We start with one student (u) and keep adding the closest students until everyone has gone. We make sure to choose the closest students and update their trip leaders if we find a faster route. This way, we end up with the best possible field trip plan!
            }
        }

        const minimumSpanningTree = [];//This line creates an empty array called minimumSpanningTree which will hold the edges that form the Minimum Spanning Tree.
        for (let i = 1; i < numVertices; i++)
        //We're going through each student (except the first one) to find their best route. 
        {
            minimumSpanningTree.push([parent[i], i]);//For each student, we note down who is leading them on the trip (parent[i]) and who they are (i). This forms a pair, like saying, "Student A follows Student B."
        }

        return minimumSpanningTree;
    }

    // Function to find the vertex with the minimum key value
    function minKey(key, mstSet) {
        let min = Infinity;//We're getting ready to find the closest student. Right now, we're assuming the closest student is infinitely far away, so min is set to a very large number. And we don't know who that student is yet, so minIndex is -1.
        let minIndex = -1;

        for (let v = 0; v < key.length; v++)
        //Now, we're going to look at each student one by one.
         {
            if (!mstSet[v] && key[v] < min)
            //For each student, we're checking if they're not already on the trip (!mstSet[v]) and if the way to reach them is shorter than our current best way (key[v] < min). 
            {
                min = key[v];//If both those things are true, we're saying, "Okay, this student is our new closest student, and their way is the new best way."
                minIndex = v;
            }
        }

        return minIndex;
    }

    // Function to calculate the total weight of the Minimum Spanning Tree
    function calculateMSTWeight(minimumSpanningTree, adjacencyMatrix) {
        let weight = 0;
        for (const edge of minimumSpanningTree)
        //Now, we're going to look at each connection in the Minimum Spanning Tree, one by one. 
        {
            const [vertex1, vertex2] = edge;//For each connection, we're figuring out which two students are connected. We'll call them Student A (vertex1) and Student B (vertex2).
            weight += adjacencyMatrix[vertex1][vertex2];
        }
        return weight;
    }
});
