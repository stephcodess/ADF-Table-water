import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

interface LineChartProps {
  lineChartData: { name: string; data: number[] }[];
  lineChartOptions: any;
}

const LineChart: React.FC<LineChartProps> = ({
  lineChartData,
  lineChartOptions,
}) => {
  const [chartData, setChartData] = useState<
    { name: string; data: number[] }[]
  >([]);
  const [chartOptions, setChartOptions] = useState<any>({});

  useEffect(() => {
    setChartData(lineChartData);
    setChartOptions(lineChartOptions);
  }, [lineChartData, lineChartOptions]);

  return (
    <ReactApexChart
      options={chartOptions}
      series={chartData}
      type="area"
      width="100%"
      height="100%"
    />
  );
};

export default LineChart;
