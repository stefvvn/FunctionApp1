import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";
import ExpenseData from "./ExpenseData";
import "./ExpenseTracker.css";

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState(null);
  const svgRef = useRef();

  const handleFormSubmit = (expenseData, income) => {
    const parsedIncome = parseFloat(income);
    if (isNaN(parsedIncome)) {
      console.error("Invalid income value");
      return;
    }

    const totalExpenses = expenseData.reduce(
      (sum, expense) => sum + (parseFloat(expense.value) || 0),
      0
    );

    const leftover = Math.max(0, parsedIncome - totalExpenses);

    setExpenses({ expenseData, income: parsedIncome, leftover });
  };

  useEffect(() => {
    if (!expenses) return;

    const { expenseData, income, leftover } = expenses;

    const data = [
      ...expenseData.map((expense) => ({
        source: "Income",
        target: expense.label,
        value: parseFloat(expense.value || 0),
      })),
      {
        source: "Income",
        target: "Leftover",
        value: leftover,
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
      new Set(data.map((d) => d.source).concat(data.map((d) => d.target)))
    ).map((name) => ({ name }));

    nodes.forEach((node) => {
      if (node.name === "Income") {
        node.x0 = 0;
        node.x1 = 150;
      } else {
        node.x0 = width - 300;
        node.x1 = width - 150;
      }
    });

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
        "#ff6600",
        "#339900",
      ]);

    const linkColor = (sourceName, targetName) => {
      if (targetName === "Leftover") {
        return "#cccccc";
      }
      return color(targetName);
    };

    svg
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .style("stroke-width", (d) => Math.max(1, d.width))
      .style("fill", "none")
      .style("stroke", (d) => linkColor(d.source.name, d.target.name))
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
      .append("text")
      .attr("x", (d) => {
        if (d.name === "Income") {
          return d.x1 + 5;
        }
        return d.x0 - 5;
      })
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", ".35em")
      .style("text-anchor", (d) => (d.name === "Income" ? "start" : "end"))
      .style("font-weight", "bold")
      .text((d) => `${d.name} ${d.value.toFixed(0)}€`);

    const incomeFormatted = income.toFixed(0);
    const leftoverFormatted = leftover.toFixed(0);

    const incomeNode = graph.nodes.find((node) => node.name === "Income");
    svg
      .append("text")
      .attr("x", incomeNode.x1 - 30)
      .attr("y", (incomeNode.y1 + incomeNode.y0) / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-weight", "bold")
      .text(`Income ${incomeFormatted}€`);

    const leftoverNode = graph.nodes.find((node) => node.name === "Leftover");
    svg
      .append("text")
      .attr("x", leftoverNode.x1 - 30)
      .attr("y", (leftoverNode.y1 + leftoverNode.y0) / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-weight", "bold");
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
