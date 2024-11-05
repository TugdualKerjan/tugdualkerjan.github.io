document.addEventListener("DOMContentLoaded", () => {
    // Constants for padding and arrowhead size
    const COMPONENT_PADDING = 10; // Padding for text positioning
    const ARROWHEAD_SIZE = 10; // Size of the arrowhead
    const SVG_CENTER_X = (window.innerWidth / 2);
    const SVG_CENTER_Y = (window.innerHeight / 2);

    // Sample data for the components with input/output dimensions
    const components = [
        { id: 1, x: 100, y: 100, width: 150, height: 80, name: 'Text input', inputDim: 'N/A', outputDim: '256' },
        { id: 2, x: 400, y: 100, width: 200, height: 100, name: 'GPT2', inputDim: '256', outputDim: '128' },
        { id: 3, x: 700, y: 100, width: 180, height: 80, name: 'HiFiGAN', inputDim: '128', outputDim: '64' },
        { id: 4, x: 100, y: 400, width: 150, height: 80, name: 'Speaker samples', inputDim: 'N/A', outputDim: '256' },
    ];

    // Create the SVG canvas
    const svg = d3.select('#svg')
        .call(d3.zoom().on('zoom', (event) => {
            svg.attr('transform', event.transform);
        }))
        .append('g') // Group for scaling
        .attr('transform', `translate(${SVG_CENTER_X - 425}, ${SVG_CENTER_Y - 250})`); // Centering the network

    // Initialize Rough.js
    const rc = rough.svg(svg.node());

    // Draw components
    components.forEach(d => {
        // Draw a rectangle for the component
        const rect = rc.rectangle(d.x, d.y, d.width, d.height, {
            roughness: 1,
            fill: 'beige',
            stroke: 'black',
            fillStyle: 'solid'
        });

        svg.node().appendChild(rect);

        // Draw the component name
        svg.append('text')
            .attr('x', d.x + d.width / 2) // Centering the text in the rectangle
            .attr('y', d.y + d.height / 2 - COMPONENT_PADDING) // Centering vertically
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'component-text')
            .text(d.name);

        // Draw input/output dimension labels
        svg.append('text')
            .attr('x', d.x + d.width / 2) // Centering the dimension text
            .attr('y', d.y + d.height / 2 + COMPONENT_PADDING * 2) // Below the component name
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'dimension-text')
            .text(`${d.inputDim} -> ${d.outputDim}`);
    });

    // Draw curved lines with Rough.js
    const curveData = [
        { source: components[3], target: components[1], label: 'Sample input' },
        { source: components[0], target: components[1], label: 'Text input' },
        { source: components[1], target: components[2], label: 'Intermediate' },
    ];

    curveData.forEach(({ source, target, label }) => {
        const pathData = `M${source.x + source.width},${source.y + source.height / 2} C${source.x + 200},${source.y + source.height / 2 + 20} ${target.x - 100},${target.y + target.height / 2 + 20} ${target.x},${target.y + target.height / 2}`;
        
        // Draw the curve using Rough.js
        const curve = rc.path(pathData, {
            roughness: 1,
            stroke: 'black',
            strokeWidth: 1,
            fill: 'none'
        });

        svg.node().appendChild(curve);

        // Draw arrowhead
        const angle = Math.atan2(target.y + target.height / 2 - (source.y + source.height / 2), target.x - (source.x + source.width));
        const arrowheadPath = `
            M${target.x},${target.y + target.height / 2}
            L${target.x - ARROWHEAD_SIZE * Math.cos(angle - Math.PI / 6)},${target.y + target.height / 2 - ARROWHEAD_SIZE * Math.sin(angle - Math.PI / 6)}
            L${target.x - ARROWHEAD_SIZE * Math.cos(angle + Math.PI / 6)},${target.y + target.height / 2 - ARROWHEAD_SIZE * Math.sin(angle + Math.PI / 6)}
            Z
        `;
        const arrowhead = rc.path(arrowheadPath, {
            roughness: 1,
            stroke: 'black',
            fill: 'black'
        });

        svg.node().appendChild(arrowhead);

        // Add label on the arrow
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        svg.append('text')
            .attr('x', midX)
            .attr('y', midY - 10) // Position above the arrow
            .attr('class', 'arrow-label')
            .attr('text-anchor', 'middle')
            .text(label);
    });

    // Handle click on the SVG container to zoom out
    svg.on('click', () => {
        svg.transition()
            .duration(750)
            .call(d3.zoom().transform, d3.zoomIdentity); // Reset zoom
    });
});