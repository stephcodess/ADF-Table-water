import React, { Component } from "react";
import Chart from "react-apexcharts";

// Define the types for your component's props
interface BarChartProps {
  barChartData: { name: string; data: number[] }[];  // Expected data format
  barChartOptions: any;  // Define options according to ApexCharts documentation
}

// Define the types for your component's state
interface BarChartState {
  chartData: { name: string; data: number[] }[];  // The data structure for the chart
  chartOptions: any;  // The options for the chart
}

class BarChart extends Component<BarChartProps, BarChartState> {
  constructor(props: BarChartProps) {
    super(props);
    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    const { barChartData, barChartOptions } = this.props;

    this.setState({
      chartData: barChartData,
      chartOptions: barChartOptions,
    });
  }

  render() {
    return (
      <Chart
        options={this.state.chartOptions}  // Chart options
        series={this.state.chartData}  // Chart data
        type="bar"  // Type of chart
        width="100%"  // Chart width
        height="100%"  // Chart height
      />
    );
  }
}

export default BarChart;
