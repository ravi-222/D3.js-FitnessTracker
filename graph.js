const margin = {top: 40, right: 20, bottom: 50, left: 100}
const graphWidth = 560 - margin.left - margin.right
const graphHeight = 400 - margin.top - margin.bottom

const svg =d3.select('.canvas')
    .append('svg')
    .attr('height', graphHeight + margin.top + margin.bottom)
    .attr('width', graphWidth + margin.left + margin.right)

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

//scales
const x = d3.scaleTime().range([0, graphWidth])
const y = d3.scaleLinear().range([graphHeight, 0])

//Axis
const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${graphHeight})`)

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis')

//line
const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.distance))

//line path
const path = graph.append('path')

const dottedLines = graph.append('g')
    .attr('class', 'lines')
    .style('opacity', 0)

const xDotted = dottedLines.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4)

const yDotted = dottedLines.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4)

const update = (data)=>{

    data = data.filter(d => d.activity == activity)

    data.sort((a,b) => new Date(a.data) - new Date(b.data))

    //domains
    x.domain(d3.extent(data, d => new Date(d.date)))
    y.domain([0, d3.max(data, d => d.distance)])

    //path update
    path.data([data])
        .attr('d', line)
        .attr('stroke', '#00bfa5')
        .attr('stroke-width', 2)
        .attr('fill', 'none')

    //axis
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'))
    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm')

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')

    //circles for data
    const circles = graph.selectAll('circle')
        .data(data)

    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))
    

    circles.enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))
        .attr('fill', '#ccc')

    circles.exit().remove()

    graph.selectAll('circle')
        .on('mouseover', (d,i,n) => {
            d3.select(n[i])
                .transition().duration(100)
                .attr('r', 8)
                .attr('fill', '#fff')
            
            xDotted
                .attr('x1', x(new Date(d.date)))
                .attr('x2', x(new Date(d.date)))
                .attr('y1', graphHeight)
                .attr('y2', y(d.distance))
            yDotted
                .attr('x1', 0)
                .attr('x2', x(new Date(d.date)))
                .attr('y1', y(d.distance))
                .attr('y2', y(d.distance))
            
            dottedLines.style('opacity', 1)
        })
        .on('mouseleave', (d,i,n) => {
            d3.select(n[i])
                .transition().duration(100)
                .attr('r', 4)
                .attr('fill', '#ccc')
            dottedLines.style('opacity', 0)
        })

} 

var data = []
db.collection('activities').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id}

        switch (change.type) {
            case 'added':
                data.push(doc)
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id)
                data[index] = doc
                break;
            case 'removed':
                data.filter(item => item.id !== doc.id)
                break;
            default:
                break;
        }
    });

    update(data)
})

