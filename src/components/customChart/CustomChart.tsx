import { useState, useEffect, useRef } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
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
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Состояния для панорамирования правой кнопкой мыши
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPixel, setPanStartPixel] = useState<number | null>(null);
  const panStartRange = useRef<{ min: number; max: number } | null>(null);

  const dataYears = data.map((d) => Number(d.year));
  const minYear = Math.min(...dataYears);
  const maxYear = Math.max(...dataYears);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartInstance.current) return;
    const xAxis = chartInstance.current.scales.x;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Если нажата левая кнопка мыши – начинаем выделение диапазона
    if (e.button === 0) {
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
    // Если нажата правая кнопка мыши – начинаем панорамирование
    else if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setPanStartPixel(x);
      // Запоминаем текущий диапазон оси X
      panStartRange.current = {
        min: typeof xAxis.min === "number" ? xAxis.min : minYear,
        max: typeof xAxis.max === "number" ? xAxis.max : maxYear,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartInstance.current) return;
    const xAxis = chartInstance.current.scales.x;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Обработка выделения левой кнопкой мыши
    if (isSelecting) {
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
    // Обработка панорамирования правой кнопкой мыши
    else if (isPanning && panStartPixel !== null && panStartRange.current) {
      // Вычисляем разницу в пикселях от начала панорамирования
      const deltaPixel = x - panStartPixel;
      // Преобразуем разницу в пикселях в разницу по значению оси
      const startValueAtPanStart = xAxis.getValueForPixel(panStartPixel);
      const currentValue = xAxis.getValueForPixel(x);

      if (startValueAtPanStart == null || currentValue == null) return;

      const valueDelta = startValueAtPanStart - currentValue;

      // Новый диапазон оси X
      const newMin = panStartRange.current.min + valueDelta;
      const newMax = panStartRange.current.max + valueDelta;

      // Обновляем масштаб графика (панорамирование)
      chartInstance.current.zoomScale("x", {
        min: newMin,
        max: newMax,
      });
    }
  };

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    // Завершаем выделение левой кнопкой мыши
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
      }
    }
    setIsSelecting(false);
    setSelection(null);

    // Завершаем панорамирование правой кнопкой мыши
    if (isPanning) {
      setIsPanning(false);
      setPanStartPixel(null);
      panStartRange.current = null;
    }
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
              // Оставляем зумирование колесиком мыши (ctrl+wheel)
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
                },
                // Панорамирование по умолчанию не будет срабатывать на левую кнопку,
                // так как мы реализуем его сами для правой кнопки мыши.
                pan: {
                  enabled: false,
                },
                limits: {
                  x: { min: minYear, max: maxYear, minRange: 3 },
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
                  callback: (value) => Number(value).toFixed(1),
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

        // Перехватываем метод draw для отрисовки выделения (при левой кнопке)
        const originalDraw = chartInstance.current.draw;
        chartInstance.current.draw = function () {
          originalDraw.call(this);
          drawSelection(this);
        };

        // Обработчик двойного клика для сброса зума
        const handleDoubleClick = () => {
          if (chartInstance.current) {
            chartInstance.current.resetZoom();
          }
        };
        ctx.canvas.ondblclick = handleDoubleClick;
        // Предотвращаем появление контекстного меню при правой кнопке мыши
        ctx.canvas.oncontextmenu = (e) => e.preventDefault();
      }
    }

    return () => {
      chartInstance.current?.destroy();
    };
  }, [data, theme, title, unit, verticalLines, highlightIntervals]);

  useEffect(() => {
    if (selection) console.log("selection", selection);
  }, [selection]);

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
          <Typography variant="caption" color="text.secondary">
            {`${data.length} точек данных`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
