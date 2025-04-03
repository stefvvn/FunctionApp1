import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";
import ExpenseData from "./ExpenseData";
import "./ExpenseTracker.css";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState(null);
  const svgRef = useRef();

  const handleFormSubmit = (expenseData) => {
    setExpenses(expenseData);
  };

  useEffect(() => {
    if (!expenses) return;

    const data = [
      {
        source: "Bills",
        target: "Total",
        value: parseFloat(expenses.bill || 0),
      },
      {
        source: "Rent",
        target: "Total",
        value: parseFloat(expenses.rent || 0),
      },
      {
        source: "Food",
        target: "Total",
        value: parseFloat(expenses.food || 0),
      },
      {
        source: "Fuel",
        target: "Total",
        value: parseFloat(expenses.fuel || 0),
      },
      {
        source: "Other",
        target: "Total",
        value: parseFloat(expenses.other || 0),
      },
    ];

    const width = 942;
    const height = 500;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const sankey = d3Sankey()
      .nodeWidth(20)
      .nodePadding(40)
      .size([width, height]);

    const nodes = Array.from(
      new Set(data.map((d) => d.source).concat(data.map((d) => d.target))),
    ).map((name) => ({ name }));

    const links = data.map((d) => ({
      source: nodes.findIndex((n) => n.name === d.source),
      target: nodes.findIndex((n) => n.name === d.target),
      value: d.value,
    }));

    const graph = sankey({ nodes, links });

    const color = d3
      .scaleOrdinal()
      .domain(nodes.map((d) => d.name))
      .range([
        "#ffcc00",
        "#ff6666",
        "#66cc66",
        "#66b3ff",
        "#ff3399",
        "#cccccc",
      ]);

    const linkColor = d3
      .scaleOrdinal()
      .domain(nodes.map((d) => d.name))
      .range([
        "#ffcc00",
        "#ff6666",
        "#66cc66",
        "#66b3ff",
        "#ff3399",
        "#cccccc",
      ]);

    svg
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke-width", (d) => Math.max(1, d.width))
      .style("fill", "none")
      .style("stroke", (d) => linkColor(d.source.name))
      .style("stroke-opacity", 0.5);

    const node = svg
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    node
      .append("rect")
      .attr("class", "node")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .style("fill", (d) => color(d.name))
      .style("stroke", "#000");

    node
      .filter((d) => d.name !== "Total")
      .append("text")
      .attr("x", (d) => d.x1 + 5)
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-weight", "bold")
      .text((d) => `${d.name} ${d.value}€`);

    const totalValue = graph.links.reduce((sum, link) => sum + link.value, 0);

    const totalNode = graph.nodes.find((node) => node.name === "Total");

    svg
      .append("text")
      .attr("x", totalNode.x1 - 30)
      .attr("y", (totalNode.y1 + totalNode.y0) / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-weight", "bold")
      .text(`Total ${totalValue.toFixed(0)}€`);
  }, [expenses]);

  return (
    <div className="expense-tracker-container">
      <ExpenseData onSubmit={handleFormSubmit} />
      <br />
      <svg ref={svgRef} className="expense-tracker-graph"></svg>
    </div>
  );
};

export default ExpenseTracker;
