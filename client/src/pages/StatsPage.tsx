import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Distinct colors for different products lines
const COLORS = ["#2563EB", "#DC2626", "#16A34A", "#EAB308", "#9333EA"];

export default function StatsPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Call the new trends endpoint
        const res = await fetch("http://localhost:8000/api/v1/stats/trends");
        const json = await res.json();
        setChartData(json.data);
        setProducts(json.products);
      } catch (err) {
        console.error("Failed to load trends", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Tender Frequency Trends
      </h1>
      <p className="text-gray-500 mb-8">
        Analyzing <span className="font-bold">When</span> and{" "}
        <span className="font-bold">How Often</span> contracts were awarded for
        specific products.
      </p>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                padding={{ left: 20, right: 20 }}
              />

              <YAxis
                label={{
                  value: "Number of Contracts",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />

              <Legend verticalAlign="top" height={36} />

              {/* Dynamically create a Line for each Product found in the DB */}
              {products.map((productName, index) => (
                <Line
                  key={productName}
                  type="monotone" // Makes the line curved/smooth
                  dataKey={productName}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  connectNulls // Connects points even if a month has 0 data
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
        <strong>How to read this:</strong> Each line represents a product. Peaks
        indicate months with high procurement activity. This helps identify
        seasonal trends or market surges.
      </div>
    </div>
  );
}
