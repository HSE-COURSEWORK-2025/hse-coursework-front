import { useState, useEffect, useRef } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);

interface DataPoint {
  year: string;
  value: number;
}

interface MetricCardProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  verticalLines?: string[];
  highlightIntervals?: {
    start: string;
    end: string;
  }[];
}

export const CustomChart = ({
  title,
  data,
  unit,
  verticalLines = [],
  highlightIntervals = [],
}: MetricCardProps) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomRange, setZoomRange] = useState({ start: "", end: "" });
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Исправление 1: Вернули оригинальную логику масштабирования
  const applyZoom = () => {
    if (chartInstance.current && zoomRange.start && zoomRange.end) {
      const startYear = Math.max(2000, parseInt(zoomRange.start));
      const endYear = Math.min(2050, parseInt(zoomRange.end));

      if (startYear < endYear) {
        chartInstance.current.zoomScale("x", {
          min: startYear,
          max: endYear,
        });
        setIsZoomed(true);
      }
    }
  };

  const resetZoom = () => {
    if (chartInstance.current) {
      chartInstance.current.resetZoom();
      setZoomRange({ start: "", end: "" });
      setIsZoomed(false);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setZoomRange((prev) => ({
      ...prev,
      [name]: value.replace(/[^0-9]/g, "").slice(0, 4),
    }));
  };

  // Исправление 2: Вернули оригинальную логику обработки мыши
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (chartInstance.current) {
      const xAxis = chartInstance.current.scales.x;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;

      const rawIndex = xAxis.getValueForPixel(x);
      if (rawIndex === undefined || rawIndex === null) return;

      const index = Math.round(rawIndex);
      if (index < 0 || index >= data.length) return;

      const year = data[index].year;
      const value = Number(year);

      if (!isNaN(value)) {
        setIsSelecting(true);
        setSelection({ start: value, end: value });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSelecting && chartInstance.current) {
      const xAxis = chartInstance.current.scales.x;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;

      const rawIndex = xAxis.getValueForPixel(x);
      if (rawIndex === undefined || rawIndex === null) return;

      const index = Math.round(rawIndex);
      if (index < 0 || index >= data.length) return;

      const year = data[index].year;
      const value = Number(year);

      if (!isNaN(value)) {
        setSelection((prev) => {
          if (!prev) return null;
          return { ...prev, end: value };
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selection && chartInstance.current) {
      const minDistance = 1;
      const [start, end] = [
        Math.min(selection.start, selection.end),
        Math.max(selection.start, selection.end),
      ];

      const firstYear = Number(data[0].year);
      const lastYear = Number(data[data.length - 1].year);

      const clampedStart = Math.max(firstYear, start);
      const clampedEnd = Math.min(lastYear, end);

      if (Math.abs(clampedEnd - clampedStart) >= minDistance) {
        chartInstance.current.zoomScale("x", {
          min: clampedStart,
          max: clampedEnd,
        });
        setIsZoomed(true);
        setZoomRange({
          start: String(clampedStart),
          end: String(clampedEnd),
        });
      }
    }
    setIsSelecting(false);
    setSelection(null);
  };

  const drawSelection = (chart: Chart) => {
    if (!selection || !isSelecting) return;

    const { ctx } = chart;
    const { top, bottom } = chart.chartArea;
    const xAxis = chart.scales.x;

    const start = xAxis.getPixelForValue(selection.start);
    const end = xAxis.getPixelForValue(selection.end);

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `${theme.palette.primary.main}30`;
    ctx.fillRect(start, top, end - start, bottom - top);
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(start, top, end - start, bottom - top);
    ctx.restore();
  };

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Исправление 3: Вернули оригинальные настройки плагина zoom
        const annotations = [
          ...highlightIntervals.map((interval, idx) => ({
            type: "box" as const,
            xMin: Number(interval.start),
            xMax: Number(interval.end),
            backgroundColor: `${theme.palette.error.main}33`,
            borderColor: theme.palette.error.main,
            borderWidth: 1,
            label: {
              content: `Interval ${idx + 1}`,
              display: true,
              position: "start" as const,
              color: theme.palette.text.primary,
              font: { size: 10 },
            },
          })),
          ...verticalLines.map((line, idx) => ({
            type: "line" as const,
            xMin: Number(line),
            xMax: Number(line),
            borderColor: theme.palette.error.main,
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              content: `Event ${idx + 1}`,
              position: "start" as const,
              color: theme.palette.text.primary,
              font: { size: 12 },
            },
          })),
        ];

        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((d) => d.year),
            datasets: [
              {
                label: title,
                data: data.map((d) => d.value),
                borderColor: theme.palette.primary.main,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: theme.palette.primary.main,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            transitions: {
              zoom: { animation: { duration: 300 } },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                callbacks: {
                  title: (items) => `Год: ${items[0].label}`,
                  label: (item) =>
                    `${item.dataset.label}: ${item.formattedValue} ${unit}`,
                },
              },
              zoom: {
                zoom: {
                  wheel: { enabled: true, modifierKey: "ctrl" },
                  pinch: { enabled: true },
                  drag: {
                    enabled: true,
                    modifierKey: undefined,
                    backgroundColor: `${theme.palette.primary.main}30`,
                  },
                  mode: "x",
                  onZoomComplete: ({ chart }) => setIsZoomed(true),
                },
                pan: {
                  enabled: true,
                  mode: "x",
                  modifierKey: "alt",
                },
                // Исправление 4: Вернули оригинальные лимиты
                limits: {
                  x: { min: 2000, max: 2050, minRange: 5 },
                },
              },
              annotation: { annotations },
            },
            scales: {
              x: {
                type: "linear",
                title: { display: false },
                grid: {
                  color: theme.palette.divider,
                  tickLength: 0,
                },
                ticks: {
                  color: theme.palette.text.secondary,
                  autoSkip: true,
                  maxRotation: 0,
                  callback: (value) => Number(value).toFixed(0),
                },
              },
              y: {
                title: { display: false },
                grid: {
                  color: theme.palette.divider,
                  tickLength: 0,
                },
                ticks: {
                  color: theme.palette.text.secondary,
                  padding: 8,
                },
              },
            },
          },
        });

        const originalDraw = chartInstance.current.draw;
        chartInstance.current.draw = function () {
          originalDraw.call(this);
          drawSelection(this);
        };

        const handleDoubleClick = () => resetZoom();
        ctx.canvas.ondblclick = handleDoubleClick;
        ctx.canvas.oncontextmenu = (e) => e.preventDefault();
      }
    }

    return () => {
      chartInstance.current?.destroy();
    };
  }, [data, theme, title, unit, verticalLines, highlightIntervals]);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        "&:hover": { boxShadow: theme.shadows[4] },
        position: "relative",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
            "& > *": {
              height: 36,
              fontSize: "0.875rem",
              borderRadius: "4px",
              border: `1px solid ${theme.palette.divider}`,
              padding: "0 8px",
            },
          }}
        >
          <input
            type="text"
            name="start"
            value={zoomRange.start}
            onChange={handleRangeChange}
            placeholder="Начальный год"
            style={{ width: 120 }}
          />
          <input
            type="text"
            name="end"
            value={zoomRange.end}
            onChange={handleRangeChange}
            placeholder="Конечный год"
            style={{ width: 120 }}
          />
          <Button
            onClick={applyZoom}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Применить
          </Button>
          <Button
            onClick={resetZoom}
            sx={{
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              "&:hover": { bgcolor: theme.palette.error.dark },
            }}
          >
            Сбросить
          </Button>
        </Box>

        {isZoomed && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              backgroundColor: theme.palette.background.default,
              px: 1,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            Двойной клик для сброса
          </Typography>
        )}

        <Box
          sx={{
            height: 150,
            position: "relative",
            "&:hover": { cursor: "crosshair" },
          }}
        >
          <canvas
            ref={chartRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </Box>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {unit && (
            <Typography variant="caption" color="text.secondary">
              Единицы измерения: {unit}
            </Typography>
          )}
          {/* Исправление 5: Вернули оригинальный формат подписи */}
          <Typography variant="caption" color="text.secondary">
            {`${data.length} точек данных (2000-2050)`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};